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

  prepositionStart = '▶   ';
  prepositionEnd = ' ';
  passSymbol = '*';

  print = (string) => {
    if (typeof string !== 'string')
      throw 'You try to print noString value: ' + string;
    this.stdout.write(string);
  };

  charListener = (actionsArray) => (resp) =>
    actionsArray.forEach((rule) => {
      if (
        rule.keys.some(
          (ruleKey) => ruleKey === resp.char || ruleKey.startsWith('ALWAYS')
        )
      )
        rule.onKeyPress(resp);
    });

  question = async (
    questionStr = '',
    {
      hideCursor = false,
      passMode = false,
      maxLength = 50,
      minLength = 0,
      validate,
      validateErrMessage = "Error: your text isn't valid",
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

    const { setRawMode, listenSingleChar } = tt;
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
          changeCurrentStr: (newStr) => (currentStr = newStr),
          incrementCurrentPosition: (incrementValue) =>
            (position += incrementValue),
          validationFunc:
            validate &&
            ((str) => {
              if (typeof validate === 'function') return validate(str);
              if (typeof validate === 'object' && validate.test) {
                const res = str.match(validate);
                return res ? res[0] === str : false;
              }
            }),
        },
        {
          passMode,
          passSymbol,
          maxLength,
          possibleChars,
          preposition,
          minLength,
          validateErrMessage,
        },
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
