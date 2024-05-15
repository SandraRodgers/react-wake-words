"use client";
import React, { createContext, useState, useEffect } from "react";

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [audioContext, setAudioContext] = useState(null);
  const [stream, setStream] = useState(null);
  const [inputPoint, setInputPoint] = useState(null);
  const [scriptProcessor, setScriptProcessor] = useState(null); // Add this state for scriptProcessor
  const [audioBuffer, setAudioBuffer] = useState({});

  useEffect(() => {
    const initAudioContext = async () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      setAudioContext(context);

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setStream(mediaStream);
        const source = context.createMediaStreamSource(mediaStream);
        const input = context.createGain();
        source.connect(input);

        // Create a ScriptProcessorNode
        const processor = context.createScriptProcessor(1024, 1, 1);
        processor.onaudioprocess = (e) => {
          // Handle the audio processing here
          const inputBuffer = e.inputBuffer; // The input buffer is the raw PCM data
          setAudioBuffer({ buffer: inputBuffer, timestamp: Date.now() }); // Append new audio data
        };
        input.connect(processor);
        processor.connect(context.destination);

        setInputPoint(input);
        setScriptProcessor(processor); // Store processor in state
      } catch (err) {
        console.error("Error getting audio", err);
      }
    };

    if (!audioContext) {
      initAudioContext();
    }

    return () => {
      stream && stream.getTracks().forEach((track) => track.stop());
      audioContext && audioContext.close();
      scriptProcessor && scriptProcessor.disconnect(); // Clean up processor
    };
  }, []);

  return (
    <AudioContext.Provider value={{ audioContext, inputPoint, audioBuffer }}>
      {children}
    </AudioContext.Provider>
  );
};
