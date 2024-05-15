import React, { useContext } from "react";
import { AudioContext } from "../context/AudioContext";

function WaveformDisplay() {
  const { audioData } = useContext(AudioContext);

  // Render logic for displaying waveform or spectrogram
  return (
    <div>
      <h2>Waveform Display</h2>
      {/* Visual component here */}
    </div>
  );
}

export default WaveformDisplay;
