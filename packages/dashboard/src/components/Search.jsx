import { useState, useRef, useEffect } from "react";

export default function Search({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 250);
  }, [query]);

  return (
    <div className="search-view">
      <div className="dept-detail-top">
        <h2 className="detail-title">Search</h2>
        <p className="detail-role">全ファイルからキーワード検索</p>
      </div>

      <div className="search-input-wrapper">
        <input
          className="search-input"
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {loading && <span className="search-loading" />}
      </div>

      <div className="search-results">
        {query && !loading && results.length === 0 && (
          <div className="empty-state">No results for "{query}"</div>
        )}
        {results.map((r, i) => (
          <div
            key={i}
            className="search-result"
            onClick={() => onNavigate("department", r.department)}
          >
            <div className="search-result-header">
              <span className="search-result-title">{r.title}</span>
              <span className="activity-dept">{r.department}</span>
            </div>
            <div className="search-result-path">{r.path}</div>
            {r.matches.map((m, j) => (
              <div key={j} className="search-match">
                <span className="search-match-line">L{m.line}</span>
                <span className="search-match-text">
                  {highlightMatch(m.text, query)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return (
    <>
      {before}
      <mark className="search-highlight">{match}</mark>
      {after}
    </>
  );
}
