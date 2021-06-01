'use strict';

const REGULAR_COLORS = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
];

const ESC = {
  CSI: '\x1b[', // Control Sequence Introducer

  _func: (esc) => (...args) => ESC.CSI + args.join(';') + esc,

  movement: {
    _CUU: (pos) => ESC._func('A')(pos), // Cursor Up
    _CUD: (pos) => ESC._func('B')(pos), // Cursor Down
    _CUF: (pos) => ESC._func('C')(pos), // Cursor Forward
    _CUB: (pos) => ESC._func('D')(pos), // Cursor Back

    _CHA: (column) => ESC._func('G')(column), // Cursor Horizontal Absolute

    moveRelX: (dx) => {
      let result = '';
      if (typeof dx !== 'number' || isNaN(dx)) return result;
      const { _CUF, _CUB } = ESC.movement;
      if (dx !== 0) {
        if (dx > 0) result += _CUF(dx);
        else result += _CUB(Math.abs(dx));
      }
      return result;
    },
    moveRelY: (dy) => {
      let result = '';
      if (typeof dy !== 'number' || isNaN(dy)) return result;
      const { _CUU, _CUD } = ESC.movement;
      if (dy !== 0) {
        if (dy > 0) result += _CUU(dy);
        else result += _CUD(Math.abs(dy));
      }
      return result;
    },
    moveRel: (dx, dy) => ESC.movement.moveRelX(dx) + ESC.movement.moveRelY(dy),

    moveAbsX: (x) => {
      let result = '';
      if (typeof x !== 'number' || isNaN(x)) return result;
      const { _CHA } = ESC.movement;
      if (x >= 0) result += _CHA(x + 1);
      return result;
    },
    moveAbsY: (y) => {
      let result = '';
      if (typeof y !== 'number' || isNaN(y)) return result;
      const { _CUU, _CUD } = ESC.movement;
      if (y >= 0) {
        result += _CUU(Number.MAX_SAFE_INTEGER);
        if (y > 0) result += _CUD(y);
      }
      return result;
    },
    moveAbs: (x, y) => ESC.movement.moveAbsX(x) + ESC.movement.moveAbsY(y),
  },

  _EL: (dir) => ESC._func('K')(dir), // Erase in Line    0: a|_  1: _|a  2: _|_
  deleteStartToCur: () => ESC._EL(1),
  deleteCurToEnd: () => ESC._EL(0),
  deleteAllLine: () => ESC._EL(2),

  setInvisibleMode: () => ESC._func('?25l')(),
  setVisibleMode: () => ESC._func('?25h')(),

  colors: {
    normal: () => ESC._func('m')(0),
    bold: (str) => ESC._func('m')(1) + str + ESC.colors.normal(),
    underlined: (str) => ESC._func('m')(4) + str + ESC.colors.normal(),
    invert: (str) => ESC._func('m')(7) + str + ESC.colors.normal(),

    colorize: (color, isFront = true, highIntensity = false) => {
      const selectColor = (color) => (str) =>
        ESC._func('m')(isFront ? 38 : 48, 5, color) + str + ESC.colors.normal();
      if (typeof color !== 'number' && typeof color !== 'string') return '';
      if (typeof color === 'string') {
        const index = REGULAR_COLORS.findIndex((c) => c === color);
        if (index === -1) return '';
        return selectColor(
          highIntensity ? index + REGULAR_COLORS.length : index
        );
      }
      if (color >= 0 && color < REGULAR_COLORS.length)
        return selectColor(
          highIntensity ? color + REGULAR_COLORS.length : color
        );
    },
  },
};

module.exports = ESC;
