import React, { useState } from "react";

import styles from "./module-css/Admin.module.css";

export default function Admin({
  handleTextChange,
  changeBoothState,
  boothState,
}) {
  const [newTargetText, setNewTargetText] = useState("");

  return (
    <div className={styles.Container}>
      <div className={styles.Inputarea}>
        <h1 className="font-bold text-3xl">제시어 바꾸기</h1>
        <input
          type="text"
          className={styles.Input}
          placeholder="바꿀 제시어를 입력하세요"
          onChange={(e) => setNewTargetText(e.target.value)}
        />
        <div className="flex flex-row">
          <button
            className={styles.Button}
            onClick={() => {
              handleTextChange(newTargetText);
            }}
          >
            바꾸기
          </button>
          <button
            className={`${styles.Button} ${
              boothState ? styles.open : styles.close
            }`}
            onClick={() => {
              changeBoothState();
            }}
          >
            부스 {boothState ? "닫기" : "열기"}
          </button>
        </div>
      </div>
    </div>
  );
}
