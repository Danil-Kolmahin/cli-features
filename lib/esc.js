'use strict';

const ESC = {
  CSI: '\x1b[', // Control Sequence Introducer

  _blank: (esc) => ESC.CSI + esc,
  _single: (esc) => (arg) => ESC.CSI + arg + esc, // TODO ESC or this?
  _double: (esc) => (arg1, arg2) => ESC.CSI + arg1 + ';' + arg2 + esc,

  CUU: (pos) => ESC._single('A')(pos), // Cursor Up
  CUD: (pos) => ESC._single('B')(pos), // Cursor Down
  CUF: (pos) => ESC._single('C')(pos), // Cursor Forward
  CUB: (pos) => ESC._single('D')(pos), // Cursor Back
  moveRel: (dx, dy = 0) => {
    if (typeof dx !== 'number' || typeof dy !== 'number') return 'NaN';
    let result = '';
    if (dx !== 0) {
      if (dx > 0) result += ESC.CUF(dx);
      else result += ESC.CUB(Math.abs(dx));
    }
    if (dy !== 0) {
      if (dy > 0) result += ESC.CUU(dy);
      else result += ESC.CUD(Math.abs(dy));
    }
    return result;
  },

  CHA: (column) => ESC._single('G')(column), // Cursor Horizontal Absolute
  moveAbs: (x, y = -1) => {
    if (typeof x !== 'number' || typeof y !== 'number') return 'NaN';
    let result = '';
    if (x >= 0) result += ESC.CHA(x + 1);
    if (y >= 0) {
      result += ESC.CUU(Number.MAX_SAFE_INTEGER);
      if (y > 0) result += ESC.CUD(y);
    }
    return result;
  },

  EL: (dir) => ESC._single('K')(dir), // Erase in Line    0: a|_  1: _|a  2: _|_

  invisible: () => ESC._blank('?25l'),
  visible: () => ESC._blank('?25h'),
};

module.exports = ESC;
