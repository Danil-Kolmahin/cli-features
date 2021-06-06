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
const { bold, setTheme } = require('../escSequences/escSequences').decoration;
const { ALPHABET, UPPER_ALPHABET } = require('../keysNames').multitudes;

class Questioner {
  constructor({ input, output }) {
    this.stdout = output;
    this.tt = new TerminalTalker({ input });
    [this.numColumns, this.numRows] = output.getWindowSize();
  }

  prepositionStart = '▶   ';
  prepositionEnd = ' ';
  passSymbol = '*';
  elseElementsSym = '...';
  selectedElementSym = '⚫  ';
  unselectedElementSym = '⚪  ';

  theme = {
    errorMessage: setTheme({ foregroundColor: 'red' }),
    errorType: setTheme({
      foregroundColor: 'black',
      backgroundColor: 'red',
      isBackColorBright: true,
    }),
  };

  posAndNegAnswers = [['yes'], ['no']]; // will be changed in 2.0

  checkYesOrNo = (str, defaultAnswer) => {
    // will be changed in 2.0
    const { posAndNegAnswers } = this;
    const input = str.toLowerCase();
    const check = (arr) =>
      arr.some((word) => word.startsWith(input) || input.startsWith(word));
    const isPositive = check(posAndNegAnswers[0]);
    const isNegative = check(posAndNegAnswers[1]);
    return [isPositive || isNegative, defaultAnswer ? isPositive : !isNegative];
  };

  print = (...args) => {
    if (args.some((str) => typeof str !== 'string'))
      throw 'You try to print noString value: ' + JSON.stringify(args);
    this.stdout.write(args.join(''));
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
      maxLength = this.numColumns,
      minLength = 0,
      validate,
      validateErrMessage = "your text isn't valid",
      possibleChars = [...ALPHABET, ...UPPER_ALPHABET],
    } = {}
  ) => {
    const {
      tt,
      prepositionStart,
      prepositionEnd,
      print,
      charListener,
      passSymbol,
      theme,
    } = this;

    const { setRawMode, listenSingleChar } = tt;

    const preposition = prepositionStart + questionStr + prepositionEnd;
    print(preposition, hideCursor ? setInvisibleMode() : '');
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
          theme,
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

    while (continueWaiting) {
      try {
        listen({
          char: await listenSingleChar(),
          currentStr,
          position,
        });
      } catch (e) {
        return e;
      }
    }

    setRawMode(false);
    print('\n', hideCursor ? setVisibleMode() : ''); // TODO isInvisible
    return currentStr;
  };

  generalQuestion = async (...args) => this._question(...args);

  passQuestion = async (...args) => {
    // will be changed in 2.0
    if (args.length < 1) args.push('');
    if (args.length < 2) args.push({});
    args[1].passMode = true;
    return this._question(...args);
  };

  yesNoQuestion = async (...args) => {
    // will be changed in 2.0
    const { checkYesOrNo } = this;
    if (args.length < 1) args.push('');
    if (args.length < 2) args.push({});
    if (args[1].defaultAnswer === undefined) args[1].defaultAnswer = true;
    const { defaultAnswer, validateErrMessage } = args[1];
    args[1].validate = (str) => checkYesOrNo(str, defaultAnswer)[0];
    if (!validateErrMessage) args[1].validateErrMessage = "it isn't yes or no";
    args[0] += ` (${defaultAnswer ? 'Y' : 'y'}/${defaultAnswer ? 'n' : 'N'})`;
    const answer = await this._question(...args);
    return checkYesOrNo(answer, defaultAnswer)[1];
  };

  alternativeQuestion = async (
    questionStr = '',
    answers = [],
    { maxLength = this.numRows, startWith = 0, isRounded = false } = {}
  ) => {
    const {
      tt,
      prepositionStart,
      prepositionEnd,
      print,
      charListener,
      elseElementsSym,
      selectedElementSym,
      unselectedElementSym,
    } = this;
    const { setRawMode, listenSingleChar } = tt;

    const withPin = !Array.isArray(answers);
    const answersArr = withPin ? Object.keys(answers) : answers;
    const len = answersArr.length;

    if (isRounded && maxLength >= len) maxLength = len;
    if (maxLength < 3) maxLength = 1;

    const redraw = (selectedPosition, answers) => {
      let toPrintArr = answersArr.map((answer, i) => {
        if (withPin)
          return (
            (answers[answer] ? selectedElementSym : unselectedElementSym) +
            (selectedPosition === i ? bold(answer) : answer)
          );
        if (!withPin)
          return selectedPosition === i
            ? prepositionStart + bold(answer)
            : answer;
      });

      const maxNumFitsAtBegin = Math.ceil(maxLength / 2) - 1;
      const minNumFitsAtEnd = len - Math.ceil(maxLength / 2);

      if (maxLength === 1) toPrintArr = [toPrintArr[selectedPosition]];
      else if (len > maxLength || isRounded) {
        if (selectedPosition <= maxNumFitsAtBegin && !isRounded)
          toPrintArr = [...toPrintArr.slice(0, maxLength - 1), elseElementsSym];
        else if (selectedPosition >= minNumFitsAtEnd && !isRounded)
          toPrintArr = [
            elseElementsSym,
            ...toPrintArr.slice(len + 1 - maxLength, len),
          ];
        else if (!isRounded || maxLength < len) {
          let from = selectedPosition + 1 - Math.floor(maxLength / 2);
          let to = selectedPosition + maxLength - Math.floor(maxLength / 2) - 1;
          toPrintArr = [...toPrintArr, ...toPrintArr, ...toPrintArr];
          if (from <= maxNumFitsAtBegin && isRounded) {
            from += len;
            to += len;
          }
          toPrintArr = [
            elseElementsSym,
            ...toPrintArr.slice(from, to),
            elseElementsSym,
          ];
        }
      }

      return '   ' + toPrintArr.join('\n   ') + '\n';
    };

    const preposition = prepositionStart + questionStr + prepositionEnd;
    print(preposition, setInvisibleMode(), '\n', redraw(startWith, answers));
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

    while (continueWaiting) {
      try {
        listen({
          char: await listenSingleChar(),
          position,
          answers,
        });
      } catch (e) {
        return e;
      }
    }

    setRawMode(false);
    print(setVisibleMode(), moveAbsX(0));
    return withPin
      ? Object.keys(answers).filter((el) => !!answers[el])
      : answers[position];
  };
}

module.exports = Questioner;
