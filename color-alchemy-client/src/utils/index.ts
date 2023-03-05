
import { RGBType, Tuple } from "../App";
type TranformToRGBType = (color: RGBType) => string;
type DiffType = (originColor: RGBType, targetColor: RGBType) => number;
type updateSourceType = (colorBoard: RGBType[][], row: number, col: number, color: RGBType, width: number, height: number) => RGBType[][];
type GenerateDiffRGBType = (row: number, col: number, color: RGBType, width: number, height: number) => RGBType[];

interface DiffInfo {
  closetPos: Tuple<number, 2>;
  diff: number;
};

type GetDiffInfo = (colorBoard: RGBType[][], targetColor: RGBType) => DiffInfo;

export const tranformToRGB: TranformToRGBType = color => `rgb(${color.join(',')})`;
// get closest color position and diff value 
export const getDiffInfo: GetDiffInfo = (colorBoard, target) => {
  let diffValue = Number.MAX_SAFE_INTEGER;
  let closetPos;
  const m = colorBoard.length, n = colorBoard[0].length;
  for (let r = 0; r < m; ++r) {
    for (let c = 0; c < n; ++c) {
      if (r !== 0 && r !== m - 1 && c !== 0 && c !== n - 1) {
        const diffRes = diff(colorBoard[r][c], target);
        if (diffRes < diffValue) {
          diffValue = diffRes;
          closetPos = [r, c];
        }
      }
    }
  }
  return { diff: diffValue, closetPos } as DiffInfo;
};
// get diff value between two RGB
export const diff: DiffType = (rgb0, rgb1) => {
  const [r0, g0, b0] = rgb0;
  const [r1, g1, b1] = rgb1;
  const value = Math.sqrt(Math.pow(r0 - r1, 2) + Math.pow(g0 - g1, 2) + Math.pow(b0 - b1, 2));
  return +(value / Math.sqrt(3) / 255 * 100).toFixed(2);
};

// generate transitional color change values
const generateDiffRGB: GenerateDiffRGBType = (row, col, color, width, height) => {
  let len = 0;
  if (row === 0 || row === height + 1) {
    len = height;
  }
  if (col === 0 || col === width + 1) {
    len = width;
  }

  // (w + 1 - d) / (w + 1) Or (h + 1 - d) / (h + 1)
  return [...new Array(len)].map((_: any, idx: number) => [...color].map(c => (c * ((len - idx) / (len + 1))))) as RGBType[];
};

export const updateSource: updateSourceType = (colorBoard, row, col, color, width, height) => {
  const m = colorBoard.length, n = colorBoard[0].length;
  let diffRGB = generateDiffRGB(row, col, color, width, height);
  // if position dropped locates at last column or row, reverse the diff RGB value
  if (row === m - 1 || col === n - 1) {
    diffRGB = diffRGB.reverse();
  }

  // update tile color
  for (let r = 0; r < m; ++r) {
    for (let c = 0; c < n; ++c) {
      // update source color
      if (r === row && c === col) {
        const curColor = colorBoard[r][c];
        colorBoard[r][c] = [curColor[0] + color[0], curColor[1] + color[1], curColor[2] + color[2]].map(c => Math.round(c)) as RGBType;
      }
      if (r !== 0 && r !== m - 1 && c !== 0 && c !== n - 1) {
        if (r === row || c === col) {
          const diffColor = diffRGB.shift() as RGBType;
          const curColor = colorBoard[r][c];
          const R = curColor[0] + diffColor[0];
          const G = curColor[1] + diffColor[1];
          const B = curColor[2] + diffColor[2];
          const f = 255 / Math.max(R, G, B, 255);
          colorBoard[r][c] = [R * f, G * f, B * f].map(c => Math.round(c)) as RGBType;
        }
      }
    }
  }
  // create new colorBoard array
  return [...colorBoard].map(i => [...i].map(rgb => [...rgb])) as RGBType[][];
};