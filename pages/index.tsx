import Head from "next/head";
import styles from "../styles/Home.module.css";
import MicRecorder from "mic-recorder-to-mp3";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { faMusic, faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { Button, IconButton, Snackbar } from "@material-ui/core";
import { Close } from "@material-ui/icons";
import ReactAudioPlayer from "react-audio-player";
import AudioPlayer from "react-h5-audio-player";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [Mp3Recorder] = useState(new MicRecorder({ bitRate: 128 }));
  const [track, setTrack] = useState<any | undefined>(undefined);
  const [couldNotFind, setCouldNotFind] = useState(false);
  const [loader, setLoader] = useState(false);
  const [done, setDone] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);

  useEffect(() => {
    console.log(track);
  }, [track]);

  useEffect(() => {
    // Get Access To Microphone
    navigator.getUserMedia(
      { audio: true },
      () => {
        console.log("Permission Granted");
      },
      () => {
        console.log("Permission Denied");
        setIsBlocked(true);
      }
    );
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    if (isBlocked) {
      console.log("Permission Denied");
    } else {
      Mp3Recorder.start()
        .then(() => {
          setIsRecording(true);
        })
        .catch((e: Event) => console.error(e));
    }
  };

  const stopRecording = () => {
    setLoader(true);
    setIsRecording(false);
    Mp3Recorder.stop()
      .getMp3()
      .then(([buffer, blob]: any) => {
        setIsRecording(false);
        const file = new File(buffer, "sound.mp3", {
          type: "audio/wav",
          lastModified: Date.now(),
        });
        const form = new FormData();
        form.append("file", file, file.name);

        const options = {
          method: "POST",
          url: "https://shazam-core.p.rapidapi.com/v1/tracks/recognize",
          headers: {
            "content-type":
              "multipart/form-data; boundary=---011000010111000001101001",
            "x-rapidapi-key":
              "5db5fe023cmsh90258ea5c33841cp19ee95jsnaff46b46a51d",
            "x-rapidapi-host": "shazam-core.p.rapidapi.com",
          },
          data: form,
        };

        axios
          .request(options as any)
          .then(async function (response) {
            console.log(response);
            if (response.data.matches.length > 0) {
              setDone(true);
              setTimeout(() => {
                setTrack(response.data);
              }, 1500);
            } else {
              setCouldNotFind(true);
              setTrack(undefined);
              setLoader(false);
              setDone(false);
            }
          })
          .catch(function (error) {
            console.error(error);
          });
      })
      .catch((e: Event) => console.log(e));
  };

  if (loader && !track) {
    return (
      <div className="modal" style={{ backgroundColor: "#110033" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            bottom: -100,
          }}
        >
          {!done || couldNotFind ? (
            <img src="/loader-blue.gif" alt="" />
          ) : (
            <img src="/done.gif" alt="" />
          )}
        </div>
      </div>
    );
  }

  if (track) {
    const bg =
      "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");

    return (
      <div
        className="modal"
        style={{
          backgroundColor: bg,
        }}
      >
        <div className="container">
          <div className="popup" id="popup">
            <div
              className="popup-inner"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="popup__text"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h1
                  style={{
                    bottom: 450,
                    position: "absolute",
                    color: "#fff",
                  }}
                >
                  Preview Of "{track.track.title}"
                </h1>
                <img
                  src={track.track.images.coverart}
                  style={{
                    width: 350,
                    height: 350,
                    borderRadius: 10,
                    marginTop: 50,
                    boxShadow: "0px 0px 52px #8EC8E5",
                  }}
                  alt=""
                />
                <AudioPlayer
                  src={track.track.hub.actions[1].uri}
                  onPlay={(e) => console.log("onPlay")}
                  style={{ top: 10, position: "relative", borderRadius: 10 }}
                  // other props here
                />
              </div>
              <a className="popup__close" href="#">
                X
              </a>
            </div>
          </div>
        </div>
        <div
          onClick={() => {
            setTrack(undefined);
            setLoader(false);
            setDone(false);
          }}
        >
          <FontAwesomeIcon
            icon={faWindowClose}
            style={{
              width: 80,
              height: 80,
              position: "absolute",
              top: 20,
              right: 40,
              cursor: "pointer",
            }}
            color="#fff"
          />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            bottom: -200,
          }}
        >
          <h1 style={{ color: "#fff", fontSize: 85 }}>{track.track.title}</h1>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            bottom: -150,
          }}
        >
          <h1 style={{ color: "#fff", fontSize: 29 }} className="text-glow">
            By: {track.track.subtitle}
          </h1>
        </div>
        <div className="buttons" style={{ marginTop: 200 }}>
          <a
            className="blob-btn text-glow"
            style={{
              border: `2px solid ${bg}`,
            }}
            href="#popup"
          >
            Listen To A Preview Of "{track.track.title}"
            <span className="blob-btn__inner">
              <span className="blob-btn__blobs">
                <span className="blob-btn__blob"></span>
              </span>
            </span>
          </a>
          <br />

          <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
            <defs>
              <filter id="goo">
                <feGaussianBlur
                  in="SourceGraphic"
                  result="blur"
                  stdDeviation="10"
                ></feGaussianBlur>
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7"
                  result="goo"
                ></feColorMatrix>
                <feBlend in2="goo" in="SourceGraphic" result="mix"></feBlend>
              </filter>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Identified: Find Your Favorite Songs</title>
        <link rel="shortcut icon" href="/identifie.png" />
        <link rel="apple-touch-icon" href="/identifie.png" />
      </Head>
      {couldNotFind ? (
        <>
          <Snackbar
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            open={true}
            autoHideDuration={15000}
            onClose={() => setCouldNotFind(false)}
            action={
              <React.Fragment>
                <Button
                  color="secondary"
                  size="small"
                  onClick={() => setCouldNotFind(false)}
                >
                  OK
                </Button>
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={() => setCouldNotFind(false)}
                >
                  <Close fontSize="small" />
                </IconButton>
              </React.Fragment>
            }
            message="We couldn't find that. Make sure your computer can clearly hear the song."
          />
        </>
      ) : null}
      {!isRecording ? (
        <div
          style={{
            marginTop: "33%",
            position: "fixed",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <h1
            style={{
              color: "#fff",
              fontSize: 32,
              marginLeft: 20,
            }}
            className="text-glow"
          >
            Click To Identify Songs Around You.
          </h1>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={() => stopRecording()}
            style={{
              alignSelf: "center",
              marginTop: "198%",
              outline: "none",
              width: 400,
              height: 75,
              borderRadius: 15,
              position: "relative",
              bottom: window && screen.width <= 1440 ? 80 : 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            className="btn"
          >
            <p
              onClick={() => stopRecording()}
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: "1.3rem",
                cursor: "pointer",
              }}
            >
              Identify Music
            </p>
          </div>
        </div>
      )}
      <div
        onClick={isRecording ? () => null : () => startRecording()}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isRecording && (
          <h1
            style={{
              color: "#fff",
              position: "relative",
              top: -280,
              left: 15,
              fontSize: "3rem",
            }}
            className="text-glow"
          >
            Listening...
          </h1>
        )}

        <div
          className={!isRecording ? "border" : ""}
          style={{
            bottom: isRecording ? 100 : "",
            position: "fixed",
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
          }}
        >
          {isRecording ? (
            <div
              className="wave"
              style={{
                position: "absolute",
                bottom: window && screen.width <= 1440 ? 80 : 200,
              }}
            >
              <button className="wave__btn logo" type="button">
                <FontAwesomeIcon
                  icon={faMusic}
                  style={{
                    position: "relative",
                    right: 4,
                    width: 50,
                    height: 50,
                  }}
                  color="#fff"
                />
              </button>
              <div className="wave__container">
                <div className="wave__circle"></div>
                <div className="wave__circle"></div>
                <div className="wave__circle"></div>
              </div>
            </div>
          ) : (
            <div
              className="logo"
              style={{
                width: isRecording ? "30vmin" : "",
                height: isRecording ? "30vmin" : "",
                bottom: isRecording ? 200 : "",
              }}
            >
              <FontAwesomeIcon
                icon={faMusic}
                style={{
                  position: "relative",
                  right: 18,
                  width: 170,
                  height: 170,
                }}
                color="#fff"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
