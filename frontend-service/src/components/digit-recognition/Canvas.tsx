"use client";

import React, { useRef, useEffect } from "react";

export default function Canvas({ grid, setGrid, gridSize }) {
  const containerRef = useRef(null);
  const [cellSize, setCellSize] = React.useState(0);
  const [isPointerDown, setIsPointerDown] = React.useState(false);
  const toggledCellsRef = useRef(new Set());

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      setCellSize(containerWidth / gridSize);
    }
  }, [containerRef.current]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setCellSize(containerWidth / gridSize);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handlePointerDown = (event) => {
    event.preventDefault();
    setIsPointerDown(true);
    toggledCellsRef.current.clear();
    toggleCell(event);
  };

  const handlePointerMove = (event) => {
    if (isPointerDown) {
      toggleCell(event);
    }
  };

  const handlePointerUp = () => {
    setIsPointerDown(false);
    toggledCellsRef.current.clear();
  };

  useEffect(() => {
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const toggleCell = (event) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor((x / rect.width) * gridSize);
    const row = Math.floor((y / rect.height) * gridSize);

    if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
      const index = row * gridSize + col;

      if (!toggledCellsRef.current.has(index)) {
        setGrid((prevGrid) => {
          const newGrid = [...prevGrid];
          newGrid[index] = false;
          return newGrid;
        });
        toggledCellsRef.current.add(index);
      }
    }
  };

  const rects = grid.map((cell, index) => (
    <div
      key={index}
      style={{
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundColor: cell ? "black" : "white",
      }}
    />
  ));

  return (
    <div
      ref={containerRef}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        width: "100%",
        maxWidth: "500px",
        aspectRatio: "1 / 1",
        margin: "0 auto",
        userSelect: "none",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {rects}
    </div>
  );
}
