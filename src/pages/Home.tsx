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
import { useDecks } from "../utils/DeckContext";
import {
  getDecksFromRefs,
  getDeckFromID,
  getCharacterScoreData,
  getCharacterScoreCount,
  updateLanguageField,
} from "../utils/FirebaseQueries";
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

  const [userCharacterScoreData, setUserCharacterScoreData] =
    useState<RetrievableData>({ data: null, loading: true, error: "" });
  const [userCharacterScoreCount, setUserCharacterScoreCount] =
    useState<RetrievableCount>({ data: -1, loading: true, error: "" });

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
        setUserCharacterScoreCount({
          ...userCharacterScoreCount,
          loading: false,
          error: "No email found",
        });
      }
      const characterScoreCount = await getCharacterScoreCount(userData?.email);
      if (characterScoreCount === null || characterScoreCount === undefined) {
        setUserCharacterScoreCount({
          ...userCharacterScoreCount,
          loading: false,
          error: "Error fetching character scores",
        });
      }
      setUserCharacterScoreCount({
        data: characterScoreCount,
        loading: false,
        error: "",
      });
    };

    if (userData) {
      fetchScoreCount();
      setLoading(false);
    }
  }, [userData]);

  const samplesvg = `<svg version="1.1" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">

  <g transform="scale(1, 1) translate(0, 0)">

    <g style="fill:none;stroke:#000000;stroke-width:20;stroke-linecap:round;stroke-linejoin:round;">
        
      <path clip-path="url(#make-me-a-hanzi-clip-0)" d="M 336 704 L 450 666 L 554 620 L 587 595 L 614 558" fill="none" id="make-me-a-hanzi-animation-0" stroke-dasharray="449 898" stroke-linecap="round"></path>
    

      <path clip-path="url(#make-me-a-hanzi-clip-1)" d="M 317 548 L 347 531 L 455 496 L 543 456 L 578 430 L 602 395" fill="none" id="make-me-a-hanzi-animation-1" stroke-dasharray="459 918" stroke-linecap="round"></path>
    </g>
  </g>
</svg>`;

  const flippedsvg = `<svg xmlns:svg="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 4000 4000">

  <g transform="scale(1, 1) translate(0, -200)">

    <g style="fill:none;stroke:#000000;stroke-width:50;stroke-linecap:round;stroke-linejoin:round;">
      <path clip-path="url(#make-me-a-hanzi-clip-0)" d="M 153.0,379.0 L 177.0,390.0 L 219.0,396.0 L 416.0,361.0 L 794.0,318.0 L 823.0,322.0 L 887.0,345.0" fill="none" id="make-me-a-hanzi-animation-0" stroke-dasharray="875 1750" stroke-linecap="round" />
      <path clip-path="url(#make-me-a-hanzi-clip-1)" d="M 478.0,380.0 L 518.0,414.0 L 518.0,923.0 L 495.0,969.0 L 450.0,956.0 L 369.0,914.0" fill="none" id="make-me-a-hanzi-animation-1" stroke-dasharray="879 1758" stroke-linecap="round" />
  </g>
  </g>
</svg>`;

  const sample: Character = {
    id: "0",
    unicode: "丁",
    unicode_str: "丁",
    on: [],
    kun: [],
    nanori: [],
    radicals: [],
    english: ["male adult"],
    one_word_meaning: "",
    stroke_count: 2,
    freq: null,
    grade: null,
    jlpt: null,
    compounds: undefined,
    parts: [],
    coords: coordinates,
    totalLengths: 651.8045349121094,
    svg: flippedsvg,
  };

  // const character: Character = characterParser(charData);

  return (
    <div className="home-page">
      <h2 className="home-greeting">Hello, {user?.displayName}</h2>

      <DrawSandbox
        allowDisplay={true}
        recall={false}
        character={sample}
        learn={true}
      />
      {/* <HomeStats /> */}
      {decks === null || decks === undefined || userData === null ? (
        <LoadingSpinner />
      ) : (
        <HomeStudyPrompt
          newUser={userData}
          suggestedDeck={{
            ...decks[0],
            id: 0,
          }}
        />
      )}
      <div className="deck-title">Review Mode</div>

      {userCharacterScoreCount.loading ? (
        <LoadingSpinner />
      ) : userCharacterScoreCount.error ||
        userCharacterScoreCount.data === null ? (
        <p>error: {userCharacterScoreCount.error}</p>
      ) : userCharacterScoreCount.data > 0 ? (
        <button
          onClick={() => {
            navigate("/review");
          }}
        >
          Study words so far
        </button>
      ) : userCharacterScoreCount.data === 0 ? (
        <div>Learn some kanji before using review mode.</div>
      ) : (
        <div>Review Mode is currently not available offline.</div>
      )}

      <div className="deck-title">Recent Decks</div>
      {loading || decks === null || decks === undefined || userData === null ? (
        <LoadingSpinner />
      ) : (
        <DeckList length={3} user={userData} decks={decks}></DeckList>
      )}
      {/* {JSON.stringify(userData)}
    {JSON.stringify(decks)} */}
    </div>
  );
};

