import React, { useEffect, useState, useCallback } from "react";
import './index.css';
import { updateSource, getDiffInfo, diff } from '../utils';
import {
  RGBType,
  Tuple,
  AlchemyProptypes,
  HandleClickType,
  HandleDropType
} from '../types';
import { RGBComponent } from "./RGBComponent";

const firstThreeMoves = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255]
] as Tuple<RGBType, 3>;

export const INIT_RGB: Tuple<number, 3> = [0, 0, 0];

const AlchemyComponent: React.FC<AlchemyProptypes> = ({ handleSetDiff, handleChangeMoves, basicInfo, setClosetColor }) => {

  const { width, height, target } = basicInfo;

  const [closetPos, setCloestPos] = useState<Tuple<number, 2>>([1, 1]);
  // three dimentional matrix to present RGB colors
  const [colorBoard, setColorBoard] = useState<RGBType[][]>([[([...INIT_RGB]) as Tuple<number, 3>]]);

  const [moves, setMoves] = useState<number>(0);

  // update info: closest color position, diff value and change cloest color for parent com
  const handleDiffInfo = useCallback(() => {
    const { closetPos, diff } = getDiffInfo(colorBoard, target);
    setCloestPos(closetPos);
    handleSetDiff(diff);
    const [row, col] = closetPos;
    setClosetColor(colorBoard[row][col]);
  }, [colorBoard, handleSetDiff, target, setClosetColor]);

  // initialize color board according to height width
  useEffect(() => {
    const colorBoard = [...new Array(height + 2)].map(() => new Array(width + 2).fill([...INIT_RGB]));
    setColorBoard(colorBoard);
  }, [height, width]);

  // initialize diff result
  useEffect(() => {
    handleSetDiff(diff(target, INIT_RGB));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clickOrDropCallback = useCallback(() => {
    // change moves in the current component
    setMoves(prev => prev + 1);
    // update left moves of parent component
    handleChangeMoves();
    // get new cloest tile position and do diff calculating
    handleDiffInfo();
  }, [handleChangeMoves, handleDiffInfo]);

  const handleClick: HandleClickType = (row, col) => {
    // only allow to click black source
    if (colorBoard[row][col].some(i => i > 0)) {
      return;
    }
    // update source RGB by [255, 0, 0], [0, 255, 0], [0, 0, 255] for the first 3 steps
    setColorBoard(
      updateSource(colorBoard, row, col, firstThreeMoves[moves], width, height)
    );
    // callback
    clickOrDropCallback();
  };

  const handleDrop: HandleDropType = (row, col, color) => {
    // If the source dropped is not a black one, first clear up painted color by negative RGB value;
    // e.g The source droped RGB is [128, 128, 128], then update the whole row/col tiles by value [-128, -128, -128]
    // Then paint dropped new RGB
    if (colorBoard[row][col].some((i: number) => i > 0)) {
      const negativeDGB = [...colorBoard[row][col]].map(i => -i) as Tuple<number, 3>;
      const updatedColorBoard = updateSource(colorBoard, row, col, negativeDGB, width, height);
      setColorBoard(
        updateSource(updatedColorBoard, row, col, color, width, height)
      );
    } else {
      // If the source dropped is a black one, update tiles color directly
      setColorBoard(
        updateSource(colorBoard, row, col, color, width, height)
      );
    }
    // callback
    clickOrDropCallback();
  };

  return (
    <div className='alchemyWrapper'>
      {
        colorBoard.map((row: RGBType[], rowidx: number) =>
          <div key={rowidx} className='row'>
            {
              row.map((col: RGBType, colidx: number) => (
                <span className='col' key={colidx}>
                  {
                    rowidx === 0 || rowidx === colorBoard.length - 1 ?
                      <RGBComponent
                        color={col}
                        type='source'
                        hidden={colidx === 0 || colidx === row.length - 1}
                        handleClick={handleClick}
                        handleDrop={handleDrop}
                        row={rowidx}
                        col={colidx}
                        canClick={moves <= 2}
                      />
                      : colidx === 0 || colidx === row.length - 1 ?
                        <RGBComponent
                          color={col}
                          type='source'
                          handleClick={handleClick}
                          handleDrop={handleDrop}
                          row={rowidx}
                          col={colidx}

                          canClick={moves <= 2}
                        />
                        : <RGBComponent
                          color={col}
                          type='tile'
                          canDrag={moves > 2}
                          row={rowidx}
                          col={colidx}
                          closetPos={closetPos}
                        />
                  }
                </span>
              ))
            }
          </div>
        )
      }
    </div>
  );
};

export default AlchemyComponent;
export {
  RGBComponent
};
