import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import styles from "../styles/SearchPage.module.css";

export default function SearchPage() {
  const router = useRouter();
  const { query } = router.query;
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      const { data, error } = await supabase
        .from("alcohols")
        .select("*")
        .ilike("name", `%${query}%`)
        .order("name");

      if (error) console.error("Search error:", error);
      else setResults(data);
    };

    fetchResults();
  }, [query]);

  return (
    <div className={styles.container}>
      <h1>Search Results for: &quot;{query}&quot;</h1>
      {results.length === 0 && <p>No results found.</p>}
      <div className={styles.resultsGrid}>
        {results.map((item) => (
          <Link key={item.id} href={`/product/${item.slug}`} className={styles.card}>
            <img src={item.image_url || "/placeholder.jpg"} alt={item.name} />
            <div className={styles.cardInfo}>
              <h2>{item.name}</h2>
              <p>${item.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
