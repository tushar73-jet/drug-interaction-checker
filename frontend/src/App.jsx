import { useState, useEffect } from 'react'
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
          <h2>Interaction Graph</h2>
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
