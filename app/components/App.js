"use client";
import React, { useState, useEffect } from "react";
import AudioControls from "./AudioControls";
import AudioProcessor from "./AudioProcessor";
import WaveformDisplay from "./WaveformDisplay";
import "plotly.js-dist/plotly"; // Make sure to import Plotly correctly

export const App = () => {
  return (
    <div className="App">
      <h1>Audio Processing App</h1>
      <AudioControls />
      <AudioProcessor />
      <WaveformDisplay />
    </div>
  );
};
