import React from 'react';
const base_url = import.meta.env.VITE_BACKEND_URL;
import { useState, useEffect, useCallback } from "react"
import "./Search.css"


const userCredits = (email) => {
  const [credits, setCredits] = useState(0)
  const [error, setError] = useState("")

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch(`${base_url}/user/credits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.code === 200) {
        setCredits(data.data)
      } else {
        setError(data.message)
      }
      return data
    } catch (err) {
      console.error("Error fetching credits:", err)
      setError("Failed to fetch credits")
    }
  }, [email])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  return { credits, error, fetchCredits }
}

const Search = () => {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const email = localStorage.getItem("email")
  const { credits, fetchCredits } = userCredits(email)

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true)
    setError("")
    setResponse([])

    try {
      const res = await fetch(`${base_url}/user/send-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({ query, email }),
      })

      const data = await res.json()

      if (data.code === 200) {
        try {
          const jsonString = data.data[0].text;
          const parsedNames = JSON.parse(jsonString);
          setResponse(parsedNames);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          setError("Error processing the response data");
        }
        await fetchCredits();
      }  else {
        setError(data.message)
        if (data.message.includes("credits are exhausted")) {
          await fetchCredits()
        }
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("An error occurred while processing your request.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="search-container">
      <div className="search-header">
        <h2 className="search-title">Find Investors & Mentors</h2>
        <span className="credits-badge">Credits: {credits}</span>
      </div>

      <div className="search-input-container">
        <textarea
          className="search-input"
          rows="4"
          placeholder="Describe your startup and what you're looking for..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <button
        className={`search-button ${!query.trim() || isLoading ? "disabled" : ""}`}
        onClick={handleSearch}
        disabled={!query.trim() || isLoading}
      >
        {isLoading ? "Searching..." : "Search"}
      </button>

      {error && <div className="error-message">{error}</div>}

      {response.length > 0 && (
        <div className="response-container">
          <h3 className="response-title">Suggested Contacts:</h3>
          <ul className="response-list">
            {response.map((name, index) => (
              <li key={index} className="response-item">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Search

