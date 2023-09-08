import "./App.css";
import Header from "./Components/Header.jsx";
import Body from "./Components/Body.jsx";
import TypeArea from "./Components/Typearea.jsx";
import Loginmodal from "./Components/Loginmodal.jsx";
import Admin from "./Components/Admin.jsx";
import { useState, useCallback, useEffect } from "react";
import OpenAI from "openai";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, get, child } from "firebase/database";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

function App() {
  //configs
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const firebase = getFirestore(app);

  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_GPT_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [boothOpen, setBoothOpen] = useState(false); // for admin
  const [showLogin, setShowLogin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [targetText, setTargetText] = useState("");
  const [numTries, setNumTries] = useState(0);
  const [winner, setWinner] = useState(false);

  const addText = useCallback(async (text) => {
    if (!boothOpen) {
      alert("부스가 닫았습니다.\n 다음에 이용해 주세요.");
      setLoading(true);
      return;
    }

    if (numTries <= 0) {
      alert("기회를 모두 소진 하셨습니다.\n 다음 제시어를 기달려 주세요.");
      return;
    }
    if (winner) {
      alert("이미 이겼습니다!\n 부스를 방문해 선물을 받아가세요!");
      return;
    }

    let prompt = text;

    if (prompt === "") {
      alert("입력된 내용이 없습니다.");
      return;
    }

    if (prompt.includes(targetText)) {
      alert("제시어는 사용하실 수 없습니다.");
      return;
    }

    let apiMessageObject = {
      role: "user",
      content: prompt,
    };
    setAllMessages([...allMessages, apiMessageObject]);
    setLoading(true);
    const response = await openai.chat.completions
      .create({
        model: "gpt-3.5-turbo",
        messages: [...allMessages, apiMessageObject],
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      })
      .catch((err) => {
        alert(err);
        setLoading(false);
        return;
      });
    setLoading(false);
    let apiResponse = response.choices[0].message;
    setAllMessages([...allMessages, apiMessageObject, apiResponse]);
    setNumTries(numTries - 1);
    localStorage.setItem("numTries", numTries - 1);
    localStorage.setItem(
      "allMessages",
      JSON.stringify([...allMessages, apiMessageObject, apiResponse])
    );

    if (apiResponse.content.includes(targetText)) {
      setWinner(true);
      localStorage.setItem("winner", "true");
      setTimeout(() => {
        alert("게임에 이겼습니다!\n부스를 방문해 선물을 받아가세요!");
      }, 1000);
    }
  });

  const toggleLogin = () => {
    if (loggedIn) {
      setLoggedIn(false);
    } else {
      setShowLogin(!showLogin);
    }
  };

  const handleLogin = (password) => {
    if (password === process.env.REACT_APP_ADMIN_PASS) {
      setShowLogin(false);
      setLoggedIn(true);
    } else {
      alert("Incorrect Password");
    }
  };

  const handleTextChange = (text) => {
    // console.log(text);
    changeText(text);
  };

  const changeText = async (text) => {
    const docRef = doc(firebase, "TargetText", "TargetText");
    await setDoc(docRef, {
      targetText: text,
    }).catch((err) => {
      alert(err);
    });
    setTargetText(text);
    console.log("Document written with ID: ", docRef.id);
    alert("성공적으로 변경되었습니다.");
  };

  const changeBoothState = async () => {
    const state = !boothOpen;
    const boothRef = ref(database, "boothOpen");
    await set(boothRef, state).catch((err) => {
      alert(err);
    });
    setBoothOpen(state);
    console.log("Booth state changed to: ", state);
    alert("성공적으로 변경되었습니다.");
  };

  async function init() {
    setLoading(true);
    let _targetText = "";
    const docRef = doc(firebase, "TargetText", "TargetText");
    const docSnap = await getDoc(docRef).catch((err) => {
      alert(err);
    });
    if (docSnap?.exists()) {
      _targetText = docSnap.data().targetText;
      setTargetText(_targetText);
    } else {
      console.error("No such document!");
    }
    const savedTargetText = localStorage.getItem("targetText");
    if (savedTargetText === null || savedTargetText != _targetText) {
      localStorage.setItem("targetText", _targetText);
      localStorage.setItem("numTries", 5);
      localStorage.setItem("allMessages", JSON.stringify([]));
      localStorage.setItem("winner", "false");
      setNumTries(5);
    } else {
      const savedNumTries = localStorage.getItem("numTries");
      setNumTries(savedNumTries);
      const pastMessages = localStorage.getItem("allMessages");
      const savedWinner = localStorage.getItem("winner");
      if (savedWinner !== null) setWinner(savedWinner == "true");
      else setWinner(false);
      if (pastMessages !== null) {
        setAllMessages(JSON.parse(pastMessages));
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    const boothRef = ref(database, "boothOpen");
    let shouldInit = true;

    const listener = onValue(boothRef, (snapshot) => {
      const data = snapshot.val();
      setBoothOpen(data);
      if (!data) {
        alert("부스가 닫혔습니다.\n 다음에 이용해 주세요.");
        setLoading(true);
        shouldInit = false;
      } else {
        setLoading(false);
      }
    });

    //get target text
    if (shouldInit) {
      init().catch((err) => {
        alert(err);
      });
    }

    return () => {
      listener();
    };
  }, []);

  return (
    <div className="App">
      <div className="AppContainer">
        <Header
          toggleLogin={toggleLogin}
          targetText={targetText}
          numTries={numTries}
        />
        {!loggedIn ? (
          <>
            <Body allText={allMessages} targetText={targetText} />
            <TypeArea addText={addText} loading={loading} />
          </>
        ) : (
          <Admin
            handleTextChange={handleTextChange}
            changeBoothState={changeBoothState}
            boothState={boothOpen}
          />
        )}

        {showLogin && (
          <Loginmodal toggleLogin={toggleLogin} handleLogin={handleLogin} />
        )}
      </div>
    </div>
  );
}

export default App;
