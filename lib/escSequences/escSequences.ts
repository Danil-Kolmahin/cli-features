'use strict';

const CSI = '\x1b['; // Control Sequence Introducer

type _wrapT = (esc: string) => (...args: Array<number>) => string;
const _wrap: _wrapT = (esc) => (...args) => CSI + args.join(';') + esc;

// movement
type shortMoveT = (pos: number) => string;
const _CUU: shortMoveT = (pos) => _wrap('A')(pos); // Cursor Up
const _CUD: shortMoveT = (pos) => _wrap('B')(pos); // Cursor Down
const _CUF: shortMoveT = (pos) => _wrap('C')(pos); // Cursor Forward
const _CUB: shortMoveT = (pos) => _wrap('D')(pos); // Cursor Back
const _CHA: shortMoveT = (column) => _wrap('G')(column); // Cursor Horizontal Absolute

const moveRelX = (dx: number) => {
  if (dx > 0) return _CUF(dx);
  if (dx < 0) return _CUB(Math.abs(dx));
  return '';
};

const moveRelY = (dy: number) => {
  if (dy > 0) return _CUU(dy);
  if (dy < 0) return _CUD(Math.abs(dy));
  return '';
};

const moveRel = (dx: number, dy: number) => moveRelX(dx) + moveRelY(dy);

const moveAbsX = (x: number) => {
  if (x >= 0) return _CHA(x + 1);
  return '';
};

const moveAbsY = (y: number) => {
  let result = '';
  if (y >= 0) {
    result += _CUU(Number.MAX_SAFE_INTEGER);
    if (y > 0) result += _CUD(y);
  }
  return result;
};

const moveAbs = (x: number, y: number) => moveAbsX(x) + moveAbsY(y);

// deleting
const _EL = (dir: number) => _wrap('K')(dir); // Erase in Line    0: a|_  1: _|a  2: _|_
const deleteStartToCur = () => _EL(1);
const deleteCurToEnd = () => _EL(0);
const deleteAllLine = () => _EL(2);

// visibility
// TODO isInvisible
const setInvisibleMode = () => _wrap('?25l')();
const setVisibleMode = () => _wrap('?25h')();

// decoration
const enum COLORS {
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
}

const enum ADORNMENT {
  bold = 1,
  underlined = 4,
  invert = 7,
}

const _SGR = (param: number) => _wrap('m')(param);

const normal = _SGR(0);
const bold = (string: string) => _SGR(1) + string + normal;
const underlined = (string: string) => _SGR(4) + string + normal;
const invert = (string: string) => _SGR(7) + string + normal;

type _setColorT = (
  color: COLORS,
  options: { isBright?: boolean; isBackground?: boolean }
) => (string: string) => string;
const _setColor: _setColorT = (
  color,
  { isBright = false, isBackground = false }
) => (string: string) => {
  const colorIndex = color + (isBackground ? 10 : 0) + (isBright ? 90 : 30);
  return _SGR(colorIndex) + string + normal;
};

const setForegroundColor = (color: COLORS, isBright?: boolean) =>
  _setColor(color, { isBright });

const setBackgroundColor = (color: COLORS, isBright?: boolean) =>
  _setColor(color, { isBright, isBackground: true });

type setThemeT = (options: {
  options?: Array<ADORNMENT>;
  foregroundColor?: COLORS;
  isForeColorBright?: boolean;
  backgroundColor?: COLORS;
  isBackColorBright?: boolean;
}) => (string: string) => string;
const setTheme: setThemeT = ({
  options = [],
  foregroundColor,
  isForeColorBright = false,
  backgroundColor,
  isBackColorBright = false,
}) => (string) => {
  let resString = '';
  for (const option of options) resString += _SGR(option);

  resString += string + normal;

  resString =
    foregroundColor !== undefined
      ? setForegroundColor(foregroundColor, isForeColorBright)(resString)
      : resString;

  resString =
    backgroundColor !== undefined
      ? setBackgroundColor(backgroundColor, isBackColorBright)(resString)
      : resString;

  return resString;
};

export const movement = {
  moveRelX,
  moveRelY,
  moveRel,
  moveAbsX,
  moveAbsY,
  moveAbs,
};
export const visibility = {
  setInvisibleMode,
  setVisibleMode,
};
export const deleting = { deleteStartToCur, deleteCurToEnd, deleteAllLine };
export const decoration = {
  normal,
  bold,
  underlined,
  invert,
  setForegroundColor,
  setBackgroundColor,
  setTheme,
};
