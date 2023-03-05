import { Dispatch, SetStateAction } from "react";
export type Tuple<T, length extends number> = [T, ...T[]] & { length: length };
export type RGBType = Tuple<number, 3>;

export interface BasicInfo {
  userId: string;
  width: number;
  height: number;
  maxMoves: number;
  target: RGBType;
}

export type HandleClickType = (row: number, col: number) => void;
export type HandleDropType = (row: number, col: number, color: RGBType) => void;

export type ElePropsType = {
  color: RGBType;
  type: string;
  hidden?: boolean;
  row?: number;
  col?: number;
  canClick?: boolean;
  canDrag?: boolean;
  closetPos?: Tuple<number, 2>;
  handleDrop?: HandleDropType;
  handleClick?: HandleClickType;
}

export interface AlchemyProptypes {
  basicInfo: BasicInfo;
  handleSetDiff: Function;
  handleChangeMoves: Function;
  setClosetColor: Dispatch<SetStateAction<RGBType | undefined>>;
}

export type TranformToRGBType = (color: RGBType) => string;
export type DiffType = (originColor: RGBType, targetColor: RGBType) => number;
export type updateSourceType = (colorBoard: RGBType[][], row: number, col: number, color: RGBType, width: number, height: number) => RGBType[][];
export type GenerateDiffRGBType = (row: number, col: number, color: RGBType, width: number, height: number) => RGBType[];

export interface DiffInfo {
  closetPos: Tuple<number, 2>;
  diff: number;
};

export type GetDiffInfo = (colorBoard: RGBType[][], targetColor: RGBType) => DiffInfo;


