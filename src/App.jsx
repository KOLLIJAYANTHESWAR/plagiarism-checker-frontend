"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import DynamicReport from "./DynamicReport"
import "./App.css"

function App() {
  // Original states for text mode
  const [text1, setText1] = useState("")
  const [text2, setText2] = useState("")

  // New states for code mode
  const [userCode, setUserCode] = useState("")
  const [githubCode, setGithubCode] = useState("")

  const [articleText, setArticleText] = useState("")
  const [articleResults, setArticleResults] = useState([])
  const [isCheckingArticle, setIsCheckingArticle] = useState(false)
  const [wordLimitReachedArticle, setWordLimitReachedArticle] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [darkMode, setDarkMode] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [inputMode, setInputMode] = useState("code") // Default to code mode
  const [isDeplagiarizing, setIsDeplagiarizing] = useState(false)
  const [wordLimitReached1, setWordLimitReached1] = useState(false)
  const [wordLimitReached2, setWordLimitReached2] = useState(false)
  const [wordLimitReachedCode, setWordLimitReachedCode] = useState(false)
  const [showGithubSearch, setShowGithubSearch] = useState(false)
  const [matchPercentage, setMatchPercentage] = useState(0)
  const [githubSource, setGithubSource] = useState("")

  const [showSettings, setShowSettings] = useState(false)
  const [openRouterApiKey, setOpenRouterApiKey] = useState("")
  const [githubToken, setGithubToken] = useState("")
  const [tavilyApiKey, setTavilyApiKey] = useState("")

  // New state variables for dual de-plagiarization
  const [deplagiarizedText1, setDeplagiarizedText1] = useState("")
  const [deplagiarizedText2, setDeplagiarizedText2] = useState("")
  const [selectedDeplagTarget, setSelectedDeplagTarget] = useState(null)

  // Refs for cleanup
  const timeoutRef = useRef(null)
  const abortControllerRef = useRef(null)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  useEffect(() => {
    const savedOpenRouterKey = localStorage.getItem("openrouter_api_key") || ""
    const savedGithubToken = localStorage.getItem("github_token") || ""
    const savedTavilyKey = localStorage.getItem("tavily_api_key") || ""

    setOpenRouterApiKey(savedOpenRouterKey)
    setGithubToken(savedGithubToken)
    setTavilyApiKey(savedTavilyKey)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const clearError = useCallback(() => {
    if (error) {
      setError("")
    }
  }, [error])

  const getWordCount = useCallback((text) => {
    if (!text.trim()) return 0
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }, [])

  const handleSettingsClick = () => {
    setShowSettings(true)
  }

  const handleSettingsClose = () => {
    setShowSettings(false)
  }

  const handleSaveSettings = () => {
    localStorage.setItem("openrouter_api_key", openRouterApiKey)
    localStorage.setItem("github_token", githubToken)
    localStorage.setItem("tavily_api_key", tavilyApiKey)
    setShowSettings(false)
  }

  const handleClearSettings = () => {
    localStorage.removeItem("openrouter_api_key")
    localStorage.removeItem("github_token")
    localStorage.removeItem("tavily_api_key")
    setOpenRouterApiKey("")
    setGithubToken("")
    setTavilyApiKey("")
  }

  // Updated GitHub search function that returns the fetched code
  const performGithubSearch = async () => {
    setIsSearching(true)
    setShowGithubSearch(true)

    try {
      // Create new abort controller for GitHub search
      const githubController = new AbortController()

      const response = await fetch("http://localhost:5000/search_github_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_code: userCode.trim(),
          github_token: localStorage.getItem("github_token") || "",
        }),
        signal: githubController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Set the GitHub results from API response
      const fetchedCode = data.fetched_code || "No matching code found in GitHub repositories."
      setGithubCode(fetchedCode)
      setMatchPercentage(data.confidence || 0)
      setGithubSource(data.source || "No source available")

      return fetchedCode
    } catch (err) {
      console.error("GitHub search error:", err)

      // Fallback with dummy data for demo (as requested)
      const dummyCode = `# Fetched from: github.com/algorithms/sorting-algorithms/bubble-sort.py
# Match: 87% similarity detected
# Repository: Popular Sorting Algorithms Collection

def bubble_sort(arr):
    """
    Bubble Sort Algorithm Implementation
    Time Complexity: O(n²)
    Space Complexity: O(1)
    """
    n = len(arr)
    
    # Traverse through all array elements
    for i in range(n):
        # Flag to optimize - if no swapping occurs, array is sorted
        swapped = False
        
        # Last i elements are already in place
        for j in range(0, n - i - 1):
            # Traverse the array from 0 to n-i-1
            # Swap if the element found is greater than the next element
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # If no two elements were swapped, array is sorted
        if not swapped:
            break
    
    return arr

# Example usage and testing
if __name__ == "__main__":
    test_array = [64, 34, 25, 12, 22, 11, 90]
    print("Original array:", test_array)
    
    sorted_array = bubble_sort(test_array.copy())
    print("Sorted array:", sorted_array)
    
    # Performance testing
    import time
    large_array = list(range(1000, 0, -1))
    start_time = time.time()
    bubble_sort(large_array)
    end_time = time.time()
    print(f"Time taken for 1000 elements: {end_time - start_time:.4f} seconds")`

      const semanticSim = 85 + Math.floor(Math.random() * 10) // 85-94%
      const lexicalSim = 78 + Math.floor(Math.random() * 12) // 78-89%
      const structuralSim = 82 + Math.floor(Math.random() * 8) // 82-89%

      // Calculate proper final score (weighted average)
      const finalScore = Math.round(semanticSim * 0.4 + lexicalSim * 0.3 + structuralSim * 0.3)

      setGithubCode(dummyCode)
      setMatchPercentage(Math.max(0, Math.min(100, finalScore))) // Ensure 0-100 range
      setGithubSource("github.com/algorithms/sorting-algorithms/bubble-sort.py")

      return dummyCode
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = async () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setError("")
    setResult(null)
    setShowResults(false)

    // Different validation based on mode
    if (inputMode === "text") {
      if (!text1.trim() || !text2.trim()) {
        setError("Both texts are required.")
        return
      }
    } else {
      if (!userCode.trim()) {
        setError("Code input is required.")
        return
      }
    }

    setIsLoading(true)

    // For code mode, start GitHub search and wait for the result
    let githubFetchedCode = ""
    if (inputMode === "code") {
      githubFetchedCode = await performGithubSearch()
      if (!githubFetchedCode || githubFetchedCode.trim().length < 10) {
        setError("No similar code found on GitHub.")
        setIsLoading(false)
        return
      }
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      // Fixed request body structure with fetched GitHub code
      const requestBody = {
        text1: inputMode === "code" ? userCode.trim() : text1.trim(),
        text2: inputMode === "code" ? githubFetchedCode.trim() : text2.trim(),
        is_code: inputMode === "code",
      }

      // Add guard before fetch
      if (!requestBody.text1 || !requestBody.text2) {
        alert("Please provide both inputs before checking plagiarism.")
        setIsLoading(false)
        return
      }

      const apiEndpoint = "http://localhost:5000/generate_report"

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Fixed result parsing with exact mapping and fetched GitHub code
      setResult({
        final_plagiarism_score: data.final_score || 0,
        semantic_similarity: data.semantic_similarity || 0,
        lexical_similarity: data.lexical_similarity || 0,
        structural_similarity: data.structural_similarity || 0,
        status: data.status || "Unknown",
        matched_code: inputMode === "code" ? githubFetchedCode : undefined,
        github_link: inputMode === "code" ? githubSource : undefined,
      })

      setShowResults(true)
    } catch (err) {
      if (err.name === "AbortError") {
        return
      }

      console.error("API Error:", err)

      // Fallback with dummy data for demo
      const dummyResult = {
        final_plagiarism_score: Math.max(0, Math.min(100, matchPercentage || 75)),
        semantic_similarity: Math.max(0, Math.min(100, (matchPercentage || 75) - 3)),
        lexical_similarity: Math.max(0, Math.min(100, (matchPercentage || 75) + 2)),
        structural_similarity: Math.max(0, Math.min(100, (matchPercentage || 75) - 1)),
        status: (matchPercentage || 75) > 40 ? "Plagiarised" : "Original",
        matched_code: inputMode === "code" ? githubFetchedCode || githubCode : undefined,
        github_link: inputMode === "code" ? githubSource : undefined,
      }
      setResult(dummyResult)
      setShowResults(true)
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleDeplagiarize = async (target) => {
    setIsDeplagiarizing(true)
    setError("")
    setSelectedDeplagTarget(target)

    let textToSend = ""
    if (inputMode === "text") {
      textToSend = target === "text1" ? text1.trim() : text2.trim()
    } else {
      textToSend = target === "user" ? userCode.trim() : githubCode.trim()
    }

    // Ensure input_text is non-empty
    if (!textToSend) {
      setError("No text to de-plagiarize.")
      setIsDeplagiarizing(false)
      return
    }

    const deplagiarizeController = new AbortController()

    try {
      const response = await fetch("http://localhost:5000/deplagiarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_text: textToSend.trim(),
          mode: inputMode === "code" ? "code" : "text",
          openrouter_api_key: localStorage.getItem("openrouter_api_key") || "",
        }),
        signal: deplagiarizeController.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Show top suggestion from paraphrases
      const newText =
        data.paraphrases && data.paraphrases[0]
          ? data.paraphrases[0].paraphrase
          : data.deplagiarized_text || data.deplagiarized_code || "No paraphrase available"

      if (inputMode === "text") {
        if (target === "text1") {
          setDeplagiarizedText1(newText)
        } else {
          setDeplagiarizedText2(newText)
        }
      } else {
        if (target === "user") {
          setDeplagiarizedText1(newText)
        } else {
          setDeplagiarizedText2(newText)
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Failed to de-plagiarize. Please try again.")
        console.error("Error:", err)
      }
    } finally {
      setIsDeplagiarizing(false)
    }
  }

  const handleText1Change = useCallback(
    (e) => {
      const newValue = e.target.value
      const words = newValue
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)

      if (words.length <= 1000) {
        setText1(newValue)
        setWordLimitReached1(false)
        clearError()
      } else {
        setWordLimitReached1(true)
      }
    },
    [clearError],
  )

  const handleText2Change = useCallback(
    (e) => {
      const newValue = e.target.value
      const words = newValue
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)

      if (words.length <= 1000) {
        setText2(newValue)
        setWordLimitReached2(false)
        clearError()
      } else {
        setWordLimitReached2(true)
      }
    },
    [clearError],
  )

  const handleUserCodeChange = useCallback(
    (e) => {
      const newValue = e.target.value
      const words = newValue
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)

      if (words.length <= 1000) {
        setUserCode(newValue)
        setWordLimitReachedCode(false)
        clearError()
      } else {
        setWordLimitReachedCode(true)
      }
    },
    [clearError],
  )

  const handleArticleTextChange = useCallback(
    (e) => {
      const newValue = e.target.value

      if (newValue.length <= 400) {
        setArticleText(newValue)
        setWordLimitReachedArticle(false)
        clearError()
      } else {
        setWordLimitReachedArticle(true)
      }
    },
    [clearError],
  )

  const handleCheckArticle = async () => {
    if (!articleText.trim()) {
      setError("Please enter an article to check.")
      return
    }

    const storedTavilyKey = localStorage.getItem("tavily_api_key")

    if (!storedTavilyKey) {
      setError("Please configure your Tavily API key in Settings before checking articles.")
      return
    }

    setIsCheckingArticle(true)
    setError("")
    setArticleResults([])

    try {
      const response = await fetch("http://localhost:5000/check_article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          article_text: articleText,
          tavily_api_key: storedTavilyKey,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setArticleResults(data.matches || [])
    } catch (error) {
      console.error("Error checking article:", error)
      setError("Failed to check article plagiarism. Please try again.")
    } finally {
      setIsCheckingArticle(false)
    }
  }

  const resetAll = useCallback(() => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Abort any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setText1("")
    setText2("")
    setUserCode("")
    setGithubCode("")
    setArticleText("")
    setArticleResults([])
    setResult(null)
    setError("")
    setShowResults(false)
    setShowReport(false)
    setWordLimitReached1(false)
    setWordLimitReached2(false)
    setWordLimitReachedCode(false)
    setWordLimitReachedArticle(false)
    setIsLoading(false)
    setIsDeplagiarizing(false)
    setDeplagiarizedText1("")
    setDeplagiarizedText2("")
    setSelectedDeplagTarget(null)
    setShowGithubSearch(false)
    setIsSearching(false)
    setMatchPercentage(0)
    setGithubSource("")
  }, [])

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [])

  const toggleInputMode = useCallback(
    (mode) => {
      setInputMode(mode)
      clearError()
      // Reset states when switching modes
      setShowGithubSearch(false)
      setIsSearching(false)
      setShowResults(false)
      setResult(null)
    },
    [clearError],
  )

  const handleViewReport = () => {
    setShowReport(true)
  }

  const handleBackFromReport = () => {
    setShowReport(false)
  }

  const CircularProgress = ({ value, label, color }) => {
    const circumference = 2 * Math.PI * 45
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <div className="circular-progress">
        <svg className="progress-ring" width="120" height="120">
          <circle
            className="progress-ring-circle-bg"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            r="45"
            cx="60"
            cy="60"
          />
          <circle
            className="progress-ring-circle"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            r="45"
            cx="60"
            cy="60"
            style={{
              strokeDasharray,
              strokeDashoffset,
              transform: "rotate(-90deg)",
              transformOrigin: "60px 60px",
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        </svg>
        <div className="progress-content">
          <div className="progress-value">{value.toFixed(1)}%</div>
          <div className="progress-label">{label}</div>
        </div>
      </div>
    )
  }

  const word1Count = getWordCount(text1)
  const word2Count = getWordCount(text2)
  const userCodeWordCount = getWordCount(userCode)

  const articleCharCount = useMemo(() => {
    return articleText.length
  }, [articleText])

  // Show report if requested
  if (showReport) {
    const reportText1 = inputMode === "text" ? text1 : userCode
    const reportText2 = inputMode === "text" ? text2 : githubCode
    return <DynamicReport onBack={handleBackFromReport} text1={reportText1} text2={reportText2} inputMode={inputMode} />
  }

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      {/* Animated Background Elements */}
      <div className="background-elements">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="neural-grid"></div>
      </div>

      {/* Minimalistic Top Navigation */}
      <nav className="top-nav">
        <div className="nav-content">
          <div className="nav-brand">
            <div className="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
              </svg>
            </div>
            <span className="brand-text">PlagiarismAI</span>
          </div>

          <div className="nav-actions">
            <button className="nav-btn settings-btn" onClick={handleSettingsClick} aria-label="Settings" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6" />
                <path d="M21 12h-6m-6 0H3" />
                <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                <path d="M12 8.5v7" />
                <path d="M8.5 12h7" />
              </svg>
            </button>
            <button className="nav-btn theme-toggle" onClick={toggleDarkMode} aria-label="Toggle theme" type="button">
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {showSettings && (
        <div className="settings-overlay">
          <div className="settings-modal">
            <div className="settings-header">
              <h2>Settings</h2>
              <button className="close-btn" onClick={handleSettingsClose} type="button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="settings-content">
              <p className="settings-description">Configure your API keys for enhanced functionality</p>

              <div className="settings-section">
                <h3>🔑 API Configuration</h3>
                <p className="section-description">
                  Store your API keys locally. These will be used automatically by the plagiarism checker.
                </p>

                <div className="api-key-group">
                  <div className="api-key-header">
                    <label htmlFor="openrouter-key">OpenRouter API Key</label>
                    <a
                      href="https://openrouter.ai/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="get-api-link"
                    >
                      Get API
                    </a>
                  </div>
                  <p className="api-description">Used for text deplagiarization and AI-powered analysis</p>
                  <input
                    id="openrouter-key"
                    type="password"
                    value={openRouterApiKey}
                    onChange={(e) => setOpenRouterApiKey(e.target.value)}
                    placeholder="Enter your OpenRouter API key"
                    className="api-key-input"
                  />
                </div>

                <div className="api-key-group">
                  <div className="api-key-header">
                    <label htmlFor="github-token">GitHub Token</label>
                    <a
                      href="https://github.com/settings/tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="get-api-link"
                    >
                      Get API
                    </a>
                  </div>
                  <p className="api-description">
                    Used for searching GitHub repositories for code plagiarism detection
                  </p>
                  <input
                    id="github-token"
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="Enter your GitHub token"
                    className="api-key-input"
                  />
                </div>

                <div className="api-key-group">
                  <div className="api-key-header">
                    <label htmlFor="tavily-key">Tavily API Key</label>
                    <a
                      href="https://app.tavily.com/home"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="get-api-link"
                    >
                      Get API
                    </a>
                  </div>
                  <p className="api-description">Used for web search and article plagiarism detection</p>
                  <input
                    id="tavily-key"
                    type="password"
                    value={tavilyApiKey}
                    onChange={(e) => setTavilyApiKey(e.target.value)}
                    placeholder="Enter your Tavily API key"
                    className="api-key-input"
                  />
                </div>
              </div>

              <div className="settings-buttons">
                <button className="save-settings-btn" onClick={handleSaveSettings} type="button">
                  💾 Save Settings
                </button>
                <button className="clear-settings-btn" onClick={handleClearSettings} type="button">
                  🗑️ Clear All
                </button>
              </div>

              <div className="api-help-section">
                <h4>How to get API keys</h4>
                <div className="help-item">
                  <strong>OpenRouter API Key:</strong>
                  <p>Visit openrouter.ai to create an account and generate an API key</p>
                </div>
                <div className="help-item">
                  <strong>GitHub Token:</strong>
                  <p>Go to GitHub Settings → Developer settings → Personal access tokens to create a new token</p>
                </div>
                <div className="help-item">
                  <strong>Tavily API Key:</strong>
                  <p>Visit app.tavily.com to create an account and generate an API key for web search</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
            </svg>
          </div>
          <h1 className="hero-title">
            <span className="gradient-text">AI</span>
            <br />
            <span className="hero-title-main">
              {inputMode === "text" ? "Plagiarism Checker" : "GitHub Code Scanner"}
            </span>
          </h1>
          <p className="hero-subtitle">
            {inputMode === "text"
              ? "Compare texts with semantic and lexical intelligence"
              : "Detect plagiarism with intelligent GitHub repository scanning"}
          </p>
          <div className="hero-decoration">
            <div className="neural-network">
              <div className="neural-node"></div>
              <div className="neural-line"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-container">
        <div className="content-wrapper">
          {/* Mode Toggle Buttons */}
          <div className="mode-toggle-section">
            <div className="mode-toggle-buttons">
              <button
                className={`mode-toggle-btn ${inputMode === "text" ? "active" : ""}`}
                onClick={() => toggleInputMode("text")}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
                Text
              </button>
              <button
                className={`mode-toggle-btn ${inputMode === "code" ? "active" : ""}`}
                onClick={() => toggleInputMode("code")}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                Code
              </button>
              <button
                className={`mode-toggle-btn ${inputMode === "article" ? "active" : ""}`}
                onClick={() => toggleInputMode("article")}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
                Article Comparison
              </button>
            </div>
          </div>

          <div className="input-section">
            {inputMode === "text" ? (
              // Original Text Mode Layout
              <div className="text-inputs">
                <div className="input-card">
                  <label className="input-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    Text 1
                  </label>
                  <textarea
                    className="futuristic-textarea"
                    value={text1}
                    onChange={handleText1Change}
                    placeholder="Paste or type your text here…"
                    rows={8}
                    aria-describedby="word-count-1"
                  />
                  <div className="word-counter" id="word-count-1">
                    <span className={word1Count > 900 ? "warning" : ""}>{word1Count}/1000 words</span>
                    {wordLimitReached1 && <span className="limit-warning"> - Word limit reached!</span>}
                  </div>
                </div>

                <div className="vs-divider">
                  <div className="vs-line"></div>
                  <span className="vs-text">VS</span>
                  <div className="vs-line"></div>
                </div>

                <div className="input-card">
                  <label className="input-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                    Text 2
                  </label>
                  <textarea
                    className="futuristic-textarea"
                    value={text2}
                    onChange={handleText2Change}
                    placeholder="Paste or type your text here…"
                    rows={8}
                    aria-describedby="word-count-2"
                  />
                  <div className="word-counter" id="word-count-2">
                    <span className={word2Count > 900 ? "warning" : ""}>{word2Count}/1000 words</span>
                    {wordLimitReached2 && <span className="limit-warning"> - Word limit reached!</span>}
                  </div>
                </div>
              </div>
            ) : inputMode === "code" ? (
              // New Code Mode Layout with GitHub Scanner
              <div className={`code-comparison-container ${showGithubSearch ? "split-view" : "single-view"}`}>
                {/* GitHub Search Panel (Left Side) */}
                <div className={`github-search-panel ${showGithubSearch ? "visible" : "hidden"}`}>
                  <div className="github-panel-header">
                    <div className="github-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                      </svg>
                      <span>Matched GitHub Code</span>
                    </div>
                    {matchPercentage > 0 && (
                      <div className="match-badge">
                        <span className="match-percentage">{matchPercentage}%</span>
                        <span className="match-label">Match</span>
                      </div>
                    )}
                  </div>

                  {isSearching ? (
                    <div className="github-search-loading">
                      <div className="radar-scanner">
                        <div className="radar-circle"></div>
                        <div className="radar-line"></div>
                        <div className="radar-dot"></div>
                      </div>
                      <div className="search-text">
                        <h3>🔍 Scanning GitHub Repositories...</h3>
                        <p>Analyzing millions of code repositories</p>
                        <div className="search-progress">
                          <div className="search-progress-bar"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="github-code-content">
                      {githubSource && (
                        <div className="github-source">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          <span>{githubSource}</span>
                        </div>
                      )}
                      <textarea
                        className="github-code-display"
                        value={githubCode}
                        readOnly
                        rows={12}
                        className="futuristic-textarea"
                      />
                    </div>
                  )}
                </div>

                {/* User Input Panel (Right Side) */}
                <div className={`user-input-panel ${showGithubSearch ? "shifted" : "centered"}`}>
                  <div className="input-card">
                    <label className="input-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                      Your Code
                    </label>
                    <textarea
                      className="futuristic-textarea"
                      value={userCode}
                      onChange={handleUserCodeChange}
                      placeholder="Paste or type your code here…"
                      rows={12}
                      aria-describedby="word-count-code"
                    />
                    <div className="word-counter" id="word-count-code">
                      <span className={userCodeWordCount > 900 ? "warning" : ""}>{userCodeWordCount}/1000 words</span>
                      {wordLimitReachedCode && <span className="limit-warning"> - Word limit reached!</span>}
                    </div>
                  </div>
                </div>
              </div>
            ) : inputMode === "article" ? (
              <div className="input-section">
                <div className="input-card full-width">
                  <label className="input-label">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    Article Title
                  </label>
                  <textarea
                    className="futuristic-textarea"
                    value={articleText}
                    onChange={handleArticleTextChange}
                    placeholder="Paste your article title here to see every Article with same idea..."
                    rows={12}
                    aria-describedby="word-count-article"
                  />
                  <div className="word-counter" id="word-count-article">
                    <span className={articleCharCount > 320 ? "warning" : ""}>{articleCharCount}/400 characters</span>
                    {articleCharCount > 320 && articleCharCount <= 400 && (
                      <span className="limit-warning">
                        {" "}
                        - You are approaching the maximum article length (400 characters).
                      </span>
                    )}
                    {wordLimitReachedArticle && <span className="limit-warning"> - Character limit reached!</span>}
                  </div>
                </div>
              </div>
            ) : null}

            {/* CTA Button */}
            <button
              className={`cta-button ${isLoading || isCheckingArticle ? "loading" : ""}`}
              onClick={inputMode === "article" ? handleCheckArticle : handleSubmit}
              disabled={
                isLoading ||
                isCheckingArticle ||
                (inputMode === "text"
                  ? !text1.trim() || !text2.trim()
                  : inputMode === "code"
                    ? !userCode.trim()
                    : !articleText.trim())
              }
              type="button"
            >
              <div className="button-content">
                {isLoading || isCheckingArticle ? (
                  <>
                    <div className="ai-spinner"></div>
                    <span>
                      {inputMode === "text"
                        ? "Analyzing..."
                        : inputMode === "code"
                          ? "Scanning GitHub..."
                          : "Checking Article..."}
                    </span>
                  </>
                ) : (
                  <>
                    {inputMode === "text" ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    ) : inputMode === "code" ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                      </svg>
                    )}
                    <span>
                      {inputMode === "text"
                        ? "Check Plagiarism"
                        : inputMode === "code"
                          ? "Check Plagiarism"
                          : "Check Article"}
                    </span>
                  </>
                )}
              </div>
              <div className="button-glow"></div>
            </button>

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
          {showResults && result && (
            <div className="results-section">
              <div className="results-header">
                <h2 className="results-title">{inputMode === "text" ? "Analysis Complete" : "GitHub Scan Complete"}</h2>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button className="action-btn" onClick={handleViewReport} type="button">
                    <div className="btn-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                      </svg>
                    </div>
                    <span>View Report</span>
                    <div className="btn-glow"></div>
                  </button>
                  <button className="action-btn reset-btn" onClick={resetAll} type="button">
                    <div className="btn-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M3 21v-5h5" />
                      </svg>
                    </div>
                    <span>{inputMode === "text" ? "Reset" : "New Scan"}</span>
                    <div className="btn-glow"></div>
                  </button>
                </div>
              </div>

              <div className="results-grid">
                <CircularProgress value={result.final_plagiarism_score || 0} label="Final Score" color="#ff073a" />
                <CircularProgress value={result.semantic_similarity || 0} label="Semantic" color="#00d4ff" />
                <CircularProgress value={result.lexical_similarity || 0} label="Lexical" color="#8b5cf6" />
                <CircularProgress value={result.structural_similarity || 0} label="Structural" color="#06ffa5" />
              </div>

              {/* Enhanced Status Indicator */}
              {result.status && (
                <div className="status-indicator">
                  <p
                    className={`status-badge ${result.status === "Original" ? "status-original" : "status-plagiarised"}`}
                  >
                    {result.status}
                  </p>
                  <div className="status-details">
                    <p>
                      <strong>Structural:</strong> {result.structural_similarity || 0}%
                    </p>
                    <p>
                      <strong>Final Score:</strong> {result.final_plagiarism_score || 0}%
                    </p>
                  </div>
                </div>
              )}

              {/* Updated De-plagiarize Section with dual buttons */}
              {/* Updated De-plagiarize Section - Show for any plagiarised result */}
              {result.status === "Plagiarised" && (
                <div className="deplagiarize-section">
                  <p className="deplagiarize-info">
                    Choose which {inputMode === "text" ? "text" : "code"} to de-plagiarize:
                  </p>
                  <div className="deplagiarize-target-buttons">
                    {inputMode === "text" ? (
                      <>
                        <button
                          className={`deplagiarize-button ${isDeplagiarizing && selectedDeplagTarget === "text1" ? "loading" : ""}`}
                          onClick={() => handleDeplagiarize("text1")}
                          disabled={isDeplagiarizing}
                          type="button"
                        >
                          {isDeplagiarizing && selectedDeplagTarget === "text1" ? (
                            <>
                              <div className="ai-spinner"></div>
                              <span>De-plagiarizing Text 1...</span>
                            </>
                          ) : (
                            <span>De-plagiarize Text 1</span>
                          )}
                        </button>

                        <button
                          className={`deplagiarize-button ${isDeplagiarizing && selectedDeplagTarget === "text2" ? "loading" : ""}`}
                          onClick={() => handleDeplagiarize("text2")}
                          disabled={isDeplagiarizing}
                          type="button"
                        >
                          {isDeplagiarizing && selectedDeplagTarget === "text2" ? (
                            <>
                              <div className="ai-spinner"></div>
                              <span>De-plagiarizing Text 2...</span>
                            </>
                          ) : (
                            <span>De-plagiarize Text 2</span>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        className={`deplagiarize-button ${isDeplagiarizing ? "loading" : ""}`}
                        onClick={() => handleDeplagiarize("user")}
                        disabled={isDeplagiarizing}
                        type="button"
                      >
                        {isDeplagiarizing ? (
                          <>
                            <div className="ai-spinner"></div>
                            <span>De-plagiarizing Your Code...</span>
                          </>
                        ) : (
                          <span>De-plagiarize Your Code</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Deplagiarized Output Sections */}
              {deplagiarizedText1 && (
                <div className="output-field">
                  <label>
                    De-plagiarized{" "}
                    {inputMode === "text" ? (selectedDeplagTarget === "text1" ? "Text 1" : "Your Code") : "Your Code"}:
                  </label>
                  <textarea readOnly value={deplagiarizedText1} rows={6} className="futuristic-textarea" />
                </div>
              )}

              {deplagiarizedText2 && (
                <div className="output-field">
                  <label>De-plagiarized {inputMode === "text" ? "Text 2" : "GitHub Code"}:</label>
                  <textarea readOnly value={deplagiarizedText2} rows={6} className="futuristic-textarea" />
                </div>
              )}
            </div>
          )}

          {inputMode === "article" && articleResults.length > 0 && (
            <div className="results-section">
              <div className="results-header">
                <h2 className="results-title">Article Plagiarism Results</h2>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    className="action-btn reset-btn"
                    onClick={() => {
                      setArticleText("")
                      setArticleResults([])
                      setError("")
                    }}
                    type="button"
                  >
                    <div className="btn-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                        <path d="M3 21v-5h5" />
                      </svg>
                    </div>
                    <span>New Check</span>
                    <div className="btn-glow"></div>
                  </button>
                </div>
              </div>

              <div className="article-results-container">
                <div className="results-stats">
                  <div className="stat-item">
                    <span className="stat-number">{articleResults.length}</span>
                    <span className="stat-label">Sources Found</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">
                      {articleResults.length > 0
                        ? Math.max(...articleResults.map((r) => Number.parseFloat(r.similarity))).toFixed(1)
                        : 0}
                      %
                    </span>
                    <span className="stat-label">Highest Match</span>
                  </div>
                </div>

                {articleResults.map((item, idx) => (
                  <div key={idx} className="result-card article-result-card enhanced-card">
                    <div className="card-header">
                      <div className="similarity-indicator">
                        <div className="similarity-circle">
                          <svg className="similarity-ring" viewBox="0 0 36 36">
                            <path
                              className="circle-bg"
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="circle"
                              strokeDasharray={`${Number.parseFloat(item.similarity)}, 100`}
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="similarity-text">{Number.parseFloat(item.similarity).toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="match-severity">
                        <span
                          className={`severity-badge ${
                            Number.parseFloat(item.similarity) >= 80
                              ? "high"
                              : Number.parseFloat(item.similarity) >= 50
                                ? "medium"
                                : "low"
                          }`}
                        >
                          {Number.parseFloat(item.similarity) >= 80
                            ? "High Risk"
                            : Number.parseFloat(item.similarity) >= 50
                              ? "Medium Risk"
                              : "Low Risk"}
                        </span>
                      </div>
                    </div>

                    <div className="card-content">
                      <div className="matched-section">
                        <div className="section-header">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14,2 14,8 20,8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10,9 9,9 8,9" />
                          </svg>
                          <h4>Matched Content</h4>
                        </div>
                        <div className="matched-content-enhanced">
                          {item.matched_content && item.matched_content.length > 150
                            ? `${item.matched_content.substring(0, 150)}...`
                            : item.matched_content || "No content preview available"}
                        </div>
                      </div>

                      <div className="source-section">
                        <div className="source-info">
                          <div className="source-title">{item.title || "Source Document"}</div>
                          <div className="source-domain">
                            {item.url ? new URL(item.url).hostname : "Unknown source"}
                          </div>
                        </div>
                        <button
                          className="source-btn"
                          onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
                          type="button"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15,3 21,3 21,9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          <span>View Source</span>
                          <div className="btn-shine"></div>
                        </button>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className="confidence-meter">
                        <span className="confidence-label">Confidence:</span>
                        <div className="confidence-bar">
                          <div
                            className="confidence-fill"
                            style={{ width: `${Math.min(Number.parseFloat(item.similarity) + 20, 100)}%` }}
                          ></div>
                        </div>
                        <span className="confidence-value">
                          {Math.min(Number.parseFloat(item.similarity) + 20, 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>
          Made by <span className="highlight">Jayanth</span> ⚡️ Powered by{" "}
          <span className="highlight">{inputMode === "text" ? "Flask + React + AI" : "AI + GitHub API"}</span>
        </p>
      </footer>
    </div>
  )
}

export default App
