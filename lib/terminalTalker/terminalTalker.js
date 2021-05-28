'use strict';

const { CUU, CUD, CUB, CUF, CHA, invisible, visible, EL } = require('../esc');

class TerminalTalker {
  constructor({ input }) {
    this.stdin = input;
  }

  setRawMode = (boolFlag) => this.stdin.setRawMode(boolFlag);
  static setInvisibleMode = () => invisible();
  static setVisibleMode = () => visible();

  moveRelX = (dx) => {
    if (typeof dx !== 'number') return 'NaN';
    let result = '';
    if (dx !== 0) {
      if (dx > 0) result += CUF(dx);
      else result += CUB(Math.abs(dx));
    }
    return result;
  };
  moveRelY = (dy) => {
    if (typeof dy !== 'number') return 'NaN';
    let result = '';
    if (dy !== 0) {
      if (dy > 0) result += CUU(dy);
      else result += CUD(Math.abs(dy));
    }
    return result;
  };
  moveRel = (dx, dy) => this.moveRelX(dx) + this.moveRelY(dy);

  moveAbsX = (x) => {
    if (typeof x !== 'number') return 'NaN';
    let result = '';
    if (x >= 0) result += CHA(x + 1);
    return result;
  };
  moveAbsY = (y) => {
    if (typeof y !== 'number') return 'NaN';
    let result = '';
    if (y >= 0) {
      result += CUU(Number.MAX_SAFE_INTEGER);
      if (y > 0) result += CUD(y);
    }
    return result;
  };
  moveAbs = (x, y) => this.moveAbsX(x) + this.moveAbsY(y);

  deleteStartToCur = () => EL(1);
  deleteCurToEnd = () => EL(0);
  deleteAllLine = () => EL(2);

  listenSingleChar = () => {
    const { stdin, setRawMode } = this;
    const isRaw = stdin.isRaw;
    !isRaw && setRawMode(true);
    stdin.resume();
    return new Promise((resolve) =>
      stdin.once('data', (buffer) => {
        const respStr = buffer.toString();
        stdin.pause();
        !isRaw && setRawMode(false);
        return resolve(respStr);
      })
    );
  };
}

module.exports = TerminalTalker;
