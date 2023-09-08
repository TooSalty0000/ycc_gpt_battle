import React from "react";
import styles from "./module-css/Header.module.css";
import { RiAdminFill } from "react-icons/ri";

export default function Header({ toggleLogin, targetText, numTries }) {
  return (
    <header className={styles.Container}>
      <div className={styles.top}>
        <button
          className="text-2xl font-bold"
          onClick={() => window.open("https://www.ycc.club", "_blank")}
        >
          YCC
        </button>
        <h1 className="text-[2rem] font-bold">GPT Battle</h1>
        <button onClick={toggleLogin}>
          <RiAdminFill size={25} />
        </button>
      </div>
      <div className={styles.bottom}>
        <div className={styles.targetTextDisplay}>
          <h2 className="text-lg font-bold">제시어: {targetText}</h2>
        </div>
        <div className={styles.targetTextDisplay}>
          <h2 className="text-lg font-bold">남은 시도: {numTries}</h2>
        </div>
      </div>
    </header>
  );
}
