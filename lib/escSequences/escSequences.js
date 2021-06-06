'use strict';

const CSI = '\x1b['; // Control Sequence Introducer

const _wrap = (esc) => (...args) => CSI + args.join(';') + esc;

// movement
const _CUU = (pos) => _wrap('A')(pos); // Cursor Up
const _CUD = (pos) => _wrap('B')(pos); // Cursor Down
const _CUF = (pos) => _wrap('C')(pos); // Cursor Forward
const _CUB = (pos) => _wrap('D')(pos); // Cursor Back
const _CHA = (column) => _wrap('G')(column); // Cursor Horizontal Absolute

const moveRelX = (dx) => {
  let result = '';
  if (typeof dx !== 'number' || isNaN(dx)) return result;
  if (dx > 0) result += _CUF(dx);
  if (dx < 0) result += _CUB(Math.abs(dx));
  return result;
};

const moveRelY = (dy) => {
  let result = '';
  if (typeof dy !== 'number' || isNaN(dy)) return result;
  if (dy > 0) result += _CUU(dy);
  if (dy < 0) result += _CUD(Math.abs(dy));
  return result;
};

const moveRel = (dx, dy) => moveRelX(dx) + moveRelY(dy);

const moveAbsX = (x) => {
  let result = '';
  if (typeof x !== 'number' || isNaN(x)) return result;
  if (x >= 0) result += _CHA(x + 1);
  return result;
};

const moveAbsY = (y) => {
  let result = '';
  if (typeof y !== 'number' || isNaN(y)) return result;
  if (y >= 0) {
    result += _CUU(Number.MAX_SAFE_INTEGER);
    if (y > 0) result += _CUD(y);
  }
  return result;
};

const moveAbs = (x, y) => moveAbsX(x) + moveAbsY(y);

// deleting
const _EL = (dir) => _wrap('K')(dir); // Erase in Line    0: a|_  1: _|a  2: _|_
const deleteStartToCur = () => _EL(1);
const deleteCurToEnd = () => _EL(0);
const deleteAllLine = () => _EL(2);

// visibility
// TODO isInvisible
const setInvisibleMode = () => _wrap('?25l')();
const setVisibleMode = () => _wrap('?25h')();

// decoration
const COLORS = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
];

const ADORNMENT = {
  bold: 1,
  underlined: 4,
  invert: 7,
};

const _SGR = (param) => _wrap('m')(param);

const normal = _SGR('0');
const bold = (string) => _SGR('1') + string + normal;
const underlined = (string) => _SGR('4') + string + normal;
const invert = (string) => _SGR('7') + string + normal;

const _setColor = (color, { isBright = false, isBackground = false } = {}) => (
  string
) => {
  if (typeof color === 'number') color = COLORS.find((_, i) => i === color);
  if (!COLORS.some((c) => c === color)) return '';
  const colorIndex =
    COLORS.indexOf(color) + (isBackground ? 10 : 0) + (isBright ? 90 : 30);
  return _SGR(colorIndex) + string + normal;
};

const setForegroundColor = (color, isBright) => _setColor(color, { isBright });

const setBackgroundColor = (color, isBright) =>
  _setColor(color, { isBright, isBackground: true });

const setTheme = ({
  options = [],
  foregroundColor,
  isForeColorBright = false,
  backgroundColor,
  isBackColorBright = false,
} = {}) => (string) => {
  let resString = '';
  for (const option of options)
    if (Object.keys(ADORNMENT).some((key) => key === option))
      resString += _SGR(ADORNMENT[option]);

  resString += string + normal;

  resString =
    setForegroundColor(foregroundColor, isForeColorBright)(resString) ||
    resString;

  resString =
    setBackgroundColor(backgroundColor, isBackColorBright)(resString) ||
    resString;

  return resString;
};

module.exports = {
  movement: { moveRelX, moveRelY, moveRel, moveAbsX, moveAbsY, moveAbs },
  visibility: {
    setInvisibleMode,
    setVisibleMode,
  },
  deleting: { deleteStartToCur, deleteCurToEnd, deleteAllLine },
  decoration: {
    normal,
    bold,
    underlined,
    invert,
    setForegroundColor,
    setBackgroundColor,
    setTheme,
  },
};
