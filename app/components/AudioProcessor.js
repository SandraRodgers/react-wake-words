import React, { useContext, useEffect, useRef, useState } from "react";
import { AudioContext } from "../context/AudioContext";
import { resampleAndMakeMono, melSpectrogram } from "../utils/audio_utils";
import * as tf from "@tensorflow/tfjs";

/*
 * This component is focused on processing the audio data and detecting specific keywords.
 */

function AudioProcessor() {
  const { audioBuffer } = useContext(AudioContext);
  const arrayBuffer = useRef([]);
  const [tfModel, setTfModel] = useState();

  const classes = ["hey", "fourth", "brain", "oov"];
  const bufferSize = 1024;
  const channels = 1;
  const windowSize = 750;
  const zmuv_mean = 0.000016;
  const zmuv_std = 0.072771;
  const log_offset = 1e-7;
  const SPEC_HOP_LENGTH = 200;
  const MEL_SPEC_BINS = 40;
  const NUM_FFTS = 512;
  const audioFloatSize = 32767;
  const sampleRate = 16000;
  const numOfBatches = 2;
  const windowBufferSize = (windowSize / 1000) * sampleRate;

  useEffect(() => {
    async function loadModel() {
      try {
        const loadedModel = await tf.loadGraphModel("model/model.json");
        console.log(loadedModel);

        setTfModel(loadedModel);
        console.log("Model loaded successfully!");
      } catch (error) {
        console.error("Failed to load the model:", error);
      }
    }

    loadModel();
  }, []);

  useEffect(() => {
    async function processAudio() {
      if (audioBuffer.buffer === undefined) return;
      const resampledMonoAudio = await resampleAndMakeMono(audioBuffer.buffer);
      if (resampledMonoAudio === undefined) return;

      arrayBuffer.current = [...arrayBuffer.current, ...resampledMonoAudio];

      let batchBuffers = [];
      let batchMels = [];

      if (arrayBuffer.current.length >= numOfBatches * windowBufferSize) {
        let batch = 0;
        let dataProcessed;
        for (
          let i = 0;
          i < arrayBuffer.current.length;
          i = i + windowBufferSize
        ) {
          let batchBuffer = arrayBuffer.current.slice(i, i + windowBufferSize);
          if (batchBuffer.length < windowBufferSize) {
            break;
          }

          const log_mels = melSpectrogram(batchBuffer, {
            sampleRate: sampleRate,
            hopLength: SPEC_HOP_LENGTH,
            nMels: MEL_SPEC_BINS,
            nFft: NUM_FFTS,
          });

          batchBuffers.push(batchBuffer);
          batchMels.push(log_mels);
          if (batch == 0) {
            dataProcessed = [];
          }
          dataProcessed = [...dataProcessed, ...flatten(log_mels)];
          batch = batch + 1;
        }

        arrayBuffer.current = [];
        // Run model with Tensor inputs and get the result.
        let outputTensor = tf.tidy(() => {
          let inputTensor = tf.tensor(
            dataProcessed,
            [
              batch,
              1,
              MEL_SPEC_BINS,
              dataProcessed.length / (batch * MEL_SPEC_BINS),
            ],
            "float32"
          );

          return tfModel.predict(inputTensor);
        });

        let outputData = await outputTensor.data();
        for (let i = 0; i < outputData.length; i = i + classes.length) {
          let scores = Array.from(outputData.slice(i, i + classes.length));
          let probs = softmax(scores);
          let class_idx = argMax(probs);
          console.log("class_idx", class_idx);
          let predictedWord = classes[class_idx];
          console.log("Predicted word", predictedWord);
        }
      }
    }

    processAudio();
  }, [audioBuffer.timestamp]);

  function flatten(log_mels) {
    const flatten_arry = [];
    for (let i = 0; i < MEL_SPEC_BINS; i++) {
      for (let j = 0; j < log_mels.length; j++) {
        flatten_arry.push(
          (Math.log(log_mels[j][i] + log_offset) - zmuv_mean) / zmuv_std
        );
      }
    }
    return flatten_arry;
  }

  function softmax(arr) {
    return arr.map(function (value, index) {
      return (
        Math.exp(value) /
        arr
          .map(function (y) {
            return Math.exp(y);
          })
          .reduce(function (a, b) {
            return a + b;
          })
      );
    });
  }

  function argMax(array) {
    return array
      .map((x, i) => [x, i])
      .reduce((r, a) => (a[0] > r[0] ? a : r))[1];
  }

  return null;
}

export default AudioProcessor;
