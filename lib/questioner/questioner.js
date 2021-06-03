'use strict';

const TerminalTalker = require('../terminalTalker/terminalTalker');
const makeActionsArray = require('../keysAndActions/keysAndActions');
const {
  forGeneralQuestions,
  forAlternativeQuestions,
} = require('../keysAndActions/keysAndActions').commonListeners;
const {
  setInvisibleMode,
  setVisibleMode,
} = require('../escSequences/escSequences').visibility;
const { moveAbsX } = require('../escSequences/escSequences').movement;
const { bold } = require('../escSequences/escSequences').decoration;

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

  _question = async (
    questionStr = '',
    {
      hideCursor = false,
      passMode = false,
      maxLength = 50,
      minLength = 0,
      validate,
      validateErrMessage = "your text isn't valid",
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

  generalQuestion = async (...args) => this._question(...args);

  passQuestion = async (...args) => {
    if (args.length < 1) args.push('');
    if (args.length < 2) args.push({});
    args[1].passMode = true;
    return this._question(...args);
  };

  yesNoQuestion = async (...args) => {
    if (args.length < 1) args.push('');
    if (args.length < 2) args.push({});
    if (args[1].defaultAnswer === undefined) args[1].defaultAnswer = true;
    const defAnswers = [['yes'], ['no']];
    const checkYesOrNo = (str) => {
      const input = str.toLowerCase();
      const check = (arr) =>
        arr.some((word) => word.startsWith(input) || input.startsWith(word));
      const isPositive = check(defAnswers[0]);
      const isNegative = check(defAnswers[1]);
      return [
        isPositive || isNegative,
        args[1].defaultAnswer ? isPositive : !isNegative,
      ];
    };
    args[1].validate = (str) => checkYesOrNo(str)[0];
    if (!args[1].validateErrMessage)
      args[1].validateErrMessage = "Error: it isn't yes or no";
    args[0] += ` (${args[1].defaultAnswer ? 'Y' : 'y'}/${
      args[1].defaultAnswer ? 'n' : 'N'
    })`;
    const answer = await this._question(...args);
    return checkYesOrNo(answer)[1];
  };

  alternativeQuestion = async (
    questionStr = '',
    answers = [],
    { maxLength = Infinity, startWith = 0, isRounded = false } = {}
  ) => {
    const { tt, prepositionStart, prepositionEnd, print, charListener } = this;
    const { setRawMode, listenSingleChar } = tt;

    const withPin = !Array.isArray(answers);
    const len = withPin ? Object.keys(answers).length : answers.length;
    let someFlag = false;
    if (isRounded && maxLength >= len) {
      someFlag = true;
      maxLength = len;
    }

    const redraw = (selectedPosition, answers) => {
      const points = '...';

      const createArr = (valuesArray, selected = selectedPosition) =>
        valuesArray.map((answer, i) => {
          if (withPin)
            return answers[answer]
              ? '⚫  ' + (selected === i ? bold(answer) : answer)
              : '⚪  ' + (selected === i ? bold(answer) : answer);
          if (!withPin)
            return selected === i ? prepositionStart + bold(answer) : answer;
        });
      const smth = withPin ? Object.keys(answers) : answers;
      let valuesArray = createArr(smth);

      if (maxLength < 3) {
        maxLength = 1;
        valuesArray = [valuesArray[selectedPosition]];
      } else if (len > maxLength || isRounded) {
        if (selectedPosition <= Math.ceil(maxLength / 2) - 1 && !isRounded)
          valuesArray = [...valuesArray.slice(0, maxLength - 1), points];
        else if (
          selectedPosition >= len - Math.ceil(maxLength / 2) &&
          !isRounded
        )
          valuesArray = [
            points,
            ...valuesArray.slice(len + 1 - maxLength, len),
          ];
        else if (!someFlag) {
          const from = selectedPosition + 1 - Math.floor(maxLength / 2);
          const to =
            selectedPosition + maxLength - Math.floor(maxLength / 2) - 1;
          if (from <= Math.ceil(maxLength / 2) - 1 && isRounded)
            valuesArray = [
              points,
              ...[...createArr(smth, null), ...valuesArray].slice(
                from + len,
                to + len
              ),
              points,
            ];
          else if (to >= len - Math.ceil(maxLength / 2) && isRounded)
            valuesArray = [
              points,
              ...[...valuesArray, ...createArr(smth, null)].slice(from, to),
              points,
            ];
          else valuesArray = [points, ...valuesArray.slice(from, to), points];
        }
      }
      return '   ' + valuesArray.join('\n   ') + '\n';
    };

    const preposition = prepositionStart + questionStr + prepositionEnd;
    print(preposition + setInvisibleMode() + '\n' + redraw(startWith, answers));
    setRawMode(true);

    let continueWaiting = true;
    let position = startWith;

    const listen = charListener(
      new makeActionsArray(
        {
          confirm: () => (continueWaiting = false),
          print,
          changeCurrentPosition: (value) => (position = value),
          redraw,
        },
        {
          withPin,
          maxLength: maxLength < len ? maxLength : len,
          len,
          isRounded,
        },
        [...forAlternativeQuestions, withPin && 'alternativeLeftAndRight']
      )
    );

    while (continueWaiting)
      listen({
        char: await listenSingleChar(),
        position,
        answers,
      });

    setRawMode(false);
    print(setVisibleMode() + moveAbsX(0));
    return withPin
      ? Object.keys(answers).filter((el) => !!answers[el])
      : answers[position];
  };
}

module.exports = Questioner;
