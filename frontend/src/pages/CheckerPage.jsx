import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Search, Plus, X, AlertTriangle, FileText, Activity, ShieldAlert, Save, Info } from 'lucide-react'
import GraphView from '../GraphView'
import DrugDetailsPanel from '../components/DrugDetailsPanel'
import { useAuth } from '../components/AuthContext'
import '../App.css'

function CheckerPage() {
    const { user, isSignedIn } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [selectedDrugs, setSelectedDrugs] = useState([])
    const [patientName, setPatientName] = useState('')
    const [interactions, setInteractions] = useState(null)
    const [loading, setLoading] = useState(false)
    const searchCache = useRef({})

    const [severityFilter, setSeverityFilter] = useState('All');
    const [clinicianNotes, setClinicianNotes] = useState('');
    const [isMockData, setIsMockData] = useState(false);
    const [error, setError] = useState(null); // Bug #8: user-facing error state
    const [savedProfiles, setSavedProfiles] = useState([]);
    
    // Phase 2: Interactive features
    const [selectedDrugForInfo, setSelectedDrugForInfo] = useState(null);
    const [highlightedInteractionIndex, setHighlightedInteractionIndex] = useState(null);

    // Fetch remote profiles on login
    useEffect(() => {
        if (isSignedIn && user?.id) {
            const fetchRemoteProfiles = async () => {
                try {
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    const response = await fetch(`${API_BASE_URL}/api/profiles`, {
                        headers: { 'x-user-id': user.id }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setSavedProfiles(data.profiles);
                        // Bug #6: mirror to localStorage so offline fallback stays fresh
                        localStorage.setItem('saved_patient_profiles', JSON.stringify(data.profiles));
                    }
                } catch (error) {
                    console.error("Failed to load remote profiles:", error);
                    // Fallback to local
                    setSavedProfiles(JSON.parse(localStorage.getItem('saved_patient_profiles') || '[]'));
                }
            };
            fetchRemoteProfiles();
        } else {
            setSavedProfiles(JSON.parse(localStorage.getItem('saved_patient_profiles') || '[]'));
        }
    }, [isSignedIn, user?.id]);

    useEffect(() => {
        if (location.state?.prefillDrugs && selectedDrugs.length === 0) {
            const drugsToPrefill = location.state.prefillDrugs.map(d => ({ name: d }));
            setSelectedDrugs(drugsToPrefill);
            if (location.state.patientName) {
                setPatientName(location.state.patientName);
            }

            // Trigger check if we have enough drugs after state update
            if (drugsToPrefill.length >= 2) {
                // Use a short timeout to ensure state has settled, or better:
                // rely on an effect that checks for the prefill flag
            }

            // Clear location state immediately
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, selectedDrugs.length]); // Added selectedDrugs.length to dependencies

    // Auto-trigger check ONLY when prefilled from history/global search
    useEffect(() => {
        // Use a ref to track if we already auto-checked for this specific location state
        if (selectedDrugs.length >= 2 && !interactions && location.state?.prefillDrugs) {
            checkInteractions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state?.prefillDrugs]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 1) {
                setSuggestions([])
                return
            }
            if (searchCache.current[query]) {
                setSuggestions(searchCache.current[query])
                return
            }
            let foundDrugs = [];
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/api/drugs/search?q=${query}`)
                if (response.ok) {
                    const data = await response.json()
                    foundDrugs = data.drugs || []
                } else {
                    throw new Error('Backend unavailable');
                }
            } catch (error) {
                console.log('Using local fallback for drugs');
                // Local fallback data
                const mockDatabase = [
                    { name: "Aspirin" }, { name: "Warfarin" }, { name: "Lisinopril" },
                    { name: "Ibuprofen" }, { name: "Amoxicillin" }, { name: "Omeprazole" },
                    { name: "Metformin" }, { name: "Atorvastatin" }, { name: "Sertraline" },
                    { name: "Losartan" }, { name: "Gabapentin" }, { name: "Metoprolol" }
                ];
                foundDrugs = mockDatabase.filter(d =>
                    d.name.toLowerCase().includes(query.toLowerCase())
                );
            }
            searchCache.current[query] = foundDrugs;
            setSuggestions(foundDrugs)
        }

        const timer = setTimeout(fetchSuggestions, 300)
        return () => clearTimeout(timer)
    }, [query])

    const addDrug = (drug) => {
        if (!selectedDrugs.find(d => d.name === drug.name)) {
            setSelectedDrugs([...selectedDrugs, drug])
        }
        // Don't clear query immediately if they want to add multiple? 
        // Actually, clearing query but KEEPING suggestions if they want (though empty query = empty suggestions)
        // Let's just keep the focus.
        setQuery('')
        setInteractions(null)
    }

    const removeDrug = (name) => {
        setSelectedDrugs(selectedDrugs.filter(d => d.name !== name))
        setInteractions(null)
    }

    // Real-time interaction monitoring
    useEffect(() => {
        if (selectedDrugs.length >= 2) {
            const debounceTimer = setTimeout(() => {
                checkInteractions();
            }, 600); // 600ms debounce for auto-check
            return () => clearTimeout(debounceTimer);
        } else {
            setInteractions(null);
        }
    }, [selectedDrugs]);

    const saveToHistory = (drugs, count) => {
        const historyItem = {
            drugs: drugs.map(d => d.name),
            count: count,
            patientName: patientName,
            date: new Date().toISOString()
        };

        const savedHistory = JSON.parse(localStorage.getItem('interaction_history') || '[]');
        const newHistory = [...savedHistory, historyItem].slice(-10); // Keep last 10
        localStorage.setItem('interaction_history', JSON.stringify(newHistory));
    };

    const saveProfile = async () => {
        if (!patientName.trim() || selectedDrugs.length === 0) return;
        
        const drugNames = selectedDrugs.map(d => d.name);
        
        if (isSignedIn && user?.id) {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/api/profiles`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-user-id': user.id 
                    },
                    body: JSON.stringify({ 
                        name: patientName.trim(), 
                        drugs: drugNames,
                        notes: clinicianNotes 
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    setSavedProfiles(prev => {
                        const otherItems = prev.filter(p => p.name !== data.profile.name);
                        return [data.profile, ...otherItems];
                    });
                    return;
                }
            } catch (err) {
                console.error("Failed to save remote profile:", err);
            }
        }

        // Fallback or guest mode
        const newProfile = {
            id: Date.now().toString(),
            name: patientName.trim(),
            drugs: drugNames,
            date: new Date().toISOString()
        };
        const updated = [...savedProfiles, newProfile];
        setSavedProfiles(updated);
        localStorage.setItem('saved_patient_profiles', JSON.stringify(updated));
    };

    const loadProfile = (profile) => {
        setPatientName(profile.name);
        setSelectedDrugs(profile.drugs.map(d => ({ name: d })));
        setClinicianNotes(profile.notes || '');
        setInteractions(null);
    };

    const deleteProfile = async (id) => {
        if (isSignedIn && user?.id) {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/api/profiles/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-user-id': user.id }
                });
                if (response.ok) {
                    setSavedProfiles(prev => prev.filter(p => p.id !== id));
                    return;
                }
            } catch (err) {
                console.error("Failed to delete remote profile:", err);
            }
        }

        const updated = savedProfiles.filter(p => p.id !== id);
        setSavedProfiles(updated);
        localStorage.setItem('saved_patient_profiles', JSON.stringify(updated));
    };

    const checkInteractions = async () => {
        if (selectedDrugs.length < 2) return;
        setLoading(true);
        setError(null); // Bug #8: clear previous error on each new check
        try {
            let foundInteractions = [];
            // Bug #3: track fallback via a local boolean — checking `loading` here
            // is unreliable because loading is still `true` inside the try block.
            let usedFallback = false;

            try {
                const drugNames = selectedDrugs.map(d => d.name);
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/api/interactions/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ drugs: drugNames })
                });
                if (response.ok) {
                    const data = await response.json();
                    foundInteractions = data.interactions || [];
                } else {
                    throw new Error(`Server error: ${response.status}`);
                }
            } catch (fallbackError) {
                console.warn('Backend unavailable, using offline demo data:', fallbackError);
                usedFallback = true;
                // Basic mock logic for offline demo
                if (selectedDrugs.find(d => d.name === 'Aspirin') && selectedDrugs.find(d => d.name === 'Warfarin')) {
                    foundInteractions.push({
                        drug1: 'Aspirin', drug2: 'Warfarin', severity: 'Major',
                        description: 'Increased risk of bleeding. Concurrent use of NSAIDs with anticoagulants significantly elevates severe gastrointestinal bleeding risks.'
                    });
                } else if (selectedDrugs.find(d => d.name === 'Lisinopril') && selectedDrugs.find(d => d.name === 'Ibuprofen')) {
                    foundInteractions.push({
                        drug1: 'Ibuprofen', drug2: 'Lisinopril', severity: 'Moderate',
                        description: 'NSAIDs may diminish the antihypertensive effect of ACE inhibitors and increase the risk of renal impairment.'
                    });
                } else {
                    // Bug #8: inform the user when neither real data nor a mock match is available
                    setError('Could not connect to the interaction database. Results may be incomplete.');
                }
            }

            // Bug #3: setIsMockData based on the local flag, not on `loading` or `response` state
            setIsMockData(usedFallback);
            setInteractions(foundInteractions);
            saveToHistory(selectedDrugs, foundInteractions.length);
        } catch (err) {
            console.error('Unexpected error checking interactions:', err);
            // Bug #8: surface unexpected errors to the user
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const exportToPDF = () => {
        if (!interactions) return;

        const doc = new jsPDF()

        // Title and Header
        doc.setFontSize(22)
        doc.setTextColor(13, 148, 136) // Medical Teal
        doc.text('Clinical Drug Interaction Report', 14, 22)

        doc.setFontSize(10)
        doc.setTextColor(100, 116, 139) // Slate 500
        doc.text(`Report ID: CDSR-${Math.floor(Math.random() * 900000 + 100000)}`, 14, 30)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35)

        // Context Card Background
        doc.setFillColor(248, 250, 252) // Slate 50
        doc.rect(14, 42, 182, 35, 'F')

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(15, 23, 42) // Slate 900
        doc.text('CLINICIAN INFORMATION', 20, 50)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        doc.text(`Name: Dr. ${user?.name || 'Unspecified'}`, 20, 57)
        doc.text(`Specialty: Clinical Pharmacology`, 20, 62)

        doc.setFont('helvetica', 'bold')
        doc.text('PATIENT PROFILE', 100, 50)
        doc.setFont('helvetica', 'normal')
        doc.text(`Patient: ${patientName || 'Unspecified'}`, 100, 57)

        doc.setFont('helvetica', 'bold')
        doc.text('DRUG PROFILE UNDER ANALYSIS', 100, 67)
        doc.setFont('helvetica', 'normal')
        const drugNames = selectedDrugs.map(d => d.name).join(', ')
        doc.text(drugNames, 100, 74, { maxWidth: 90 })

        // Clinician Notes Section
        if (clinicianNotes.trim()) {
            doc.setFont('helvetica', 'bold')
            doc.text('CLINICIAN OBSERVATIONS', 14, 82)
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.text(clinicianNotes, 14, 87, { maxWidth: 180 })
        }

        // Interactions Table
        const tableColumn = ["Drug Pair", "Severity", "Clinical Risk Description"];
        const tableRows = [];

        if (interactions.length === 0) {
            tableRows.push(["No Interactions Found", "-", "Based on the provided profiles, no significant clinical interactions were detected in the primary database."]);
        } else {
            interactions.forEach(interaction => {
                const severity = interaction.severity || 'Moderate';
                const rowData = [
                    `${interaction.drug1} / ${interaction.drug2}`,
                    severity.toUpperCase(),
                    interaction.description
                ];
                tableRows.push(rowData);
            });
        }

        autoTable(doc, {
            startY: clinicianNotes.trim() ? 100 : 85,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [13, 148, 136], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 50, fontStyle: 'bold' },
                1: { cellWidth: 30, halign: 'center' },
                2: { cellWidth: 'auto' }
            },
            didParseCell: function (data) {
                if (data.section === 'body' && data.column.index === 1) {
                    const val = data.cell.raw.toLowerCase();
                    if (val === 'major') data.cell.styles.textColor = [220, 38, 38];
                    if (val === 'moderate') data.cell.styles.textColor = [180, 83, 9];
                    if (val === 'minor') data.cell.styles.textColor = [22, 101, 52];
                }
            }
        });

        const finalY = doc.lastAutoTable.finalY || 150;
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text('Disclaimer: This report is for clinical decision support and should be verified with official product labeling.', 14, finalY + 20, { maxWidth: 180 });

        const fileName = `Interaction_Report_${user?.name || 'Clinical'}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    }

    return (
        <div className="animate-fade-in">
            {/* Bug #8: user-facing error banner */}
            {error && (
                <div style={{
                    padding: '0.875rem 1.25rem',
                    marginBottom: '1.5rem',
                    borderRadius: '0.75rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    fontSize: '0.9375rem',
                    fontWeight: '500'
                }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    {error}
                </div>
            )}
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="section-title"><Activity size={24} className="text-primary" /> Interaction Checker</h2>
                <p style={{ color: 'var(--text-muted)' }}>Search and select multiple drugs to assess potential clinical interactions.</p>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="search-input-wrapper" style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '1.125rem', color: 'var(--text-muted)' }}>
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a drug (e.g. Aspirin, Warfarin, Lisinopril)..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--border)',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                    {suggestions.length > 0 && (
                        <div className="card" style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 100,
                            marginTop: '0.5rem',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            padding: '0.5rem'
                        }}>
                                {suggestions.map((drug, index) => {
                                    const isSelected = selectedDrugs.some(d => d.name === drug.name);
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => !isSelected && addDrug(drug)}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '0.5rem',
                                                cursor: isSelected ? 'default' : 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                opacity: isSelected ? 0.6 : 1,
                                                background: isSelected ? 'var(--primary-light)' : 'transparent'
                                            }}
                                            className="suggestion-item"
                                        >
                                            <span style={{ fontWeight: '600' }}>{drug.name} {isSelected && '(Selected)'}</span>
                                            {isSelected ? <ShieldAlert size={16} className="text-primary" /> : <Plus size={16} className="text-muted" />}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>

            <div className="checker-layout-grid">
                <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem' }}>Visual Interaction Map</h3>
                        {interactions && <span className="badge badge-minor">{interactions.length} Links</span>}
                    </div>

                    <div style={{ flex: 1, background: '#f8fafc', borderRadius: '0.5rem', overflow: 'hidden' }}>
                        {selectedDrugs.length >= 2 ? (
                            <GraphView 
                                drugs={selectedDrugs} 
                                interactions={interactions} 
                                onDrugClick={(name) => setSelectedDrugForInfo(name)}
                                onInteractionClick={(edge) => {
                                    // Edge ID format: `e-${drug1}-${drug2}-${index}`
                                    // Bug #9: drug names can contain hyphens so split('-').pop() is unreliable.
                                    // Use the LAST segment which is always the numeric index appended at build time.
                                    const parts = edge.id.split('-');
                                    const index = parseInt(parts[parts.length - 1], 10);
                                    if (!isNaN(index)) {
                                        setHighlightedInteractionIndex(index);
                                        document.getElementById('clinical-findings')?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                            />
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                                <Activity size={48} style={{ opacity: 0.1 }} />
                                <p>Select at least 2 drugs to visualize links</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Patient Profile</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Enter Patient Name (Optional)"
                                    value={patientName}
                                    onChange={(e) => setPatientName(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid var(--border)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.9375rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    className="btn btn-ghost"
                                    onClick={saveProfile}
                                    disabled={!patientName.trim()}
                                    title="Save Patient Profile"
                                    style={{ padding: '0.75rem' }}
                                >
                                    <Save size={20} />
                                </button>
                            </div>

                            {savedProfiles.length > 0 && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                loadProfile(savedProfiles.find(p => p.id.toString() === e.target.value));
                                                e.target.value = '';
                                            }
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid var(--border)',
                                            background: 'var(--input-bg)',
                                            color: 'var(--text-main)',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <option value="">Load Saved Profile...</option>
                                        {savedProfiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.drugs.length} drugs)</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {selectedDrugs.map((drug, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem',
                                    background: 'var(--primary-light)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid #ccfbf1'
                                }}>
                                    <span style={{ fontWeight: '600', color: 'var(--primary-hover)' }}>{drug.name}</span>
                                    <button
                                        onClick={() => removeDrug(drug.name)}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--danger)', display: 'flex' }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {selectedDrugs.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                                    No medications added to current profile.
                                </p>
                            )}
                        </div>

                        {selectedDrugs.length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Clinician Notes</label>
                                <textarea
                                    placeholder="Add clinical observations or patient-specific warnings..."
                                    value={clinicianNotes}
                                    onChange={(e) => setClinicianNotes(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '100px',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid var(--border)',
                                        background: 'var(--input-bg)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.875rem',
                                        resize: 'none',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        )}

                        <button
                            className="btn btn-primary"
                            onClick={checkInteractions}
                            disabled={loading || selectedDrugs.length < 2}
                            style={{ width: '100%', marginTop: '1.5rem', padding: '0.875rem' }}
                        >
                            {loading ? 'Analyzing Clinical Risks...' : 'Check for Interactions'}
                        </button>
                    </div>

                    {interactions && (
                        <div className="card animate-fade-in" style={{ borderLeft: '4px solid var(--success)' }}>
                            <button
                                onClick={exportToPDF}
                                className="btn btn-primary"
                                style={{ width: '100%', background: 'var(--success)', gap: '0.75rem' }}
                            >
                                <FileText size={18} /> Generate Clinical Report
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {interactions !== null && (
                <div style={{ marginTop: '2.5rem' }} id="clinical-findings">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h3 className="section-title" style={{ marginBottom: 0 }}>Clinical Findings</h3>
                            {isMockData && (
                                <span className="badge badge-minor" style={{ background: '#fef3c7', color: '#92400e', textTransform: 'none', gap: '0.4rem' }}>
                                    <ShieldAlert size={14} /> Demo Mode (Offline Data)
                                </span>
                            )}
                        </div>

                        {interactions.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--card-bg)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                {['All', 'Major', 'Moderate', 'Minor'].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setSeverityFilter(filter)}
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '0.25rem',
                                            border: 'none',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            background: severityFilter === filter ? 'var(--primary)' : 'transparent',
                                            color: severityFilter === filter ? 'white' : 'var(--text-muted)'
                                        }}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="clinical-findings-grid">
                        {interactions.length > 0 ? (
                            interactions
                                .filter(interaction => severityFilter === 'All' || (interaction.severity || 'Moderate').toLowerCase() === severityFilter.toLowerCase())
                                .map((interaction, index) => {
                                    const severity = interaction.severity || 'Moderate';
                                    const severityClass = `badge-${severity.toLowerCase()}`;
                                    return (
                                        <div 
                                            key={index} 
                                            className="card" 
                                            style={{ 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                gap: '1rem', 
                                                borderTop: `4px solid ${severity === 'Major' ? 'var(--danger)' : severity === 'Moderate' ? 'var(--warning)' : 'var(--success)'}`,
                                                boxShadow: highlightedInteractionIndex === index ? '0 0 0 2px var(--primary)' : 'var(--shadow-sm)',
                                                transform: highlightedInteractionIndex === index ? 'scale(1.02)' : 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span className={`badge ${severityClass}`}>{severity}</span>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => setSelectedDrugForInfo(interaction.drug1)} className="btn-ghost" style={{ padding: '0.2rem' }} title={`Info for ${interaction.drug1}`}>
                                                        <Info size={16} />
                                                    </button>
                                                    <AlertTriangle size={18} color={severity === 'Major' ? 'var(--danger)' : 'var(--warning)'} />
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: '700', fontSize: '1.125rem' }}>
                                                {interaction.drug1} & {interaction.drug2}
                                            </div>
                                            <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                                                {interaction.description}
                                            </p>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="card" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '3rem' }}>
                                <ShieldAlert size={40} style={{ color: 'var(--success)', marginBottom: '1rem', opacity: 0.5 }} />
                                <h3>No Clinical Interactions Found</h3>
                                <p style={{ color: 'var(--text-muted)' }}>The selected drug combinations show no known significant interactions in our primary database.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedDrugForInfo && (
                <DrugDetailsPanel 
                    drugName={selectedDrugForInfo} 
                    onClose={() => setSelectedDrugForInfo(null)} 
                />
            )}
        </div>
    )
}

export default CheckerPage
