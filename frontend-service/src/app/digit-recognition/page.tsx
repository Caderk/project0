"use client";

import React, { useState, useEffect, useRef } from "react";

export default function Page() {
  const gridSize = 32; // Number of rows and columns
  const cellSize = 16; // Size of each cell in pixels

  // Initialize a grid state with all cells set to true (black)
  const [grid, setGrid] = useState(() => Array(gridSize * gridSize).fill(true));

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
        Touch might or might not work properly. You can click and drag to toggle
        cells.
      </span>
      <svg
        width={gridSize * cellSize}
        height={gridSize * cellSize}
        style={{
          margin: "0.5rem",
          userSelect: "none",
          touchAction: "none", // Prevent touch scrolling
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {rects}
      </svg>
      <button onClick={handleReset}>Reset</button>
    </>
  );
}
