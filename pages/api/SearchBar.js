import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({ className = "" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }
      const { data, error } = await supabase
        .from("alcohols")
        .select("*")
        .ilike("name",  `%${query}%`)
        .limit(10);

      if (error) console.error("Search error:", error);
      else setResults(data);
    };

    const delayDebounce = setTimeout(fetchResults, 300); // debounce
    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div style={{ position: "relative" }} className={className}>
      <input
        type="text"
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 35px 8px 15px",
          borderRadius: "20px",
          border: "1px solid #ccc",
        }}
      />
      <FaSearch
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#aaa",
        }}
      />

      {results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: "10px",
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: 9999,
            padding: 0,
            margin: 0,
            listStyle: "none",
          }}
        >
          {results.map((item) => (
            <li
              key={item.id}
              style={{
                padding: "10px 15px",
                borderBottom: "1px solid #eee",
              }}
              onClick={() => setQuery("")} // clear input when clicked
            >
              <Link href={`/products/${item.slug}`}>{item.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}