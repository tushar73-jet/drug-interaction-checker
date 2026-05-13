import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Search, Plus, X, AlertTriangle, FileText, Activity, ShieldAlert, Save, Info, Sparkles, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react'
import GraphView from '../GraphView'
import DrugDetailsPanel from '../components/DrugDetailsPanel'
import { useAuth } from '../components/AuthContext'
import '../App.css'

function CheckerPage() {
    const { user, isSignedIn, getToken } = useAuth();
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
    const [error, setError] = useState(null);
    const [savedProfiles, setSavedProfiles] = useState([]);

    // Phase 2: Interactive features
    const [selectedDrugForInfo, setSelectedDrugForInfo] = useState(null);
    const [highlightedInteractionIndex, setHighlightedInteractionIndex] = useState(null);

    // Phase 3: AI Explain — per-interaction state map keyed by "drug1|drug2"
    // Each entry: { loading, explanation, citations, error, open }
    const [explainStates, setExplainStates] = useState({});

    // Fetch remote profiles on login
    useEffect(() => {
        if (isSignedIn && user?.id) {
            const controller = new AbortController();

            const fetchRemoteProfiles = async () => {
                try {
                    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
                    const token = await getToken();
                    const response = await fetch(`${API_BASE_URL}/api/v1/profiles`, {
                        headers: { 
                            'Authorization': `Bearer ${token}`
                        },
                        signal: controller.signal
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const profiles = data.data?.profiles || [];
                        setSavedProfiles(profiles);
                        // Keep localStorage in sync so the offline fallback always has fresh data.
                        localStorage.setItem('saved_patient_profiles', JSON.stringify(profiles));
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error("Failed to load remote profiles:", error);
                        setSavedProfiles(JSON.parse(localStorage.getItem('saved_patient_profiles') || '[]'));
                    }
                }
            };

            fetchRemoteProfiles();

            return () => controller.abort();
        } else {
            setSavedProfiles(JSON.parse(localStorage.getItem('saved_patient_profiles') || '[]'));
        }
    }, [isSignedIn, user?.id, getToken]);

    useEffect(() => {
        if (location.state?.prefillDrugs && selectedDrugs.length === 0) {
            const drugsToPrefill = location.state.prefillDrugs.map(d => ({ name: d }));
            setSelectedDrugs(drugsToPrefill);
            if (location.state.patientName) {
                setPatientName(location.state.patientName);
            }
            // Clear location state so navigating back here doesn't re-prefill
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate, selectedDrugs.length]);

    // When drugs arrive via history/global-search navigation, run the check automatically.
    // This effect intentionally omits checkInteractions from its deps to avoid re-running
    // on every render — it should only fire when the prefill source changes.
    useEffect(() => {
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
                const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
                const response = await fetch(`${API_BASE_URL}/api/v1/drugs/search?q=${encodeURIComponent(query)}`)
                if (response.ok) {
                    const data = await response.json()
                    foundDrugs = data.data?.drugs || []
                } else {
                    throw new Error('Backend unavailable');
                }
            } catch (err) {
                console.log('Using local fallback for drugs', err);
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
    }, [query]);

    const addDrug = (drug) => {
        if (!selectedDrugs.find(d => d.name === drug.name)) {
            setSelectedDrugs([...selectedDrugs, drug])
        }
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
    }, [selectedDrugs]); // eslint-disable-line react-hooks/exhaustive-deps

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
                const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
                const token = await getToken();
                const response = await fetch(`${API_BASE_URL}/api/v1/profiles`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: patientName.trim(),
                        drugs: drugNames,
                        notes: clinicianNotes
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    const newProfile = data.data?.profile;
                    if (newProfile) {
                        setSavedProfiles(prev => {
                            const otherItems = prev.filter(p => p.name !== newProfile.name);
                            return [newProfile, ...otherItems];
                        });
                        setPatientName('');
                        return;
                    }
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

    const checkInteractions = async () => {
        if (selectedDrugs.length < 2) return;
        setLoading(true);
        setError(null);

        // Cancel any in-flight request if the user adds/removes drugs before it resolves.
        const controller = new AbortController();

        try {
            let foundInteractions = [];
            // Track fallback usage via a local boolean: `loading` is still true
            // at this point in the call stack, so reading it here is unreliable.
            let usedFallback = false;

            try {
                const drugNames = selectedDrugs.map(d => d.name);
                const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
                const response = await fetch(`${API_BASE_URL}/api/v1/interactions/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ drugs: drugNames }),
                    signal: controller.signal
                });
                if (response.ok) {
                    const data = await response.json();
                    foundInteractions = data.data?.interactions || [];
                } else {
                    throw new Error(`Server error: ${response.status}`);
                }
            } catch (fallbackError) {
                if (fallbackError.name === 'AbortError') return;
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
                    setError('Could not connect to the interaction database. Results may be incomplete.');
                }
            }

            // Reflect offline mode in the UI after the inner try/catch resolves.
            setIsMockData(usedFallback);
            setInteractions(foundInteractions);
            saveToHistory(selectedDrugs, foundInteractions.length);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Unexpected error checking interactions:', err);
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    // ---------------------------------------------------------------------------
    // AI Explain
    // ---------------------------------------------------------------------------
    const explainInteraction = async (interaction) => {
        const key = `${interaction.drug1}|${interaction.drug2}`;

        // Toggle closed if already open and loaded
        if (explainStates[key]?.open && explainStates[key]?.explanation) {
            setExplainStates(prev => ({
                ...prev,
                [key]: { ...prev[key], open: false }
            }));
            return;
        }

        // If already loaded, just re-open
        if (explainStates[key]?.explanation) {
            setExplainStates(prev => ({
                ...prev,
                [key]: { ...prev[key], open: true }
            }));
            return;
        }

        // Start loading
        setExplainStates(prev => ({
            ...prev,
            [key]: { loading: true, explanation: null, citations: [], error: null, open: true }
        }));

        try {
            const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
            const response = await fetch(`${API_BASE_URL}/api/v1/interactions/explain`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    drug1: interaction.drug1,
                    drug2: interaction.drug2,
                    description: interaction.description
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Server error ${response.status}`);
            }

            const data = await response.json();
            setExplainStates(prev => ({
                ...prev,
                [key]: {
                    loading: false,
                    explanation: data.data?.explanation || 'No explanation available.',
                    citations: data.data?.citations || [],
                    error: null,
                    open: true
                }
            }));
        } catch (err) {
            setExplainStates(prev => ({
                ...prev,
                [key]: {
                    loading: false,
                    explanation: null,
                    citations: [],
                    error: err.message || 'Failed to fetch AI explanation.',
                    open: true
                }
            }));
        }
    };

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
                const key = `${interaction.drug1}|${interaction.drug2}`;
                const aiExplain = explainStates[key];
                let descriptionText = interaction.description;
                if (aiExplain?.explanation) {
                    descriptionText += `\n\nAI Analysis:\n${aiExplain.explanation}`;
                    if (aiExplain.citations?.length > 0) {
                        descriptionText += `\n\nSources:\n${aiExplain.citations.map((c, i) => `[${i+1}] ${c.title}: ${c.url}`).join('\n')}`;
                    }
                }
                const rowData = [
                    `${interaction.drug1} / ${interaction.drug2}`,
                    severity.toUpperCase(),
                    descriptionText
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

            <div className="surface-card" style={{ marginBottom: '2rem' }}>
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
                <div className="surface-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
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
                                    // Edge IDs are formatted as `e-${drug1}-${drug2}-${index}`.
                                    // Drug names may contain hyphens, so read the index from the last segment only.
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
                    <div className="surface-card">
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

                                                            {savedProfiles && savedProfiles.length > 0 && (
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
                        <div className="surface-card animate-fade-in" style={{ borderLeft: '10px solid hsl(var(--success))', padding: '1.5rem' }}>
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
                                    return (
                                        <div 
                                            key={index} 
                                            className="surface-card" 
                                            style={{ 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                gap: '1rem', 
                                                borderTop: `6px solid ${severity === 'Major' ? 'hsl(var(--destructive))' : severity === 'Moderate' ? 'hsl(var(--warning))' : 'hsl(var(--success))'}`,
                                                boxShadow: highlightedInteractionIndex === index ? '0 0 0 3px hsl(var(--primary))' : 'var(--shadow)',
                                                transform: highlightedInteractionIndex === index ? 'scale(1.03)' : 'none',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span className={`accessible-chip ${severity.toLowerCase()}`}>{severity}</span>
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

                                            {/* AI Explain Button & Panel */}
                                            {(() => {
                                                const key = `${interaction.drug1}|${interaction.drug2}`;
                                                const es = explainStates[key];
                                                return (
                                                    <>
                                                        <button
                                                            className="btn-explain"
                                                            onClick={() => explainInteraction(interaction)}
                                                            disabled={es?.loading}
                                                            style={{ marginTop: '0.5rem' }}
                                                        >
                                                            {es?.loading ? (
                                                                <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Researching...</>
                                                            ) : es?.explanation ? (
                                                                es.open ? <><ChevronUp size={14} /> Hide AI Analysis</> : <><ChevronDown size={14} /> Show AI Analysis</>
                                                            ) : (
                                                                <><Sparkles size={14} /> Explain This Interaction</>
                                                            )}
                                                        </button>

                                                        {es?.open && (
                                                            <div className="ai-explain-panel">
                                                                <div className="ai-explain-header" onClick={() => explainInteraction(interaction)}>
                                                                    <span className="ai-explain-title">
                                                                        <Sparkles size={15} />
                                                                        AI Clinical Analysis · Worko Research Assistant
                                                                    </span>
                                                                    {es?.loading ? null : es?.open ? <ChevronUp size={16} color="hsl(175,84%,32%)" /> : <ChevronDown size={16} color="hsl(175,84%,32%)" />}
                                                                </div>

                                                                <div className="ai-explain-body">
                                                                    {es?.loading && (
                                                                        <>
                                                                            <div className="ai-skeleton" style={{ height: '14px', marginBottom: '8px', width: '92%' }} />
                                                                            <div className="ai-skeleton" style={{ height: '14px', marginBottom: '8px', width: '85%' }} />
                                                                            <div className="ai-skeleton" style={{ height: '14px', marginBottom: '8px', width: '96%' }} />
                                                                            <div className="ai-skeleton" style={{ height: '14px', marginBottom: '8px', width: '78%' }} />
                                                                            <div className="ai-skeleton" style={{ height: '14px', width: '60%' }} />
                                                                        </>
                                                                    )}

                                                                    {es?.error && (
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontSize: '0.875rem', padding: '0.5rem' }}>
                                                                            <AlertTriangle size={15} />
                                                                            {es.error}
                                                                            <button
                                                                                className="btn-explain"
                                                                                onClick={() => {
                                                                                    setExplainStates(prev => ({ ...prev, [key]: undefined }));
                                                                                    setTimeout(() => explainInteraction(interaction), 50);
                                                                                }}
                                                                                style={{ marginLeft: 'auto', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent' }}
                                                                            >
                                                                                <RefreshCw size={12} /> Retry
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    {es?.explanation && (
                                                                        <>
                                                                            <p className="ai-explanation-text">{es.explanation}</p>

                                                                            {es.citations?.length > 0 && (
                                                                                <div className="ai-citations">
                                                                                    <div className="ai-citations-title">📚 Sources ({es.citations.length})</div>
                                                                                    <div className="citation-list">
                                                                                        {es.citations.map((c, ci) => (
                                                                                            <div key={ci} className="citation-item">
                                                                                                <span className="citation-number">{ci + 1}</span>
                                                                                                <a
                                                                                                    href={c.url}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="citation-link"
                                                                                                    title={c.snippet}
                                                                                                >
                                                                                                    {c.title}
                                                                                                    <ExternalLink size={10} style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }} />
                                                                                                </a>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="surface-card" style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '3rem' }}>
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
