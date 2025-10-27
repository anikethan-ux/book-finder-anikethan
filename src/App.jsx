import React, { useState, useRef } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // 🔍 Fetch books from OpenLibrary API
  const searchBooks = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setBooks([]);
    setSearched(true);

    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setBooks(data.docs.slice(0, 15)); // top 15
    } catch (err) {
      console.error("Error fetching books:", err);
      alert("Something went wrong while fetching books.");
    } finally {
      setLoading(false);
    }
  };

  // 🎙 Voice Search Setup
  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Sorry, your browser does not support voice search.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      console.error("Voice error:", e);
      setListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setTimeout(() => {
        document
          .getElementById("searchForm")
          .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      }, 500);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <div className="app">
      {/* 🌟 HEADER */}
      <header className="header">
        <h1 className="headline">Discover Infinite Stories 📚</h1>
        <p className="subtitle glow-text">
          Search, Explore, and Dive into the World of Books
        </p>
      </header>

      {/* 🔎 SEARCH SECTION */}
      <main className="main">
        <form id="searchForm" onSubmit={searchBooks} className="search-box">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or author..."
            className="search-input"
          />

          {/* 🎤 Voice Button */}
          <button
            type="button"
            onClick={startVoiceSearch}
            className={`mic-btn ${listening ? "listening" : ""}`}
            title="Voice Search"
          >
            🎤
          </button>

          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        {loading && (
          <div className="spinner-container">
            <div className="spinner"></div>
            <p>Fetching books...</p>
          </div>
        )}

        {!loading && searched && books.length === 0 && (
          <p className="no-results">❌ No books found. Try another search.</p>
        )}

        {/* 🧱 Book Grid */}
        <div className="grid">
          {books.map((book, i) => {
            const coverUrl = book.cover_i
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
              : "https://cdn-icons-png.flaticon.com/512/29/29302.png";

            return (
              <div key={i} className="card">
                <div className="card-3d">
                  <div className="card-front">
                    <img
                      src={coverUrl}
                      alt={book.title}
                      className="book-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://cdn-icons-png.flaticon.com/512/29/29302.png";
                      }}
                    />
                    <div className="cover-overlay">
                      <h3 className="cover-title">{book.title}</h3>
                    </div>
                  </div>

                  <div className="card-back">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="author">
                      ✍️ {book.author_name?.[0] || "Unknown Author"}
                    </p>
                    <p className="year">
                      🗓 {book.first_publish_year || "N/A"}
                    </p>
                    <a
                      href={`https://openlibrary.org${book.key}`}
                      target="_blank"
                      rel="noreferrer"
                      className="details-link"
                    >
                      View Details →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ⚡ FOOTER */}
      <footer className="footer">
        © {new Date().getFullYear()} All Rights Reserved | Designed by{" "}
        <strong>Nalla Anikethan Reddy</strong>
      </footer>
    </div>
  );
}
