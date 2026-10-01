// import { useState } from "react";
import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Camera,
  MoreVertical,
  Monitor,
} from "lucide-react";

import "./Call.css";

function Call() {
  const navigate = useNavigate();
  const location = useLocation();

  const isVideoCall = location.pathname === "/video-call";

  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const screenStreamRef = useRef(null);
  const startScreenShare = async () => {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    alert("Screen sharing is not supported in this browser.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    screenStreamRef.current = stream;
    setScreenSharing(true);

    const videoTrack = stream.getVideoTracks()[0];

    videoTrack.onended = () => {
      setScreenSharing(false);
      screenStreamRef.current = null;
    };
  } catch (error) {
    console.log("Screen sharing cancelled or failed:", error);
  }
};

const stopScreenShare = () => {
  if (screenStreamRef.current) {
    screenStreamRef.current.getTracks().forEach((track) => {
      track.stop();
    });

    screenStreamRef.current = null;
  }

  setScreenSharing(false);
};

const endCall = () => {
  stopScreenShare();
  navigate("/messages");
};
  return (
    <div className="call-page">

      {/* TOP BAR */}
      <div className="call-topbar">

        <div className="call-user-info">

          <div className="call-user-avatar">
            A
          </div>

          <div>
            <h2>Arun Kumar</h2>

            <p>
              {isVideoCall
                ? "Video Call"
                : "Voice Call"}
            </p>
          </div>

        </div>

        <button className="call-more-button">
          <MoreVertical size={20} />
        </button>

      </div>

      {/* MAIN CALL AREA */}
      <div
        className={`call-content ${
          isVideoCall
            ? "video-call-content"
            : "voice-call-content"
        }`}
      >

        {/* VIDEO AREA */}
        {isVideoCall && (
          <>
            {/* REMOTE VIDEO PLACEHOLDER */}
            <div className="remote-video">

              <div className="remote-user">

                <div className="large-call-avatar">
                  A
                </div>

                <h2>Arun Kumar</h2>

                <p>Connecting...</p>

              </div>

              {/* YOUR VIDEO */}
              <div className="local-video">

                {cameraOn ? (
                  <div className="local-video-placeholder">
                    <Camera size={22} />
                    <span>Your camera</span>
                  </div>
                ) : (
                  <div className="camera-off">
                    <VideoOff size={25} />
                    <span>Camera Off</span>
                  </div>
                )}

              </div>

            </div>
          </>
        )}

        {/* VOICE CALL */}
        {!isVideoCall && (
          <div className="voice-call-center">

            <div className="voice-avatar-wrapper">

              <div className="voice-avatar-ring"></div>

              <div className="voice-call-avatar">
                A
              </div>

            </div>

            <h1>Arun Kumar</h1>

            <p className="call-status">
              Calling...
            </p>

            <p className="skill-exchange">
              Python ↔ UI/UX Design
            </p>

          </div>
        )}

      </div>

      {/* CALL CONTROLS */}
      <div className="call-controls">

        {/* MICROPHONE */}
        <button
          className={`call-control ${
            muted ? "control-active" : ""
          }`}
          onClick={() => setMuted(!muted)}
          title={
            muted
              ? "Unmute microphone"
              : "Mute microphone"
          }
        >
          {muted ? (
            <MicOff size={22} />
          ) : (
            <Mic size={22} />
          )}

          <span>
            {muted ? "Unmute" : "Mute"}
          </span>
        </button>

        {/* VIDEO */}
        {isVideoCall && (
          <button
            className={`call-control ${
              !cameraOn ? "control-active" : ""
            }`}
            onClick={() =>
              setCameraOn(!cameraOn)
            }
            title={
              cameraOn
                ? "Turn camera off"
                : "Turn camera on"
            }
          >
            {cameraOn ? (
              <Video size={22} />
            ) : (
              <VideoOff size={22} />
            )}

            <span>
              {cameraOn ? "Camera" : "Camera Off"}
            </span>
          </button>
        )}
        {/* SHARE SCREEN */}
{isVideoCall && (
  <button
    className={`call-control ${
      screenSharing ? "control-active" : ""
    }`}
    onClick={
      screenSharing
        ? stopScreenShare
        : startScreenShare
    }
    title={
      screenSharing
        ? "Stop sharing"
        : "Share screen"
    }
  >
    <Monitor size={22} />

    <span>
      {screenSharing
        ? "Stop Sharing"
        : "Share Screen"}
    </span>
  </button>
)}

        {/* SPEAKER */}
        <button
          className={`call-control ${
            !speakerOn ? "control-active" : ""
          }`}
          onClick={() =>
            setSpeakerOn(!speakerOn)
          }
          title={
            speakerOn
              ? "Turn speaker off"
              : "Turn speaker on"
          }
        >
          {speakerOn ? (
            <Volume2 size={22} />
          ) : (
            <VolumeX size={22} />
          )}

          <span>
            {speakerOn ? "Speaker" : "Muted"}
          </span>
        </button>

        {/* END CALL */}
        <button
          className="end-call-button"
          onClick={endCall}
          title="End call"
        >
          <PhoneOff size={23} />

          <span>End Call</span>
        </button>

      </div>

    </div>
  );
}

export default Call;