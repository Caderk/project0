"use client";

import React, { useState, useEffect, useRef } from "react";

import { predictDigit } from "@utils/api/digit-recognition";

export default function Page() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const gridSize = 28; // Number of rows and columns
  const cellSize = 14; // Size of each cell in pixels

  // Initialize a grid state with all cells set to true (black)
  const [grid, setGrid] = useState(() => Array(gridSize * gridSize).fill(true));

  // Add a state variable to store the prediction
  const [prediction, setPrediction] = useState<number | null>(null);

  const [isPointerDown, setIsPointerDown] = useState(false);
  const toggledCellsRef = useRef(new Set());

  // Add event listener to handle pointer up outside the component
  useEffect(() => {
    const handlePointerUp = () => {
      setIsPointerDown(false);
      toggledCellsRef.current.clear(); // Clear the set when pointer is released
    };

    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  // Handle pointer down event on the SVG
  const handlePointerDown = (event) => {
    event.preventDefault(); // Prevent default behavior (e.g., scrolling)
    setIsPointerDown(true);
    toggledCellsRef.current.clear(); // Start a new set for this drag
    toggleCell(event);
  };

  // Handle pointer move event on the SVG
  const handlePointerMove = (event) => {
    if (isPointerDown) {
      toggleCell(event);
    }
  };

  // Toggle the color of a cell only if it hasn't been toggled during this drag
  const toggleCell = (event) => {
    // Get bounding rectangle of the SVG element
    const svgRect = event.currentTarget.getBoundingClientRect();
    // Calculate the x and y position relative to the SVG
    const x = event.clientX - svgRect.left;
    const y = event.clientY - svgRect.top;

    // Calculate the row and column based on x and y
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    // Ensure col and row are within bounds
    if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
      const index = row * gridSize + col;

      if (!toggledCellsRef.current.has(index)) {
        setGrid((prevGrid) => {
          const newGrid = [...prevGrid];
          newGrid[index] = false; // Set cell to white
          return newGrid;
        });
        toggledCellsRef.current.add(index);
      }
    }
  };

  const handleReset = () => {
    setGrid(Array(gridSize * gridSize).fill(true));
  };

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
      setPrediction(result.predicted_digit); // Use 'predicted_digit' from the response
      setErrorMessage(null);
    } catch (error) {
      console.error('Error predicting digit:', error);
      setErrorMessage(error.message);
    }
  };


  // Generate the grid of rectangles
  const rects = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;
      rects.push(
        <rect
          key={index}
          x={col * cellSize}
          y={row * cellSize}
          width={cellSize}
          height={cellSize}
          fill={grid[index] ? "black" : "white"}
          style={{ pointerEvents: "none" }} // Allow pointer events to pass through
        />
      );
    }
  }

  return (
    <>
      <h1>Work in Progress!</h1>
      <span>
        This app will recognize a written digit (0-9) using a neural network
        that I&apos;ll train using an MNIST dataset.
      </span>

      <span>
        I will try to reproduce the results on this paper:
        <a
          className="inline"
          href="https://arxiv.org/pdf/2008.10400"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://arxiv.org/pdf/2008.10400
        </a>
      </span>
      <span>
        Draw a sigle numeric digit in the black box below, then press "Check":
      </span>
      <svg
        width={gridSize * cellSize}
        height={gridSize * cellSize}
        style={{
          margin: "0.5rem",
          marginLeft: "auto",
          marginRight: "auto",
          userSelect: "none",
          touchAction: "none", // Prevent touch scrolling
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {rects}
      </svg>
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
          <h2>Error: {errorMessage}</h2>
        </div>
      )}
    </>
  );
}
