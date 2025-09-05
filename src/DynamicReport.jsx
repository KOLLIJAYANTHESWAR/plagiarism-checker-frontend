"use client"

import { useState, useEffect } from "react"
import "./report.css"

function DynamicReport({ onBack, text1 = "", text2 = "", inputMode = "text" }) {
  const [reportData, setReportData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isVisible, setIsVisible] = useState(false)

  const generateReport = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:5000/generate_report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text1: text1.trim(),
          text2: text2.trim(),
          is_code: inputMode === "code"
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Add highlighted versions if not provided by backend
      if (!data.highlighted_text1) {
        data.highlighted_text1 = highlightSimilarities(text1, text2)
      }
      if (!data.highlighted_text2) {
        data.highlighted_text2 = highlightSimilarities(text2, text1)
      }

      // Add explanation for plagiarism percentage
      data.plagiarism_explanation = generatePlagiarismExplanation(data)

      setReportData(data)
    } catch (err) {
      setError("Failed to generate report. Please check your connection and try again.")
      console.error("Error:", err)

      // Fallback with sample data for demonstration
      const fallbackData = {
        semantic_similarity: 85.4,
        lexical_similarity: 72.8,
        structural_similarity: 78.2,
        final_score: 79.6,
        status: "Plagiarised",
        highlighted_text1: highlightSimilarities(text1, text2),
        highlighted_text2: highlightSimilarities(text2, text1),
        raw_text1: text1,
        raw_text2: text2,
        plagiarism_explanation: generatePlagiarismExplanation({
          semantic_similarity: 85.4,
          lexical_similarity: 72.8,
          structural_similarity: 78.2,
          final_score: 79.6,
        }),
      }
      setReportData(fallbackData)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate explanation for plagiarism percentage
  const generatePlagiarismExplanation = (data) => {
    const reasons = []

    if (data.semantic_similarity > 80) {
      reasons.push("High semantic similarity indicates identical meaning and logic patterns")
    } else if (data.semantic_similarity > 60) {
      reasons.push("Moderate semantic similarity shows similar concepts and ideas")
    } else {
      reasons.push("Low semantic similarity suggests different approaches and concepts")
    }

    if (data.lexical_similarity > 70) {
      reasons.push("High lexical similarity reveals matching word patterns and structure")
    } else if (data.lexical_similarity > 50) {
      reasons.push("Moderate lexical similarity shows some shared vocabulary and phrasing")
    } else {
      reasons.push("Low lexical similarity indicates different word choices and expressions")
    }

    if (data.structural_similarity !== undefined) {
      if (data.structural_similarity > 75) {
        reasons.push("High structural similarity shows nearly identical organization and formatting patterns")
      } else if (data.structural_similarity > 50) {
        reasons.push("Moderate structural similarity indicates similar code/text organization approaches")
      } else {
        reasons.push("Low structural similarity suggests different organizational strategies")
      }
    }

    if (inputMode === "code") {
      if (data.final_score > 75) {
        reasons.push("Code structure, algorithms, and implementation patterns are nearly identical")
      } else if (data.final_score > 50) {
        reasons.push("Code shows similar algorithmic approaches with some variations")
      } else {
        reasons.push("Code demonstrates different implementation strategies")
      }
    } else {
      if (data.final_score > 75) {
        reasons.push("Text content and argumentation follow very similar patterns")
      } else if (data.final_score > 50) {
        reasons.push("Text shows similar themes with some unique elements")
      } else {
        reasons.push("Text demonstrates original thinking and unique perspectives")
      }
    }

    return reasons
  }

  // Simple highlighting function for fallback
  const highlightSimilarities = (text1, text2) => {
    if (!text1 || !text2) return text1

    const words1 = text1.toLowerCase().split(/\s+/)
    const words2 = text2.toLowerCase().split(/\s+/)
    const commonWords = words1.filter((word) => words2.includes(word) && word.length > 3)

    let highlighted = text1
    commonWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      highlighted = highlighted.replace(regex, `<mark>$&</mark>`)
    })

    return highlighted
  }

  const downloadReport = async () => {
    const data = reportData
    if (!data) return

    try {
      // Enhanced comprehensive text report
      const reportContent = `
CODE PLAGIARISM ANALYSIS REPORT
===============================
Generated on: ${new Date().toLocaleString()}
Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
Analysis Type: ${inputMode === "code" ? "Code Similarity Detection" : "Text Similarity Detection"}

${"=".repeat(80)}
EXECUTIVE SUMMARY
${"=".repeat(80)}

Final Plagiarism Score: ${data.final_score}%
Semantic Similarity: ${data.semantic_similarity}%
Lexical Similarity: ${data.lexical_similarity}%
${data.structural_similarity !== undefined ? `Structural Similarity: ${data.structural_similarity}%` : ""}
Status: ${data.status || "Unknown"}

Status: ${data.final_score > 45 ? "🚨 FLAGGED - High similarity detected" : "✅ CLEAR - Low similarity detected"}

VISUAL SCORE BREAKDOWN:
┌─────────────────────────┬──────────┬─────────────────────────────────────────┐
│ Analysis Type           │ Score    │ Visual Bar                              │
├─────────────────────────┼──────────┼─────────────────────────────────────────┤
│ Semantic Similarity     │ ${data.semantic_similarity.toString().padEnd(8)} │ ${"█".repeat(Math.floor(data.semantic_similarity / 2.5)).padEnd(40, "░")} │
│ Lexical Similarity      │ ${data.lexical_similarity.toString().padEnd(8)} │ ${"█".repeat(Math.floor(data.lexical_similarity / 2.5)).padEnd(40, "░")} │
${data.structural_similarity !== undefined ? `│ Structural Similarity   │ ${data.structural_similarity.toString().padEnd(8)} │ ${"█".repeat(Math.floor(data.structural_similarity / 2.5)).padEnd(40, "░")} │` : ""}
│ Final Plagiarism Score  │ ${data.final_score.toString().padEnd(8)} │ ${"█".repeat(Math.floor(data.final_score / 2.5)).padEnd(40, "░")} │
└─────────────────────────┴──────────┴─────────────────────────────────────────┘

${"=".repeat(80)}
VISUAL ANALYSIS CHARTS
${"=".repeat(80)}

PIE CHART DISTRIBUTION:
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PLAGIARISM DISTRIBUTION                            │
│                                                                             │
│                    Plagiarized: ${data.final_score}%  │  Unique: ${(100 - data.final_score).toFixed(1)}%                    │
│                                                                             │
│    ${data.final_score > 50 ? "████████████████████" : "░░░░░░░░░░░░░░░░░░░░"}  │  ${data.final_score <= 50 ? "████████████████████" : "░░░░░░░░░░░░░░░░░░░░"}    │
│    ${data.final_score > 50 ? "████████████████████" : "░░░░░░░░░░░░░░░░░░░░"}  │  ${data.final_score <= 50 ? "████████████████████" : "░░░░░░░░░░░░░░░░░░░░"}    │
│                                                                             │
│    🔴 Plagiarized Content                    🟢 Unique Content              │
└─────────────────────────────────────────────────────────────────────────────┘

${"=".repeat(80)}
WHY THIS ${inputMode.toUpperCase()} GOT ${data.final_score}% PLAGIARISM RATE
${"=".repeat(80)}

${data.plagiarism_explanation ? data.plagiarism_explanation.map((reason, index) => `${index + 1}. ${reason}`).join("\n\n") : ""}

${"=".repeat(80)}
${inputMode.toUpperCase()} COMPARISON ANALYSIS
${"=".repeat(80)}

┌─────────────────────────────────────────────────────────────────────────────┐
│                          SIDE-BY-SIDE COMPARISON                            │
└─────────────────────────────────────────────────────────────────────────────┘

ORIGINAL ${inputMode.toUpperCase()} (SOURCE):
${"─".repeat(80)}
${(data.raw_text1 || text1).substring(0, 2000)}${(data.raw_text1 || text1).length > 2000 ? "\n\n[Content truncated - Full content available in web interface]" : ""}

SUBMITTED ${inputMode.toUpperCase()} (TARGET):
${"─".repeat(80)}
${(data.raw_text2 || text2).substring(0, 2000)}${(data.raw_text2 || text2).length > 2000 ? "\n\n[Content truncated - Full content available in web interface]" : ""}

${"=".repeat(80)}
TECHNICAL ANALYSIS & RECOMMENDATIONS
${"=".repeat(80)}

DETECTION METHODOLOGY:
┌─────────────────────────────────────────────────────────────────────────────┐
│ • Semantic Analysis: Understands meaning and logic behind the ${inputMode}        │
│ • Lexical Analysis: Compares syntax patterns, variable names, and structure │
│ • Similarity Highlighting: Marks matching sections for identification      │
│ • Final Score: Weighted combination of all analysis methods                │
└─────────────────────────────────────────────────────────────────────────────┘

PROFESSIONAL RECOMMENDATIONS:
┌─────────────────────────────────────────────────────────────────────────────┐
│ ${
        data.final_score > 75
          ? "🚨 CRITICAL: Extensive similarities detected - requires immediate review"
          : data.final_score > 45
            ? "⚠️  WARNING: Moderate similarities found - consider revision"
            : "✅ ACCEPTABLE: Low similarity levels - content appears original"
      }        │
└─────────────────────────────────────────────────────────────────────────────┘

End of Report
${"=".repeat(80)}
    `

      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${inputMode === "code" ? "Code" : "Text"}-Plagiarism-Report-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Report generation failed:", err)
      alert("Failed to generate report. Please try again.")
    }
  }

  const goBack = () => {
    if (onBack) {
      onBack()
    } else {
      window.history.back()
    }
  }

  useEffect(() => {
    if (text1 && text2) {
      generateReport()
    }
    setIsVisible(true)
  }, [text1, text2])

  const ScoreCard = ({ title, score, color, delay = 0 }) => (
    <div className="score-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="score-card-inner">
        <div className="score-header">
          <h3>{title}</h3>
          <div className="score-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
        </div>
        <div className="score-value" style={{ color }}>
          {score}%
        </div>
        <div className="score-bar">
          <div className="score-fill" style={{ width: `${score}%`, backgroundColor: color }}></div>
        </div>
        <div className="score-glow" style={{ backgroundColor: color }}></div>
      </div>
    </div>
  )

  const BarChart = () => {
    const data = reportData
    if (!data) return null

    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>Similarity Analysis</h3>
          <div className="chart-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
            </svg>
          </div>
        </div>
        <div className="bar-chart">
          <div className="bar-item" style={{ animationDelay: "200ms" }}>
            <div className="bar-label">Semantic Similarity</div>
            <div className="bar-track">
              <div className="bar-fill semantic" style={{ width: `${data.semantic_similarity}%` }}>
                <div className="bar-shimmer"></div>
              </div>
            </div>
            <div className="bar-value">{data.semantic_similarity}%</div>
          </div>
          <div className="bar-item" style={{ animationDelay: "400ms" }}>
            <div className="bar-label">Lexical Similarity</div>
            <div className="bar-track">
              <div className="bar-fill lexical" style={{ width: `${data.lexical_similarity}%` }}>
                <div className="bar-shimmer"></div>
              </div>
            </div>
            <div className="bar-value">{data.lexical_similarity}%</div>
          </div>
          {data.structural_similarity !== undefined && (
            <div className="bar-item" style={{ animationDelay: "500ms" }}>
              <div className="bar-label">Structural Similarity</div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${data.structural_similarity}%`, backgroundColor: "#06ffa5" }}
                >
                  <div className="bar-shimmer"></div>
                </div>
              </div>
              <div className="bar-value">{data.structural_similarity}%</div>
            </div>
          )}
          <div className="bar-item" style={{ animationDelay: "600ms" }}>
            <div className="bar-label">Final Score</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${data.final_score}%`, backgroundColor: "#ff073a" }}>
                <div className="bar-shimmer"></div>
              </div>
            </div>
            <div className="bar-value">{data.final_score}%</div>
          </div>
        </div>
      </div>
    )
  }

  const PieChart = () => {
    const data = reportData
    if (!data) return null

    // Calculate percentages that add up to 100%
    const finalPercent = data.final_score
    const uniquePercent = Math.max(0, 100 - finalPercent)

    // Calculate angles (360 degrees total)
    const finalAngle = (finalPercent / 100) * 360

    const createArc = (startAngle, endAngle, radius = 120) => {
      const start = polarToCartesian(150, 150, radius, startAngle - 90)
      const end = polarToCartesian(150, 150, radius, endAngle - 90)

      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"

      if (endAngle - startAngle === 360) {
        // Full circle
        return `M 150,30 A 120,120 0 1,1 149.9,30 Z`
      }

      return `M 150,150 L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArcFlag},1 ${end.x},${end.y} Z`
    }

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      }
    }

    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>Plagiarism Distribution</h3>
          <div className="chart-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
        </div>
        <div className="pie-chart-container">
          <div className="pie-chart">
            <svg width="300" height="300" viewBox="0 0 300 300">
              {/* Plagiarized portion */}
              <path
                d={createArc(0, finalAngle)}
                fill="var(--accent-red)"
                opacity="0.8"
                stroke="var(--bg-primary)"
                strokeWidth="2"
              />
              {/* Unique portion */}
              <path
                d={createArc(finalAngle, 360)}
                fill="var(--accent-green)"
                opacity="0.6"
                stroke="var(--bg-primary)"
                strokeWidth="2"
              />
              {/* Center circle with score */}
              <circle cx="150" cy="150" r="50" fill="var(--bg-primary)" stroke="var(--border)" strokeWidth="2" />

              {/* Group that reverses the rotation */}
              <g transform="rotate(90, 150, 150)">
                <text x="150" y="145" textAnchor="middle" fill="var(--text-primary)" fontSize="20" fontWeight="bold">
                  {finalPercent}%
                </text>
                <text x="150" y="165" textAnchor="middle" fill="var(--text-secondary)" fontSize="12">
                  Plagiarized
                </text>
              </g>
            </svg>
          </div>
        </div>
        <div className="pie-chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "var(--accent-red)" }}></div>
            <span>Plagiarized ({finalPercent}%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: "var(--accent-green)", opacity: 0.6 }}></div>
            <span>Unique ({uniquePercent.toFixed(1)}%)</span>
          </div>
        </div>

        {/* Additional breakdown */}
        <div
          style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}
        >
          <h4 style={{ color: "var(--text-primary)", marginBottom: "1rem", fontSize: "0.9rem" }}>
            Similarity Breakdown:
          </h4>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span>Semantic: {data.semantic_similarity}%</span>
            <span>Lexical: {data.lexical_similarity}%</span>
            {data.structural_similarity !== undefined && <span>Structural: {data.structural_similarity}%</span>}
            <span>Combined: {finalPercent}%</span>
          </div>
        </div>
      </div>
    )
  }

  const data = reportData

  return (
    <div className={`report-container ${isVisible ? "visible" : ""}`}>
      {/* Animated Background */}
      <div className="background-grid"></div>
      <div className="background-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Header */}
      <header className="report-header">
        <div className="header-content">
          <button className="action-btn back-btn" onClick={goBack}>
            <div className="btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </div>
            <span>Back</span>
            <div className="btn-glow"></div>
          </button>

          <div className="header-title">
            <h1>{inputMode === "code" ? "Code" : "Text"} Plagiarism Report</h1>
            <div className="title-underline"></div>
          </div>

          <button className="action-btn download-btn" onClick={downloadReport}>
            <div className="btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <span>Download Report</span>
            <div className="btn-glow"></div>
          </button>
        </div>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <p>Analyzing {inputMode === "code" ? "code" : "text"} patterns...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <div className="error-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      {data && (
        <main className="report-content">
          {/* Side-by-Side Code/Text Comparison */}
          <section className="code-comparison">
            <div className="section-header">
              <h2>Side-by-Side {inputMode === "code" ? "Code" : "Text"} Comparison</h2>
              <div className="section-line"></div>
            </div>

            <div className="code-panels">
              <div className="code-panel">
                <div className="panel-header">
                  <h3>✅ Original {inputMode === "code" ? "Code" : "Text"}</h3>
                  <div className="panel-badge original">Source</div>
                </div>
                <div className="code-block">
                  <pre>
                    <code dangerouslySetInnerHTML={{ __html: data.highlighted_text1 || text1 }} />
                  </pre>
                </div>
              </div>

              <div className="code-panel">
                <div className="panel-header">
                  <h3>✅ {inputMode === "code" ? "GitHub Match" : "Submitted Text"}</h3>
                  <div className="panel-badge submitted">Target</div>
                </div>
                <div className="code-block">
                  <pre>
                    <code dangerouslySetInnerHTML={{ __html: data.highlighted_text2 || text2 }} />
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Similarity Summary */}
          <section className="scores-section">
            <div className="section-header">
              <h2>Plagiarism Analysis Summary</h2>
              <div className="section-line"></div>
            </div>
            <div className="scores-grid">
              <ScoreCard title="Semantic Similarity" score={data.semantic_similarity} color="#00d4ff" delay={100} />
              <ScoreCard title="Lexical Similarity" score={data.lexical_similarity} color="#8b5cf6" delay={200} />
              <ScoreCard
                title="Structural Similarity"
                score={data.structural_similarity || 0}
                color="#06ffa5"
                delay={250}
              />
              <ScoreCard title="Final Plagiarism Score" score={data.final_score} color="#ff073a" delay={300} />
            </div>
          </section>

          {/* Charts */}
          <section className="chart-section">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <BarChart />
              <PieChart />
            </div>
          </section>

          {/* Why This Got X% Plagiarism Rate */}
          {data.plagiarism_explanation && (
            <section className="summary-section">
              <div className="summary-card">
                <div className="summary-header">
                  <h3>
                    Why This {inputMode === "code" ? "Code" : "Text"} Got {data.final_score}% Plagiarism Rate
                  </h3>
                  <div className="summary-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                </div>
                <div className="summary-content">
                  <div className="findings-grid">
                    {data.plagiarism_explanation.map((reason, index) => (
                      <div key={index} className="finding-item">
                        <div className="finding-icon">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Analysis Summary */}
          <section className="summary-section">
            <div className="summary-card">
              <div className="summary-header">
                <h3>Detailed Analysis Summary</h3>
                <div className="summary-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                </div>
              </div>
              <div className="summary-content">
                <p>
                  <strong>Detection Method:</strong> This analysis combines semantic understanding with lexical pattern
                  matching {inputMode === "code" ? "and structural code analysis " : ""}to provide a comprehensive
                  similarity assessment.
                </p>
                <p>
                  <strong>Results:</strong> The analysis reveals a <strong>{data.final_score}% similarity</strong>{" "}
                  between the original and {inputMode === "code" ? "GitHub-matched" : "submitted"} {inputMode}. This
                  score combines semantic understanding ({data.semantic_similarity}%) with lexical pattern matching (
                  {data.lexical_similarity}%)
                  {data.structural_similarity !== undefined ? ` and structural analysis (${data.structural_similarity}%)` : ""}.
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {data.status === "Original" ? (
                    <span style={{ color: "#06ffa5", fontWeight: "bold" }}>✅ ORIGINAL - Content appears unique</span>
                  ) : (
                    <span style={{ color: "#ff073a", fontWeight: "bold" }}>🚨 PLAGIARISED - High similarity detected</span>
                  )}
                </p>

                <div
                  style={{
                    marginTop: "2rem",
                    padding: "1.5rem",
                    background: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <h4 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>How Detection Works:</h4>
                  <ul style={{ listStyle: "none", padding: 0, color: "var(--text-secondary)" }}>
                    <li style={{ marginBottom: "0.5rem" }}>
                      • <strong>Semantic Analysis:</strong> Understands the meaning and logic behind the {inputMode}
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                      • <strong>Lexical Analysis:</strong> Compares{" "}
                      {inputMode === "code"
                        ? "syntax patterns, variable names, and structure"
                        : "vocabulary patterns, word usage, and structure"}
                    </li>
                    {data.structural_similarity !== undefined && (
                      <li style={{ marginBottom: "0.5rem" }}>
                        • <strong>Structural Analysis:</strong> Examines{" "}
                        {inputMode === "code"
                          ? "code organization and flow patterns"
                          : "text organization and formatting patterns"}
                      </li>
                    )}
                    <li style={{ marginBottom: "0.5rem" }}>
                      • <strong>Similarity Highlighting:</strong> Marks matching sections for easy identification
                    </li>
                    <li>
                      • <strong>Final Score:</strong> Weighted combination of all analysis methods
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}

export default DynamicReport
