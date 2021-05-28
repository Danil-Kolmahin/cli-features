'use strict';

const TerminalTalker = require('../terminalTalker/terminalTalker');
const makeActionsArray = require('../keysAndActions/keysAndActions');
const {
  forGeneralQuestions,
} = require('../keysAndActions/keysAndActions').commonListeners;

class Questioner {
  constructor({ input, output }) {
    this.stdout = output;
    this.tt = new TerminalTalker({ input });
  }

  prepositionStart = '▶\t';
  prepositionEnd = ' ';
  passSymbol = '*';

  print = (string) => {
    if (typeof string !== 'string')
      throw 'You try to print noString value: ' + string;
    this.stdout.write(string);
  };

  charListener = (actionsArray) => (resp) =>
    actionsArray.forEach((rule) => {
      if (rule.keys.some((ruleKey) => ruleKey === resp.char))
        rule.onKeyPress(resp);
    });

  question = async (
    questionStr = '',
    {
      hideCursor = false,
      passMode = false,
      maxLength = 50,
      possibleChars = [
        ...'abcdefghijklmnopqrstuvwxyz',
        ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      ],
    } = {}
  ) => {
    const {
      tt,
      prepositionStart,
      prepositionEnd,
      print,
      charListener,
      passSymbol,
    } = this;

    const { setRawMode, listenSingleChar, moveRelX, deleteCurToEnd } = tt;
    const { setInvisibleMode, setVisibleMode } = TerminalTalker;

    const preposition = prepositionStart + questionStr + prepositionEnd;
    print(preposition + (hideCursor ? setInvisibleMode() : ''));
    setRawMode(true);

    let currentStr = '';
    let continueWaiting = true;
    let position = 0;

    const listen = charListener(
      new makeActionsArray(
        {
          confirm: () => (continueWaiting = false),
          print,
          moveRelX,
          changeCurrentStr: (newStr) => (currentStr = newStr),
          deleteCurToEnd,
          incrementCurrentPosition: (incrementValue) =>
            (position += incrementValue),
        },
        { passMode, passSymbol, maxLength, possibleChars },
        [...forGeneralQuestions],
        [
          {
            name: 'onSomeLetter',
            keys: [...possibleChars],
          },
        ]
      )
    );

    while (continueWaiting)
      listen({
        char: await listenSingleChar(),
        currentStr,
        position,
      });

    setRawMode(false);
    print('\n' + (hideCursor ? setVisibleMode() : '')); // TODO isInvisible
    return currentStr;
  };
}

module.exports = Questioner;
