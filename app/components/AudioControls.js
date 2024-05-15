"use client";
import React, { useContext, useState, useEffect } from "react";
import { AudioContext } from "../context/AudioContext";

/*
 * This component is focused on user interaction, such as starting and stopping the recording.
 * It also connects the audio data to the analysis nodes.
 */

function AudioControls() {
  const { audioContext, inputPoint } = useContext(AudioContext);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (recording && audioContext && inputPoint) {
      const analyser = audioContext.createAnalyser(); // used to expose audio time and frequency data for visualization or processing.
      inputPoint.connect(analyser);
      return () => {
        // Disconnect nodes when component unmounts or recording stops
        inputPoint.disconnect(analyser);
      };
    }
  }, [recording, audioContext, inputPoint]);

  const toggleRecording = () => {
    if (audioContext.state === "suspended") {
      audioContext.resume(); // Resuming the audio context if suspended
    }
    setRecording(!recording);
  };

  return (
    <button onClick={toggleRecording}>
      {recording ? "Stop Recording" : "Start Recording"}
    </button>
  );
}

export default AudioControls;
