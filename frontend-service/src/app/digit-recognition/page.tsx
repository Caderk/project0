"use client";

import React, { useState } from "react";
import { predictDigit } from "@utils/api/digit-recognition";
import Canvas from "@components/digit-recognition/Canvas";

export default function Page() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);

  const gridSize = 28;
  const [grid, setGrid] = useState<boolean[]>(() => Array(gridSize * gridSize).fill(true));

  const handleCheck = async () => {
    // Convert the grid to a 2D array of 0-255 values
    const pixelValues = [];
    for (let row = 0; row < gridSize; row++) {
      const rowValues = grid
        .slice(row * gridSize, (row + 1) * gridSize)
        .map((cell) => (cell ? 0 : 255)); // Map true to 0 (black) and false to 255 (white)
      pixelValues.push(rowValues);
    }
    console.log(pixelValues);

    try {
      const result = await predictDigit(pixelValues);
      setPrediction(result.predicted_digit);
      setErrorMessage(null);
    } catch (error) {
      console.error("Error predicting digit:", error);
      setErrorMessage(error.message);
    }
  };

  const handleReset = () => {
    setGrid(Array(gridSize * gridSize).fill(true));
  };

  return (
    <>
      <h1>Handwritten Digit Recognition (WIP)</h1>
      <span>
        This app will recognize a written digit (0-9) using a neural network
        that I&apos;ll train using an MNIST dataset.
      </span>
      <span>
        I will try to reproduce the results from this paper: <a
          className="inline"
          href="https://arxiv.org/pdf/2008.10400"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://arxiv.org/pdf/2008.10400
        </a>
      </span>
      <span>
        Draw a sigle numeric digit in the black box below, then press &quot;Check&quot;:
      </span>

      <Canvas grid={grid} setGrid={setGrid} gridSize={gridSize} />
      <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleCheck}>Check</button>
      </div>
      {prediction !== null && (
        <div>
          <h2>Predicted Digit: {prediction}</h2>
        </div>
      )}
      {errorMessage && (
        <div>
          <h2 className="error-message">Error: {errorMessage}</h2>
        </div>
      )}
    </>
  );
}
