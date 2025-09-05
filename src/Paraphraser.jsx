"use client"

import { useState, useCallback } from "react"
import "./Paraphraser.css"

function Paraphraser() {
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState("")
  const [wordLimitReached, setWordLimitReached] = useState(false)

  const getWordCount = useCallback((text) => {
    if (!text.trim()) return 0
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }, [])

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value
    const words = newValue
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)

    if (words.length <= 50) {
      setInputText(newValue)
      setWordLimitReached(false)
      setError("")
    } else {
      setWordLimitReached(true)
    }
  }, [])

  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      setError("Please enter a sentence to paraphrase.")
      return
    }

    setIsLoading(true)
    setError("")
    setResults(null)

    try {
      const response = await fetch("http://localhost:5000/paraphrase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error("Paraphrase error:", err)
      setError("Failed to generate paraphrases. Please try again.")

      // Fallback with dummy data for demo
      const fallbackData = {
        input: inputText.trim(),
        paraphrases: [
          { paraphrase: "What's the best way to master Python programming?", score: 85 },
          { paraphrase: "How do I get started with learning Python?", score: 78 },
          { paraphrase: "What are effective methods for Python learning?", score: 72 },
          { paraphrase: "How can one acquire Python programming skills?", score: 68 },
          { paraphrase: "What's the process for studying Python?", score: 65 },
        ],
      }
      setResults(fallbackData)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setInputText("")
    setResults(null)
    setError("")
    setWordLimitReached(false)
  }

  const wordCount = getWordCount(inputText)

  return (
    <div className="paraphraser-container">
      {/* Header */}
      <div className="paraphraser-header">
        <div className="header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
        </div>
        <div className="header-content">
          <h2 className="paraphraser-title">AI Paraphraser</h2>
          <p className="paraphraser-subtitle">Transform your sentences with intelligent rewording</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="paraphraser-input-section">
        <div className="input-card">
          <label className="input-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
            Enter Your Sentence
          </label>
          <textarea
            className="paraphraser-textarea"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type a sentence you want to paraphrase..."
            rows={4}
            aria-describedby="word-count-paraphraser"
          />
          <div className="word-counter" id="word-count-paraphraser">
            <span className={wordCount > 45 ? "warning" : ""}>{wordCount}/50 words</span>
            {wordLimitReached && <span className="limit-warning"> - Word limit reached!</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="paraphraser-actions">
          <button
            className={`paraphraser-button ${isLoading ? "loading" : ""}`}
            onClick={handleParaphrase}
            disabled={isLoading || !inputText.trim()}
            type="button"
          >
            <div className="button-content">
              {isLoading ? (
                <>
                  <div className="ai-spinner"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                  <span>Paraphrase</span>
                </>
              )}
            </div>
            <div className="button-glow"></div>
          </button>

          {(results || error) && (
            <button className="reset-button" onClick={handleReset} type="button">
              <div className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </div>
              <span>Reset</span>
              <div className="btn-glow"></div>
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-alert" role="alert">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="paraphraser-results">
          <div className="results-header">
            <h3 className="results-title">Generated Paraphrases</h3>
            <div className="results-count">{results.paraphrases?.length || 0} variations</div>
          </div>

          <div className="original-text">
            <div className="original-label">Original:</div>
            <div className="original-content">{results.input}</div>
          </div>

          <div className="paraphrases-list">
            {results.paraphrases?.map((item, index) => (
              <div key={index} className="paraphrase-item" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="paraphrase-content">
                  <div className="paraphrase-text">{item.paraphrase}</div>
                  <div className="paraphrase-score">
                    <div className="score-label">Quality</div>
                    <div className="score-value">{item.score}%</div>
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{
                          width: `${item.score}%`,
                          backgroundColor: item.score >= 80 ? "#06ffa5" : item.score >= 60 ? "#00d4ff" : "#8b5cf6",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <button
                  className="copy-button"
                  onClick={() => navigator.clipboard.writeText(item.paraphrase)}
                  title="Copy to clipboard"
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Paraphraser
