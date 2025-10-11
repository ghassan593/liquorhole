// components/Navigation.js
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import Link from "next/link";
import { FaShoppingCart, FaBars, FaTimes, FaInstagram } from "react-icons/fa";
import styles from "./Navigation.module.css";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { debounce } from "lodash";

const renderMenuItems = (items, activeSubMenuState) => {
  return items.map((topLevelItem) => {
    const isMegaMenu =
      topLevelItem.children &&
      topLevelItem.children.some((c) => c.children && c.children.length > 0);
    if (topLevelItem.parent_id !== null) return null;

    return (
      <div
        key={topLevelItem.id}
        className={styles.categoryItem}
        onMouseEnter={() => activeSubMenuState.setActiveSubMenu(topLevelItem.id)}
        onMouseLeave={() => activeSubMenuState.setActiveSubMenu(null)}
      >
        <Link href={topLevelItem.url}>{topLevelItem.name}</Link>
        {topLevelItem.children && topLevelItem.children.length > 0 && (
          <div
            className={`${isMegaMenu ? styles.megaMenuDropdown : styles.subcategoriesDropdown} ${
              activeSubMenuState.activeSubMenu === topLevelItem.id ? styles.showDropdown : ""
            }`}
          >
            {topLevelItem.children.map((columnItem) => (
              <div key={columnItem.id} className={styles.megaMenuColumn}>
                <Link href={columnItem.url} className={styles.columnTitle}>
                  {columnItem.name}
                </Link>
                {columnItem.children && columnItem.children.length > 0 && (
                  <ul className={styles.linksList}>
                    {columnItem.children.map((linkItem) => (
                      <li key={linkItem.id}>
                        <Link href={linkItem.url}>{linkItem.name}</Link>
                        {linkItem.children && linkItem.children.length > 0 && (
                          <ul className={styles.nestedLinksList}>
                            {linkItem.children.map((nestedLink) => (
                              <li key={nestedLink.id}>
                                <Link href={nestedLink.url}>{nestedLink.name}</Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  });
};

export default function Navigation() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState([]);
  const fetchSuggestions = debounce(async (value) => {
    if (!value || !value.trim()) return setSuggestions([]);
    const { data, error } = await supabase
      .from("alcohols")
      .select("id, name, slug")
      .ilike("name", `%${value}%`)
      .limit(6);
    if (error) console.error("Suggestion error:", error);
    else setSuggestions(data || []);
  }, 260);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const { cart, itemCount } = useCart();
  const [openMobileSubMenus, setOpenMobileSubMenus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // NEW: navbar visibility + ref for last scroll
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollYRef = useRef(0);

  const handleMobileLinkClick = () => setMobileOpen(false);

  const toggleMobileSubMenu = (id) => {
    setOpenMobileSubMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Close mobile menu & suggestions on route change; ensure navbar visible
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileOpen(false);
      setSuggestions([]);
      setShowNavbar(true);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  // Fetch menu items and build hierarchy
  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase.from("menu_items").select("*").order("id");
      if (error) return console.error("Error fetching menu items:", error);
      const buildMenuHierarchy = (items) => {
        const menu = [];
        const map = {};
        items.forEach((item) => (map[item.id] = { ...item, children: [] }));
        items.forEach((item) => {
          if (item.parent_id !== null) {
            const parent = map[item.parent_id];
            if (parent) parent.children.push(map[item.id]);
          } else menu.push(map[item.id]);
        });
        return menu;
      };
      setMenuItems(buildMenuHierarchy(data || []));
    };
    fetchMenu();
  }, []);

  // Scroll: hide on scroll down, show on scroll up (use ref for previous)
  useEffect(() => {
    const THRESHOLD = 8; // px
    const onScroll = () => {
      const currentY = window.scrollY || window.pageYOffset || 0;
      const diff = currentY - (lastScrollYRef.current || 0);

      // if menu is open we keep navbar visible (avoid hiding during interactions)
      if (mobileOpen) {
        lastScrollYRef.current = currentY;
        return;
      }

      if (currentY <= 100) {
        setShowNavbar(true);
      } else if (diff > THRESHOLD) {
        // scrolling down
        setShowNavbar(false);
      } else if (diff < -THRESHOLD) {
        // scrolling up
        setShowNavbar(true);
      }
      lastScrollYRef.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen]);

  // Mobile menu render recursion
  const renderMobileMenuItems = (items) =>
    items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openMobileSubMenus[item.id];
      return (
        <li key={item.id} className={styles.mobileMenuItem}>
          <div className={styles.mobileMenuItemHeader}>
            <a
              href={item.url}
              onClick={(e) => {
                e.preventDefault();
                setMobileOpen(false);
                router.push(item.url);
              }}
            >
              {item.name}
            </a>
            {hasChildren && (
              <span className={styles.toggleIcon} onClick={() => toggleMobileSubMenu(item.id)}>
                {isOpen ? "−" : "+"}
              </span>
            )}
          </div>
          {hasChildren && isOpen && <ul className={styles.mobileSubMenu}>{renderMobileMenuItems(item.children)}</ul>}
        </li>
      );
    });

  return (
    <>
      {/* wrap both navs in navWrapper so we move one element only */}
      <div
        className={styles.navWrapper}
        style={{
          transform: showNavbar ? "translateY(0)" : "translateY(-120%)",
          transition: "transform 0.35s ease",
          pointerEvents: showNavbar ? "auto" : "none",
        }}
      >
        {/* Desktop Nav */}
        <div className={styles.desktopNav}>
          <div className={styles.topBar}>
            <div className={styles.topBarContent}>
              <div className={styles.topBarLinks}>
                <a href="#about">About</a>
                <a href="#contact">Contact Us</a>
                <Link href="https://www.instagram.com/liquorhole_lb?igsh=bWZhZmJmNjIwNTFr" target="_blank" className={styles.socialLink}>
                  <FaInstagram size={18} />
                </Link>
              </div>
            </div>
          </div>

          <nav className={styles.mainNavbar}>
            <div className={styles.logo}>
              <Link href="/">
                <img src="/logo2.jpg" alt="Liquor Hole" className={styles.logoImage} />
              </Link>
            </div>

            <div className={styles.searchWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim() !== "") {
                    router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery("");
                    setSuggestions([]);
                  }
                }}
              />
              {suggestions.length > 0 && (
                <ul className={styles.suggestionsDropdown}>
                  {suggestions.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`/product/${item.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setSuggestions([]);
                          router.push(`/product/${item.slug}`);
                        }}
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.rightNav}>
              <Link href="/cart" className={styles.cartIcon}>
                <FaShoppingCart size={22} />
                {itemCount() > 0 && <span className={styles.cartBadge}>{itemCount()}</span>}
                <span className={styles.cartText}>Cart </span>
              </Link>
            </div>
          </nav>

          <div className={styles.categoriesBar}>{renderMenuItems(menuItems, { activeSubMenu, setActiveSubMenu })}</div>
        </div>

        {/* Mobile Nav */}
        <div className={styles.mobileNav}>
          <nav className={styles.mobileNavbar}>
            <div className={styles.hamburger} onClick={() => setMobileOpen((s) => !s)}>
              {mobileOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </div>
            <div className={styles.mobileLogo}>
              <Link href="/">
                <img src="/logo2.jpg" alt="Liquor Hole" className={styles.mobileLogoImage} />
              </Link>
            </div>
            <Link href="/cart" className={styles.mobileCartIcon}>
              <FaShoppingCart size={22} />
              {itemCount() > 0 && <span className={styles.cartBadge}>{itemCount()}</span>}
              
            </Link>
          </nav>

          <div className={`${styles.overlay} ${mobileOpen ? styles.show : ""}} onClick={() => setMobileOpen(false)`} />

          <div className={`${styles.mobileMenu} ${mobileOpen ? styles.show : ""}`}>
            <div className={styles.mobileMenuHeader}>
              <div className={styles.closeButton} onClick={() => setMobileOpen(false)}>
                × Close
              </div>
              <div className={styles.menuTitle}>MENU</div>
            </div>

            <div className={styles.mobileSearch}>
              <FiSearch className={styles.mobileSearchIcon} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim() !== "") {
                    setMobileOpen(false);
                    router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery("");
                    setSuggestions([]);
                  }
                }}
              />
              {suggestions.length > 0 && (
                <ul className={styles.suggestionsDropdown}>
                  {suggestions.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`/product/${item.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setSuggestions([]);
                          setMobileOpen(false);
                          router.push(`/product/${item.slug}`);
                        }}
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ul className={styles.mobileMenuLinks}>{renderMobileMenuItems(menuItems)}</ul>
          </div>
        </div>
      </div>
    </>
  );
}
