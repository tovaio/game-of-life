import React, { useState, useCallback, useRef } from 'react';
import produce from 'immer';

const nRows = 25;
const nCols = 50;
const cellSize = 15;
const tickTime = 16;

const offsets = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 0],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const mod = (n: number, m: number): number => {
  return ((n % m) + m) % m;
};

const generateGrid = () => {
  const rows = [];

  for (let i = 0; i < nRows; i++) {
    rows.push(Array(nCols).fill(false));
  }  
  
  return rows;
}

const App: React.FC = () => {
  const [ grid, setGrid ] = useState(generateGrid);

  const [ running, setRunning ] = useState(false);

  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;
    // simulate
    setGrid(oldGrid => {
      const newGrid = generateGrid();
      for (let i = 0; i < nRows; i++) {
        for (let j = 0; j < nCols; j++) {
          // count neighbors
          let nNeighbors = 0;
          offsets.forEach(([oi, oj]) => {
            if (oi === 0 && oj === 0) return;
            const ni = mod(i + oi, nRows);
            const nj = mod(j + oj, nCols);
            nNeighbors += (oldGrid[ni][nj]) ? 1 : 0;
          }); 
          if ((oldGrid[i][j] && (nNeighbors === 2 || nNeighbors === 3))
            || (!oldGrid[i][j] && (nNeighbors === 3))) {
            newGrid[i][j] = true;
          }
        }
      }
      return newGrid;
    });
    setTimeout(runSimulation, tickTime);
  }, []);

  return (
    <>
      <button
        onClick={() => {
          setRunning(oldRunning => {
            if (!oldRunning) {
              runningRef.current = true;
              runSimulation();
            }
            return !oldRunning;
          });
        }}
      >
        {running ? 'Stop!' : 'Start!'}
      </button>
      <button
        onClick={() => {
          setGrid(generateGrid());
        }}
      >
        Clear!
      </button>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${nCols}, ${cellSize}px)`
        }}
      >
        {grid.map((row, i) => 
          row.map((val, j) => (
            <div 
              key={`${i}-${j}`}
              onClick={() => {
                const newGrid = produce(grid, gridCopy => {
                  gridCopy[i][j] = !val;
                });
                setGrid(newGrid);
              }}
              style={{
                width: cellSize,
                height: cellSize, 
                backgroundColor: val ? 'black' : undefined,
                border: 'solid 1px grey'
              }}
            />
          ))
        )}
      </div>
    </>
  );
}

export default App;
