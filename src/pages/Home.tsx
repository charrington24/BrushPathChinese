import React, { useCallback, useContext, useEffect, useState } from "react";
import "../styles/styles.css";
import HomeStats from "../components/HomeStats";
import HomeStudyPrompt from "../components/HomeStudyPrompt";
import DeckList from "../components/DeckList";
import { useParams } from "react-router";
import { AuthContext } from "../utils/FirebaseContext";
import { updateProfile } from "firebase/auth";
import { auth } from "../utils/Firebase";
import characterParser from "../utils/characterParser";
import Character from "../types/Character";
import SingleWordView from "./SingleWord";
import LoadingSpinner from "../components/LoadingSpinner";
import { useDecks } from '../utils/DeckContext';
import { getDecksFromRefs, getDeckFromID, getCharacterScoreData, getCharacterScoreCount, updateLanguageField } from "../utils/FirebaseQueries";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { DocumentData } from "firebase/firestore";
import { channel } from "diagnostics_channel";
import { initializeApp } from "firebase/app";
import runInterp from "../utils/interpolater";
import DrawSandbox from "./DrawSandbox";


type RetrievableData = {
  data: DocumentData[] | null;
  loading: boolean;
  error: string;
};

type RetrievableCount = {
  data: number | null;
  loading: boolean;
  error: string;
};

const Home: React.FC = (props) => {

  const navigate = useNavigate();

  //const {user} = useParams<any>();
  const { user, userData, getUserData } = useContext(AuthContext);
  const { decks, fetchDecks } = useDecks();

  // const [decks, setDecks] = useState<any>([]);

  const [userCharacterScoreData, setUserCharacterScoreData] = useState<RetrievableData>({ data: null, loading: true, error: "" });
  const [userCharacterScoreCount, setUserCharacterScoreCount] = useState<RetrievableCount>({ data: -1, loading: true, error: "" });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // const fetchChars = async () => {
      
    //     await updateLanguageField();
        
    //   } 
    //   fetchChars();
  }, []);

  useEffect(() => {
    // const fetchDecks = async () => {
    //   const decksResult = await getDecksFromRefs(userData?.decks)
    //   setDecks(decksResult);
    //   setLoading(false);
    // }

    //TODO: Maybe this should just get the count. Let's see if its slow on prod
    // const fetchScores = async () => {
    //   if(!userData?.email) {
    //     setUserCharacterScoreData({...userCharacterScoreData, loading:false, error: "No email found"})
    //   }
    //   const characterScoreData = await getCharacterScoreData(userData?.email)
    //   if(characterScoreData === null || characterScoreData === undefined) {
    //     setUserCharacterScoreData({...userCharacterScoreData, loading:false, error: "Error fetching character scores"})
    //   }
    //   console.log(characterScoreData)
    //   setUserCharacterScoreData({data: characterScoreData, loading: false, error:""})
    // }

    //Works faster but doesn't work offline
    const fetchScoreCount = async () => {
      if (!userData?.email) {
        setUserCharacterScoreCount({ ...userCharacterScoreCount, loading: false, error: "No email found" })
      }
      const characterScoreCount = await getCharacterScoreCount(userData?.email)
      if (characterScoreCount === null || characterScoreCount === undefined) {
        setUserCharacterScoreCount({ ...userCharacterScoreCount, loading: false, error: "Error fetching character scores" })
      }
      setUserCharacterScoreCount({ data: characterScoreCount, loading: false, error: "" })
    }

    if (userData) {

      fetchScoreCount();
      setLoading(false);
    }

  }, [userData]);

  const samplesvg =  `<svg version="1.1" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">

<g transform="scale(1, -1) translate(0, -900)">
  <path d="M 323 706 Q 325 699 328 694 Q 334 686 367 671 Q 474 619 574 561 Q 600 545 617 543 Q 627 545 631 559 Q 641 576 613 621 Q 575 684 334 717 Q 321 719 323 706 Z" class="stroke1"/>
  <path d="M 312 541 Q 314 535 316 531 Q 320 524 347 512 Q 455 461 563 397 Q 588 380 606 380 Q 615 382 619 396 Q 629 414 602 457 Q 564 519 321 554 Q 320 555 319 555 Q 310 555 312 541 Z" class="stroke2"/>
  <text x="336" y="704" style="transform-origin:336px 704px; transform:scale(1,-1);">1</text>
  <text x="317" y="548" style="transform-origin:317px 548px; transform:scale(1,-1);">2</text></g>
</svg>`

const sample : Character = {
    id: '0',
    unicode: "⺀",
    unicode_str: "⺀",
    on: [],
    kun: [],
    nanori: [],
    radicals: [],
    english: ["ice"],
    one_word_meaning: "",
    stroke_count: 2,
    freq: null,
    grade: null,
    jlpt: null,
    compounds: undefined,
    parts: [],
    coords: [[[336,704],[450,666],[554,620],[587,595],[614,558]],[[317,548],[347,531],[455,496],[543,456],[578,430],[602,395]]],
    totalLengths: 2736.991026413281,
    svg: samplesvg,
}

  // const character: Character = characterParser(charData);

  return (
    <div className="home-page">
      <h2 className="home-greeting">
        Hello, {user?.displayName}
      </h2>

      <DrawSandbox allowDisplay={true} recall={false} character={sample}/>
      {/* <HomeStats /> */}
      {(decks === null || decks === undefined || userData === null) ? <LoadingSpinner /> : <HomeStudyPrompt
        newUser={userData}
        suggestedDeck={{
          ...decks[0],
          id: 0
        }}
      />}
      <div className="deck-title">Review Mode</div>

      {userCharacterScoreCount.loading ? <LoadingSpinner /> :
        userCharacterScoreCount.error || userCharacterScoreCount.data === null ? <p>error: {userCharacterScoreCount.error}</p> :
          userCharacterScoreCount.data > 0 ?
            <button onClick={() => { navigate("/review") }}>
              Study words so far
            </button>
            :
            userCharacterScoreCount.data === 0 ?
              <div>Learn some kanji before using review mode.</div> :
              <div>Review Mode is currently not available offline.</div>
      }

      <div className="deck-title">Recent Decks</div>
      {(loading || decks === null || decks === undefined || userData === null) ? <LoadingSpinner /> : <DeckList length={3} user={userData} decks={decks} ></DeckList>}
      {/* {JSON.stringify(userData)}
    {JSON.stringify(decks)} */}
    </div >
  );
};

export default Home;