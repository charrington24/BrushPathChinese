import React, {
  MutableRefObject,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../styles/App.css";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { useEffect } from "react";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ClearIcon from "@mui/icons-material/Clear";
import DoneIcon from "@mui/icons-material/Done";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import grade from "../grading/grade_controller";
import "../styles/styles.css";
import Character from "../types/Character";
import KanjiGrade from "../types/KanjiGrade";
// import { interpretImage } from "../recogition/interpretImage";
import type PredictionResult from "../recogition/predictionDisplay";
import { AuthContext } from "../utils/FirebaseContext";
import { upsertCharacterScoreData } from "../utils/FirebaseQueries";
import Feedback from "../grading/Feedback";
import gradeToColor from "../utils/gradeToColor";
import { DocumentData } from "@firebase/firestore";
import { interpolate } from "../grading/interpolate";

const passing = 0.65;

const styles = {
  button: {
    borderWidth: "0px",
    padding: "10px",
    backgroundColor: "transparent",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    display: "flex",
    flexDirection: "column" as "column",
    justifyContent: "space-between",
    // alignItems: "center",
    height: "100%",
    width: "100%",
    maxWidth: "500px",
  },
  svg: {
    position: "absolute" as "absolute",
    zIndex: -1,
    opacity: 0.75,
  },
  gradeSvg: {
    position: "absolute" as "absolute",
    zIndex: 1,
    opacity: 1,
  },

  // border: '1rem solid #9c9c9c',
  // borderRadius: '1rem',
};

const parser = new DOMParser();


const samplesvg =  `<svg version="1.1" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
<g stroke="lightgray" stroke-dasharray="1,1" stroke-width="1" transform="scale(4, 4)">
  <line x1="0" y1="0" x2="256" y2="256"/>
  <line x1="256" y1="0" x2="0" y2="256"/>
  <line x1="128" y1="0" x2="128" y2="256"/>
  <line x1="0" y1="128" x2="256" y2="128"/>
</g>
<g transform="scale(1, -1) translate(0, -900)">
  <style type="text/css">
      .stroke1 {fill: #BF0909;}
      .stroke2 {fill: #BFBF09;}
      .stroke3 {fill: #09BF09;}
      .stroke4 {fill: #09BFBF;}
      .stroke5 {fill: #0909BF;}
      .stroke6 {fill: #BF09BF;}
      .stroke7 {fill: #42005e;}
      .stroke8 {fill: #ff3333;}
      .stroke9 {fill: #BFBFBF;}
      .stroke10 {fill: #00a53f;}
      .stroke11 {fill: #fff000;}
      .stroke12 {fill: #6600a5;}
      .stroke13 {fill: #0053a5;}
      .stroke14 {fill: #62c22b;}
      .stroke15 {fill: #BF09BF;}
      .stroke16 {fill: #BF0909;}
      .stroke17 {fill: #BFBF09;}
      .stroke18 {fill: #09BF09;}
      .stroke19 {fill: #09BFBF;}
      .stroke20 {fill: #0909BF;}
      text {
          font-family: Helvetica;
          font-size: 50px;
          fill: #FFFFFF;
          paint-order: stroke;
          stroke: #000000;
          stroke-width: 4px;
          stroke-linecap: butt;
          stroke-linejoin: miter;
          font-weight: 800;
      }
  </style>

  <path d="M 531 651 Q 736 675 868 663 Q 893 662 899 670 Q 906 683 894 696 Q 863 724 817 744 Q 801 750 775 740 Q 712 725 483 694 Q 185 660 168 657 Q 162 658 156 657 Q 141 657 141 645 Q 140 632 160 618 Q 178 605 211 594 Q 221 590 240 599 Q 348 629 470 644 L 531 651 Z" class="stroke1"/>
  <path d="M 435 100 Q 407 107 373 116 Q 360 120 361 112 Q 361 103 373 94 Q 445 39 491 -5 Q 503 -15 518 2 Q 560 60 553 141 Q 541 447 548 561 Q 548 579 550 596 Q 556 624 549 635 Q 545 642 531 651 C 509 671 457 671 470 644 Q 485 629 485 573 Q 488 443 488 148 Q 487 112 477 99 Q 464 92 435 100 Z" class="stroke2"/>
  <text x="153" y="645" style="transform-origin:153px 645px; transform:scale(1,-1);">1</text>
  <text x="478" y="644" style="transform-origin:478px 644px; transform:scale(1,-1);">2</text></g>
</svg>`

const sample : Character = {
    id: '0',
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
    coords: [[[153,645],[177,634],[219,628],[416,663],[794,706],[823,702],[887,679]],[[478,644],[518,610],[518,101],[495,55],[450,68],[369,110]]],
    totalLengths: 1597.4033034269157,
    svg: samplesvg,
}


interface DrawProps {
  character?: Character;
  handleComplete?: (arg0: Character, arg1: KanjiGrade) => void;
  allowDisplay: boolean;
  handleAdvance?: (arg0: Character, arg1: KanjiGrade) => void;
  recall: boolean;
  learn?: boolean;
  svg?: string;
}
// Define types for coordinates
interface Point {
  x: number;
  y: number;
}

// Function to calculate the coordinates relative to the canvas
function calculateIconPosition(
  canvasRect: DOMRect,
  path: SVGPathElement,
  index: number
): Point {
  const location = path.getPointAtLength(path.getTotalLength() / 2);
  const offsetX = canvasRect.left + window.scrollX;
  const offsetY = canvasRect.top + window.scrollY;
  return { x: offsetX, y: offsetY };
}

const Draw: React.FC<DrawProps> = (props) => {
  const { userData, getUserData } = useContext(AuthContext);
  const canvas: any = useRef<any>();
  const [svgHtml, setSvgHtml] = React.useState({ __html: "" });
  const [inputStrokes, setInputStrokes] = React.useState<number>(0);
  const [displaySVG, setDisplaySVG] = React.useState<boolean>(
    !props.recall && (props.learn || false)
  );
  const [readOnly, setReadOnly] = React.useState<boolean>(false);
  const [kanji, setKanji] = React.useState<string>("何");
  const [askInput, setAskInput] = React.useState<boolean>(true);
  const [showStrokeGuide, setStrokeGuide] = React.useState<boolean>(true);
  const [allowDisplaySVG, setAllowDisplaySVG] = React.useState<boolean>(
    props.allowDisplay
  );
  const [kanji_grade, setKanjiGrade] = React.useState<KanjiGrade>({
    overallGrade: -1,
    overallFeedback: "",
    grades: [],
    feedback: [],
    strokeInfo: [],
  });

  const [attempts, setAttempts] = React.useState<
    (KanjiGrade & { hint: boolean })[]
  >([]);

  function clearKanji() {
    canvas.current.clearCanvas();
    setInputStrokes(0);
    setReadOnly(false);
    setKanjiGrade({
      overallGrade: -1,
      overallFeedback: "",
      grades: [],
      feedback: [],
      strokeInfo: [],
    });
  }

  const handleUpsertCharacterScoreData = async (
    characterID: string,
    grade: number
  ) => {
    if (!userData) {
      const buffer = async () => {};
      buffer().then(() => {
        if (userData) {
          upsertCharacterScoreData(
            (userData as DocumentData)?.email || "",
            characterID,
            grade
          );
        }
      });
    } else {
      upsertCharacterScoreData(userData?.email, characterID, grade);
    }
  };

  const checkStrokeNumber = () => {
    const canvasElement = document.getElementById("react-sketch-canvas");
    const paths = canvasElement?.getElementsByTagName("path").length;
    setInputStrokes(paths || 0);
  };

  const [color, setColor] = React.useState("rgba(0,0,0,0)");

  useEffect(() => {
    setColor(gradeToColor(kanji_grade.overallGrade));
  }, [kanji_grade]);

  const [prediction, setPrediction] = React.useState<PredictionResult[]>();
  const [strokeColor, setStrokeColor] = useState("rgba(40, 40, 41, .75)");

  let character = props.character;

  useLayoutEffect(() => {
    if (props.character) {
      setKanji(props.character.unicode);
      setAskInput(false);

    }
  });

  useEffect(() => {
    const loadSvg = async (unicode: string) => {
      // Load SVG dynamically
      try {
        var svgText;
        if (character?.svg) {
          svgText = character?.svg;
        } else {
          const svgModule = await fetch("/joyo_kanji/" + unicode + ".svg");
          svgText = await svgModule.text();
        }
        // console.log(svgText)
        console.log(interpolate(svgText))

        var doc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = doc.getElementsByTagName("svg")[0];
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        const paths = svg.getElementsByTagName("path");
        var circles = svg.getElementsByTagName("circle");
        checkStrokeNumber();
        while (circles.length > 0) {
          circles[0].remove();
        }
        for (var i = 0; i < paths.length; i++) {
          paths[i].setAttribute("stroke", "rgba(140, 140, 241, .75)");
          paths[i].setAttribute("stroke-width", "3");

          if (showStrokeGuide && i === inputStrokes) {
            const startDot = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle"
            );
            const startPosition = paths[i].getPointAtLength(0);
            startDot.setAttribute("cx", startPosition.x.toString());
            startDot.setAttribute("cy", startPosition.y.toString());
            startDot.setAttribute("r", "4");
            startDot.setAttribute("fill", "rgba(0, 246, 156, 0.75)");
            svg.appendChild(startDot);

            const endDot = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle"
            );
            const pathLength = paths[i].getTotalLength();
            const endPosition = paths[i].getPointAtLength(pathLength);
            endDot.setAttribute("cx", endPosition.x.toString());
            endDot.setAttribute("cy", endPosition.y.toString());
            endDot.setAttribute("r", "4");
            endDot.setAttribute("fill", "rgba(246, 0, 0, 0.75)"); // Change color as needed
            svg.appendChild(endDot);
          }
        }
        const nums = svg.getElementsByTagName("text");
        for (var i = 0; i < nums.length; i++) {
          nums[i].setAttribute("fill", "rgba(140, 140, 241, .75)");
        }
        if (inputStrokes < nums.length) {
          while (nums.length > 0) {
            nums[0].remove();
          }
        }
        svgText = svg.outerHTML;

        setSvgHtml({ __html: svgText });
      } catch (e) {}
    };
    // const unicode = kanji?.codePointAt(0)?.toString(16).padStart(5, '0') || '';
    const unicode = props.character?.unicode_str
      ? props.character?.unicode_str
      : "";
    loadSvg(unicode);
  }, [kanji, inputStrokes]);

  useEffect(() => {
    const checkDarkMode = () => {
      setStrokeColor(
        document.body.classList.contains("dark-mode")
          ? "rgba(224, 224, 224, .75)"
          : "rgba(40, 40, 41, .75)"
      );
    };

    checkDarkMode();
    checkStrokeNumber();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = document.getElementById("react-sketch-canvas");
    canvas?.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
  }, []);

  const handleAdvance = (character: Character, grade: KanjiGrade) => {
    setAttempts([]);
    if (props.handleAdvance) {
      props.handleAdvance(character, grade);
    }
  };

  useEffect(() => {
    // This function will be called whenever someProp changes
    // Perform any necessary actions here
    // Example: setState(...)

    setAllowDisplaySVG(props.allowDisplay);
  }, [props.allowDisplay]);

  const displayRetryWithoutHintButton = useMemo(() => {
    //If not in recall mode (ex dictionary page), don't show button
    // if (!props.recall) {
    //   return false;
    // }

    //Learn Mode
    if (props.learn) {
      const attemptsWithHint = attempts.filter(
        (grade) => grade.overallGrade >= 65 && grade.hint
      );
      const passingWithoutHint = attempts.filter(
        (grade) => grade.overallGrade >= 65 && !grade.hint
      );
      const lastAttemptPassedWithHint = attempts.length
        ? attempts[attempts.length - 1].hint &&
          attempts[attempts.length - 1].overallGrade >= 65
        : false;
      // debugger;

      if (
        attemptsWithHint.length >= 1 &&
        passingWithoutHint.length === 0 &&
        lastAttemptPassedWithHint
      ) {
        return true;
      } else {
        return false;
      }
    }
    //Review Mode
    else {
      return true;
    }
  }, [attempts, allowDisplaySVG]);

  const displayRetryWithHintButton = useMemo(() => {
    //If not in recall mode (ex dictionary page), don't show button
    // if (!props.recall) {
    //   return false;
    // }

    //Learn Mode
    if (props.learn) {
      const attemptsWithHint = attempts.filter(
        (grade) => grade.overallGrade >= 65 && grade.hint
      );
      const passingWithoutHint = attempts.filter(
        (grade) => grade.overallGrade >= 65 && !grade.hint
      );
      const lastAttemptPassedWithHint = attempts.length
        ? attempts[attempts.length - 1].hint &&
          attempts[attempts.length - 1].overallGrade >= 65
        : false;
      // debugger;

      if (
        attemptsWithHint.length >= 1 &&
        passingWithoutHint.length === 0 &&
        !lastAttemptPassedWithHint
      ) {
        return true;
      } else {
        return false;
      }
    }
    //Review Mode
    else {
      return true;
    }
  }, [attempts, allowDisplaySVG]);

  return (
    <div style={styles.container}>
      {askInput && (
        <div className="kanji-input-wrapper">
          <p className="kanji-input-prompt">Enter Kanji to Practice:</p>
          <input
            className="kanji-input-typed"
            placeholder="Enter Kanji"
            onChange={(e) => {
              setKanji(e.target.value);
            }}
            value={kanji}
          />
        </div>
      )}

      <div
        className="canvas"
        onMouseUp={checkStrokeNumber}
        onTouchEnd={checkStrokeNumber}
      >
        <div
          className="canvas-color"
          style={{ border: `7px solid ${color}`, opacity: ".5" }}
        ></div>
        <ReactSketchCanvas
          ref={canvas}
          style={{
            width: "99%",
            height: "99%",
            borderRadius: "10px",
            pointerEvents: readOnly ? "none" : "auto",
          }}
          strokeWidth={7}
          strokeColor={strokeColor}
          canvasColor="rgba(214, 90, 181, 0.01)"
        />
        {displaySVG && (
          <div dangerouslySetInnerHTML={svgHtml} style={styles.svg} />
        )}
        <button
          className="clear-kanji"
          style={styles.button}
          onClick={() => {
            canvas.current.clearCanvas();
            setInputStrokes(0);
            setReadOnly(false);
            setKanjiGrade({
              overallGrade: -1,
              overallFeedback: "",
              grades: [],
              feedback: [],
              strokeInfo: [],
            });
          }}
        >
          <ClearIcon fontSize="medium"></ClearIcon>
        </button>
        {allowDisplaySVG && (
          <button
            className="view-kanji"
            style={styles.button}
            onClick={() => {
              setDisplaySVG(!displaySVG);
            }}
          >
            {displaySVG ? (
              <VisibilityOffIcon fontSize="medium" />
            ) : (
              <VisibilityIcon fontSize="medium" />
            )}
          </button>
        )}
        {kanji_grade.overallGrade !== -1 ? (
          <button
            className="check-kanji"
            style={styles.button}
            onClick={() => {
              canvas.current.clearCanvas();
              setInputStrokes(0);
              setReadOnly(false);
              setKanjiGrade({
                overallGrade: -1,
                overallFeedback: "",
                grades: [],
                feedback: [],
                strokeInfo: [],
              });
            }}
          >
            <AutorenewIcon fontSize="medium" />
          </button>
        ) : (
          <button
            className="check-kanji"
            style={styles.button}
            onClick={() => {
              if (
                document
                  .getElementById("react-sketch-canvas")
                  ?.getElementsByTagName("path").length
              ) {
                setReadOnly(true);
                canvas.current.exportSvg().then((data: any) => {
                  const convertCoords = (coords: any) => {
                    console.log(structuredClone(coords));
                    let coordsArr: any[] = [];
                    Object.keys(coords)
                      .map((key: string) => parseInt(key))
                      .sort((a, b) => a - b)
                      .forEach((coordKey) => {
                        coordsArr.push(
                          coords[coordKey].map(
                            (coordsSet: { x: number; y: number }) => [
                              coordsSet.x,
                              coordsSet.y,
                            ]
                          )
                        );
                      });
                    console.log(structuredClone(coordsArr));
                
                    return coordsArr[0][0][0] ? coordsArr : coords;
                  };
                  const startTime = performance.now();
                  grade(
                    data,
                    kanji,
                    passing,
                    convertCoords(character?.coords),
                    character?.totalLengths
                  )
                    .then((grade: KanjiGrade) => {
                      setKanjiGrade(grade);
                      setAttempts((prevAttempts) => {
                        const attempts = [
                          ...prevAttempts,
                          { ...grade, hint: allowDisplaySVG },
                        ];
                        const lastAttempt = attempts[attempts.length - 1];
                        const isSuccessful =
                          lastAttempt.overallGrade >= 65 && !lastAttempt.hint;
                        if (props.learn && !props.recall) {
                          const some = attempts.some(
                            (grade) => grade.overallGrade >= 65 && !grade.hint
                          );
                          if (!some) {
                            if (allowDisplaySVG) {
                              if (grade.overallGrade >= 65) {
                                setAllowDisplaySVG(false);
                                setDisplaySVG(false);
                              }
                            } else {
                              setAllowDisplaySVG(true);
                              setDisplaySVG(true);
                            }
                          } else {
                            setAllowDisplaySVG(true);
                            setDisplaySVG(true);
                          }
                        }

                        if (props.recall) {
                          //if not success full, show them svg
                          if (!isSuccessful) {
                            //doesnt not hit it perfect
                            if (allowDisplaySVG) {
                              //displa is tre in temp mode
                              if (grade.overallGrade >= 65) {
                                //they pass in temp mode go to final mode
                                setAllowDisplaySVG(false);
                                setDisplaySVG(false);
                              }
                            } else {
                              //fail in temp mode back to square one

                              setDisplaySVG(true);
                              setAllowDisplaySVG(true);
                            }
                          } else {
                            setAllowDisplaySVG(false);
                            setDisplaySVG(false);
                          }
                        }

                        return attempts;
                      });
                      //If in learn mode, hide svg on second attempt

                      if (props.character) {
                        if (props.handleComplete) {
                          props.handleComplete(props.character, grade);
                        }
                        if (props.character.unicode_str) {
                          handleUpsertCharacterScoreData(
                            props.character.unicode_str,
                            grade.overallGrade
                          );
                        } else {
                          console.log("Character score not saved..");
                        }
                      }

                      if (
                        grade.overallGrade < 65 ||
                        grade.overallGrade === -1 ||
                        !grade.overallGrade
                      ) {
                        canvas.current
                          .exportImage("jpeg")
                          .then((data: any) => {
                            // interpretImage(data).then(result => {
                            //   setPrediction(result);
                            //   if (kanji === result?.[0]?.label) return;
                            //   if (grade.overallFeedback === "") {
                            //     setKanjiGrade(prevState => ({
                            //       ...prevState,
                            //       overallFeedback: grade.overallFeedback + "Looks like you might have written the kanji " + result?.[0]?.label ?? "No feedback available"
                            //     }));
                            //   }
                            //   else {
                            //     setKanjiGrade(prevState => ({
                            //       ...prevState,
                            //       overallFeedback: grade.overallFeedback + "Did you draw " + result?.[0]?.label + " instead?" ?? "No feedback available"
                            //     }));
                            //   }
                            // }).catch(error => {
                            //   console.error('Error interpreting image:', error);
                            // });
                          })
                          .catch((e: any) => {
                            console.error(e);
                          });
                      }
                    })
                    .catch((e: any) => {
                      console.error(e);
                    });
                  const endTime = performance.now();
                  console.log("Time taken:", endTime - startTime, "ms");
                });
              }
            }}
          >
            <DoneIcon fontSize="medium" />
          </button>
        )}
      </div>
      {(props.learn || props.recall) &&
        displayRetryWithoutHintButton &&
        kanji_grade.overallGrade == -1 && (
          <div className="try-again-container">
            <div className="try-again-text">
              <strong>Try again with no guide!</strong>
            </div>
          </div>
        )}
      <Feedback
        displayRetryWithHintButton={displayRetryWithHintButton}
        displayRetryWithoutHintButton={displayRetryWithoutHintButton}
        setDisplaySVG={setDisplaySVG}
        setAllowDisplay={setAllowDisplaySVG}
        clearKanji={clearKanji}
        allowDisplay={allowDisplaySVG}
        attempts={attempts}
        recall={props.recall}
        learn={props.learn || false}
        character={props.character!}
        handleAdvance={handleAdvance}
        handleComplete={props.handleComplete}
        kanjiGrade={kanji_grade}
        passing={passing}
        color={color}
      />
    </div>
  );
};

export default Draw;
