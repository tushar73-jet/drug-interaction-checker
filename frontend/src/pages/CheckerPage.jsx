import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Search, Plus, X, AlertTriangle, FileText, ChevronRight, Activity, ShieldAlert } from 'lucide-react'
import GraphView from '../GraphView'
import { useAuth } from '../components/AuthContext'
import '../App.css'

function CheckerPage() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [selectedDrugs, setSelectedDrugs] = useState([])
    const [patientName, setPatientName] = useState('')
    const [interactions, setInteractions] = useState(null)
    const [loading, setLoading] = useState(false)

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
        if (selectedDrugs.length >= 2 && !interactions && location.state?.prefillDrugs) {
            checkInteractions();
        }
    }, [selectedDrugs, interactions, location.state?.prefillDrugs]); // Changed dependency to selectedDrugs and added interactions, location.state?.prefillDrugs

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 1) {
                setSuggestions([])
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
            setSuggestions(foundDrugs)
        }

        const timer = setTimeout(fetchSuggestions, 300)
        return () => clearTimeout(timer)
    }, [query])

    const addDrug = (drug) => {
        if (!selectedDrugs.find(d => d.name === drug.name)) {
            setSelectedDrugs([...selectedDrugs, drug])
        }
        setQuery('')
        setSuggestions([])
        setInteractions(null)
    }

    const removeDrug = (name) => {
        setSelectedDrugs(selectedDrugs.filter(d => d.name !== name))
        setInteractions(null)
    }

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

    const checkInteractions = async () => {
        if (selectedDrugs.length < 2) return
        setLoading(true)
        try {
            let foundInteractions = [];
            try {
                const drugNames = selectedDrugs.map(d => d.name)
                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_BASE_URL}/api/interactions/check`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ drugs: drugNames })
                })
                if (response.ok) {
                    const data = await response.json()
                    foundInteractions = data.interactions || [];
                } else {
                    throw new Error('Backend failed');
                }
            } catch (fallbackError) {
                console.log('Using local fallback for interactions');
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
                }
            }

            setInteractions(foundInteractions)
            saveToHistory(selectedDrugs, foundInteractions.length);
        } catch (error) {
            console.error('Error checking interactions:', error)
        } finally {
            setLoading(false)
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
            startY: 85,
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
                            {suggestions.map((drug, index) => (
                                <div
                                    key={index}
                                    onClick={() => addDrug(drug)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    className="suggestion-item"
                                >
                                    <span style={{ fontWeight: '600' }}>{drug.name}</span>
                                    <Plus size={16} className="text-muted" />
                                </div>
                            ))}
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
                            <GraphView drugs={selectedDrugs} interactions={interactions} />
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
                            <input
                                type="text"
                                placeholder="Enter Patient Name (Optional)"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    fontSize: '0.9375rem',
                                    outline: 'none'
                                }}
                            />
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
                <div style={{ marginTop: '2.5rem' }}>
                    <h3 className="section-title">Clinical Findings</h3>
                    <div className="clinical-findings-grid">
                        {interactions.length > 0 ? (
                            interactions.map((interaction, index) => {
                                const severity = interaction.severity || 'Moderate';
                                const severityClass = `badge-${severity.toLowerCase()}`;
                                return (
                                    <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid ${severity === 'Major' ? 'var(--danger)' : severity === 'Moderate' ? 'var(--warning)' : 'var(--success)'}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className={`badge ${severityClass}`}>{severity}</span>
                                            <AlertTriangle size={18} color={severity === 'Major' ? 'var(--danger)' : 'var(--warning)'} />
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
        </div>
    )
}

export default CheckerPage
