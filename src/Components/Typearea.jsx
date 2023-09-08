import React, { useRef, useState } from "react";
import send from "../assets/Images/send.png";
import styles from "./module-css/Typearea.module.css";

export default function Typearea({ addText, loading }) {
  const [text, setText] = useState("");
  const textArea = useRef(null);

  const handleEdit = (e) => {
    setText(e.target.value);
  };

  const handleSend = () => {
    addText(text);
    setText("");
    textArea.current.value = "";
  };

  return (
    <div className={styles.Container}>
      <div className={styles.Inputarea}>
        <textarea
          type="text"
          ref={textArea}
          className={styles.Input}
          onChange={handleEdit}
          rows={1}
        />
        <button
          className={styles.Button}
          onClick={handleSend}
          disabled={loading}
        >
          <img src={send} alt="send" className={styles.SendImage}></img>
        </button>
      </div>
    </div>
  );
}
