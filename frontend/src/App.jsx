import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import './App.css'
import GraphView from './GraphView'

function App() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedDrugs, setSelectedDrugs] = useState([])
  const [interactions, setInteractions] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }
      try {
        const response = await fetch(`http://localhost:3001/api/drugs/search?q=${query}`)
        const data = await response.json()
        setSuggestions(data.drugs || [])
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      }
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

  const checkInteractions = async () => {
    if (selectedDrugs.length < 2) return
    setLoading(true)
    try {
      const drugNames = selectedDrugs.map(d => d.name)
      const response = await fetch('http://localhost:3001/api/interactions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drugs: drugNames })
      })
      const data = await response.json()
      setInteractions(data.interactions)
    } catch (error) {
      console.error('Error checking interactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    if (!interactions) return;

    const doc = new jsPDF()

    // Document Title
    doc.setFontSize(20)
    doc.text('Clinical Drug Interaction Report', 14, 22)

    // Patient/Drug Context
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32)

    const drugNames = selectedDrugs.map(d => d.name).join(', ')
    doc.text(`Patient Profile (Selected Drugs):`, 14, 42)
    doc.setFontSize(10)
    doc.text(drugNames, 14, 48, { maxWidth: 180 })

    // Interactions Table
    const tableColumn = ["Drug 1", "Drug 2", "Severity", "Risk Description"];
    const tableRows = [];

    if (interactions.length === 0) {
      tableRows.push(["-", "-", "None", "No significant interactions found between the selected drugs."]);
    } else {
      interactions.forEach(interaction => {
        const severity = interaction.severity || 'Moderate';
        const rowData = [
          interaction.drug1,
          interaction.drug2,
          severity,
          interaction.description
        ];
        tableRows.push(rowData);
      });
    }

    autoTable(doc, {
      startY: 56,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Indigo primary color matching brand
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' }
      },
      didParseCell: function (data) {
        // Color-code the severity column text
        if (data.section === 'body' && data.column.index === 2) {
          const severityStr = data.cell.raw.toLowerCase();
          if (severityStr === 'major') {
            data.cell.styles.textColor = [239, 68, 68]; // Red
            data.cell.styles.fontStyle = 'bold';
          } else if (severityStr === 'minor') {
            data.cell.styles.textColor = [16, 185, 129]; // Green
          } else if (severityStr === 'moderate') {
            data.cell.styles.textColor = [245, 158, 11]; // Orange
          }
        }
      }
    });

    const fileName = `Interaction_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  return (
    <div className="container">
      <header>
        <h1>Drug Interaction Checker</h1>
        <p>Check for potential interactions between medications.</p>
      </header>

      <div className="search-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search for a drug (e.g. Aspirin, Warfarin)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((drug, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => addDrug(drug)}
                >
                  {drug.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="selected-drugs">
        <h2>Selected Drugs</h2>
        <div className="drug-list">
          {selectedDrugs.map((drug, index) => (
            <div key={index} className="drug-tag">
              {drug.name}
              <button className="remove-btn" onClick={() => removeDrug(drug.name)}>&times;</button>
            </div>
          ))}
          {selectedDrugs.length === 0 && <p className="text-muted">No drugs selected. Search and add some above.</p>}
        </div>

        <button
          className="check-btn"
          onClick={checkInteractions}
          disabled={loading || selectedDrugs.length < 2}
        >
          {loading ? 'Checking...' : 'Check Interactions'}
        </button>
      </div>

      {interactions !== null && (
        <div className="results-section">
          <div className="results-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>Interaction Graph</h2>
            <button
              onClick={exportToPDF}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              📥 Export PDF Report
            </button>
          </div>
          <div className="graph-container" style={{ marginBottom: '2rem' }}>
            <GraphView drugs={selectedDrugs} interactions={interactions} />
          </div>

          <h2>Interaction Details</h2>
          {interactions.length > 0 ? (
            interactions.map((interaction, index) => {
              const severity = interaction.severity || 'Moderate';
              return (
                <div key={index} className={`interaction-item ${severity.toLowerCase()}`}>
                  <div className={`severity ${severity.toLowerCase()}`}>
                    {severity}
                  </div>
                  <h3>{interaction.drug1} & {interaction.drug2}</h3>
                  <p>{interaction.description}</p>
                </div>
              );
            })
          ) : (
            <div className="no-interactions">
              No significant interactions found between the selected drugs.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
