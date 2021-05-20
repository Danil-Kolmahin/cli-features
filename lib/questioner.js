'use strict';

const TerminalListener = require('./terminalListener');
const {
  onEnterPress,
  onSomeLetter,
  ctrlC,
  left,
  right,
  backspace,
  up,
  down,
} = require('../lib/commonKeysActions');
const ESC = require('../lib/esc');

class Questioner {
  constructor({ input, output }) {
    this.stdout = output;
    this.tl = new TerminalListener({ input });
  }

  preposition = '▶';
  distance = '\t';
  lastDistance = ' ';
  passSymbol = '⚡';

  history = [];

  generalQuestion = async (
    questionStr = '',
    keysController = [],
    { isPass = false } = {}
  ) => {
    const {
      stdout,
      preposition,
      distance,
      lastDistance,
      tl,
      history,
      passSymbol,
    } = this;
    tl.setRawMode(true);
    const allPreposition = preposition + distance + questionStr + lastDistance;
    stdout.write(allPreposition);

    let currentStr = '';
    let continueWaiting = true;
    let position = 0;
    history.push('');
    let historyPos = history.length - 1;

    const keysRules = tl.configureKeysController(
      [
        ...keysController,
        onEnterPress,
        onSomeLetter,
        ctrlC,
        left,
        right,
        backspace,
        up,
        down,
      ],
      {
        confirm: () => {
          history[history.length - 1] = history[historyPos];
          continueWaiting = false;
        },
        rewriteInputStr: (newStr) => {
          if (historyPos === history.length - 1) history[historyPos] = newStr;
          stdout.write(ESC.moveRel(-currentStr.length - position));
          currentStr = newStr;
          stdout.write(ESC.EL(0));
          isPass
            ? stdout.write(passSymbol.repeat(newStr.length))
            : stdout.write(newStr);
          stdout.write(ESC.moveRel(position));
        },
        move: (newPos) => {
          if (
            position + newPos <= 0 &&
            position + newPos >= -currentStr.length + 1
          ) {
            position += newPos;
            stdout.write(ESC.moveRel(newPos));
          }
        },
        moveHistory: (newPos) => {
          newPos = -newPos;
          if (
            historyPos + newPos >= 0 &&
            historyPos + newPos <= history.length - 1
          ) {
            stdout.write(ESC.moveRel(-currentStr.length));
            historyPos += newPos;
            currentStr = history[historyPos];
            stdout.write(ESC.EL(0));
            stdout.write(currentStr);
          }
        },
      }
    );

    while (continueWaiting) {
      const { foundControlCases, respStr } = await tl.listenSingleChar(
        keysRules
      );
      foundControlCases.forEach((controlCase) =>
        controlCase.onKeyPress({ respStr, position, currentStr })
      );
    }

    stdout.write('\n');
    tl.setRawMode(false);
    return currentStr;
  };
}

module.exports = Questioner;
