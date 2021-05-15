'use strict';

const TerminalListener = require('./terminalListener');
const {
  onEnterPress,
  onSomeLetter,
  ctrlC,
} = require('../lib/commonKeysActions');

class Questioner {
  constructor({ input, output }) {
    this.stdout = output;
    this.tl = new TerminalListener({ input });
  }

  preposition = '▶';
  distance = '\t';
  lastDistance = ' ';

  generalQuestion = async (questionStr = '', keysController = []) => {
    const { stdout, preposition, distance, lastDistance, tl } = this;
    tl.setRawMode(true);
    stdout.write(preposition + distance + questionStr + lastDistance);

    let currentStr = '';
    let continueWaiting = true;

    const keysRules = tl.configureKeysController(
      [...keysController, onEnterPress, onSomeLetter, ctrlC],
      {
        confirm: () => (continueWaiting = false),
        modifyInputStr: (newStr) => {
          currentStr += newStr;
          stdout.write(newStr);
        },
        writeChar: (char) => stdout.write(char),
      }
    );

    while (continueWaiting) {
      const { foundControlCases, respStr } = await tl.listenSingleChar(
        keysRules
      );
      foundControlCases.forEach((controlCase) =>
        controlCase.onKeyPress({ respStr })
      );
    }

    stdout.write('\n');
    tl.setRawMode(false);
    return currentStr;
  };
}

module.exports = Questioner;
