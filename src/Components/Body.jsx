import React, { useEffect } from "react";
import styles from "./module-css/Body.module.css";
import Textbox from "./Textbox.jsx";

export default function Body({ allText, targetText }) {
  const [texts, setTexts] = React.useState([]);

  useEffect(() => {
    console.log(allText);
    setTexts(allText);
  }, [allText]);

  return (
    <div className={styles.Container}>
      {texts?.map((textObject, index) => (
        <Textbox
          key={index}
          text={textObject.content}
          isUser={textObject.role == "user"}
          containsText={
            textObject.role != "user" && textObject.content.includes(targetText)
          }
        />
      ))}
    </div>
  );
}
