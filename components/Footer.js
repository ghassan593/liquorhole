import { FaInstagram } from "react-icons/fa";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.container}>
        <div className={styles.column} id="about">
          <h3>About LiquorHole</h3>
          <p>
            At LiquorHole, we bring you a curated selection of premium spirits
            from around the world. Whether you’re a casual enthusiast or a
            connoisseur, our goal is to deliver quality, authenticity, and a
            taste worth remembering.
          </p>
        </div>

        <div className={styles.column} id= "contact">
          <h3>Contact Us</h3>
          <ul>
            <li><a href="mailto:liquorhole.business@gmail.com">✉ liquorhole.business@gmail.com</a></li>
            <li><a href="tel:96181744554">☏ +961 81 744 554</a></li>
            <li> ➣    Zahle, Lebanon</li>
            <li> ⴵ Mon–Sat: 10AM – 10PM</li>
          </ul>
        </div>

        <div className={styles.column}>
          <h3>Connect With Us 🥂</h3>
          <a
            href="https://www.instagram.com/liquorhole_lb?igsh=bWZhZmJmNjIwNTFr"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            <FaInstagram /> Instagram
          </a>
        </div>
      </div>
      <div className={styles.bottom}>
 © 2025 LiquorHole. All rights reserved.
      </div>
    </footer>
  );
}