const coordinates = [
  [
    [336, 704],
    [345.5191345214844, 700.8269653320312],
    [355.03826904296875, 697.6539306640625],
    [364.55743408203125, 694.4808349609375],
    [374.0765686035156, 691.3078002929688],
    [383.595703125, 688.134765625],
    [393.1148681640625, 684.9617309570312],
    [402.6340026855469, 681.7886352539062],
    [412.1531677246094, 678.6156005859375],
    [421.67230224609375, 675.4425659179688],
    [431.1914367675781, 672.26953125],
    [440.7106018066406, 669.0964965820312],
    [450.2214660644531, 665.9020385742188],
    [459.3979797363281, 661.8432006835938],
    [468.574462890625, 657.7843627929688],
    [477.7509765625, 653.7255249023438],
    [486.927490234375, 649.6666870117188],
    [496.1039733886719, 645.6078491210938],
    [505.2804870605469, 641.5490112304688],
    [514.4569702148438, 637.4901733398438],
    [523.6334838867188, 633.4313354492188],
    [532.8099975585938, 629.3724975585938],
    [541.9865112304688, 625.3136596679688],
    [551.1630249023438, 621.2548217773438],
    [559.525390625, 615.8140869140625],
    [567.5234375, 609.7549438476562],
    [575.5215454101562, 603.69580078125],
    [583.5195922851562, 597.6366577148438],
    [590.3409423828125, 590.4216918945312],
    [596.2556762695312, 582.3162841796875],
    [602.1704711914062, 574.2108154296875],
    [608.085205078125, 566.1054077148438],
  ],
  [
    [317, 548],
    [325.71905517578125, 543.0592041015625],
    [334.4381103515625, 538.118408203125],
    [343.1571960449219, 533.1776123046875],
    [352.3317565917969, 529.2720947265625],
    [361.86529541015625, 526.1825561523438],
    [371.3988037109375, 523.0929565429688],
    [380.9323425292969, 520.00341796875],
    [390.4658508300781, 516.913818359375],
    [399.9993896484375, 513.8242797851562],
    [409.53289794921875, 510.7347106933594],
    [419.0664367675781, 507.6451416015625],
    [428.5999755859375, 504.5555725097656],
    [438.13348388671875, 501.46600341796875],
    [447.6670227050781, 498.3764343261719],
    [457.1058654785156, 495.04278564453125],
    [466.229248046875, 490.8957824707031],
    [475.3526306152344, 486.7488098144531],
    [484.47601318359375, 482.601806640625],
    [493.5993957519531, 478.454833984375],
    [502.7227783203125, 474.3078308105469],
    [511.8461608886719, 470.16082763671875],
    [520.9695434570312, 466.01385498046875],
    [530.0928955078125, 461.8668518066406],
    [539.21630859375, 457.7198791503906],
    [547.7084350585938, 452.5023193359375],
    [555.7532348632812, 446.5261535644531],
    [563.7980346679688, 440.5500183105469],
    [571.8428955078125, 434.5738525390625],
    [579.3298950195312, 428.0605773925781],
    [584.9974365234375, 419.7954406738281],
    [590.6649169921875, 411.5303039550781],
    [596.3324584960938, 403.2651672363281],
  ],
];

export default Home;
