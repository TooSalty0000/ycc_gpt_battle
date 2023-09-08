import styles from "./module-css/Textbox.module.css";

export default function Textbox({ text, isUser, containsText }) {
  return (
    <div className={styles.Container}>
      <div
        className={`${styles.Textbox} ${isUser ? styles.user : ""} ${
          containsText ? styles.winner : ""
        }`}
      >
        <p className={styles.Text}>{text}</p>
      </div>
    </div>
  );
}
