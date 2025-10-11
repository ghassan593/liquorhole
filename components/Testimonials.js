import { FaQuoteLeft } from "react-icons/fa";
import styles from "./Testimonials.module.css";


export default function Testimonials() {
  const testimonials = [
    {
      text: "Amazing quality and service! I received my order within a day and everything was perfectly packed.",
      name: "Rami A.",
    },
    {
      text: "The best collection I’ve found online. The offers section is a gem — saved a lot with my last order!",
      name: "Maya K.",
    },
    {
      text: "Customer service was quick and friendly. Definitely ordering again soon!",
      name: "Karim D.",
    },
    {
      text: "I loved how easy the checkout was and how professional the whole experience felt.",
      name: "Sara T.",
    },
  ];

  return (
    <section className={styles.testimonialsSection}>
      <h2 className={styles.title}>What Our Customers Say</h2>
      <div className={styles.slider}>
        {testimonials.map((t, i) => (
          <div key={i} className={styles.card}>
            <FaQuoteLeft className={styles.icon} />
            <p className={styles.text}>“{t.text}”</p>
            <p className={styles.name}>— {t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
