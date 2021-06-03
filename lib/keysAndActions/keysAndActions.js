'use strict';

const {
  moveRelX,
  moveRelY,
  moveAbsX,
} = require('../escSequences/escSequences').movement;
const {
  deleteCurToEnd,
  deleteAllLine,
} = require('../escSequences/escSequences').deleting;
const { setTheme } = require('../escSequences/escSequences').decoration;

class makeActionsArray {
  constructor(
    functions = {},
    constants = {},
    selectedListeners = [],
    customListeners = []
  ) {
    this.functions = functions;
    this.constants = constants;

    this.functions.writeSingleChar = ({ currentStr, char, position }) => {
      const { passMode, passSymbol, maxLength } = this.constants;
      if (currentStr.length === maxLength) return '';
      const { incrementCurrentPosition, changeCurrentStr } = this.functions;
      const realStr =
        currentStr.slice(0, position) + char + currentStr.slice(position);
      changeCurrentStr(realStr);
      const writtenStr = passMode ? passSymbol.repeat(realStr.length) : realStr;
      incrementCurrentPosition(+1);
      return (
        moveRelX(-position) +
        deleteCurToEnd() +
        writtenStr +
        moveRelX(-writtenStr.length + position + 1)
      );
    };
    this.functions.createErr = (errMessage, position) => {
      const { preposition } = this.constants;
      return (
        moveRelY(-1) +
        moveAbsX(0) +
        setTheme({
          foregroundColor: 'black',
          backgroundColor: 'red',
          isBackColorBright: true,
        })('Validation error:') +
        ' ' +
        setTheme({ foregroundColor: 'red' })(errMessage) +
        moveRelY(1) +
        moveAbsX(preposition.length + position)
      );
    };

    let resultListenersArray = [];
    const uniqueListeners = new Set();

    selectedListeners.forEach((listener) => {
      if (typeof listener !== 'string') return;
      const foundListener = this.listeners.find(
        (candidate) => candidate.name === listener
      );
      if (foundListener === undefined) return;
      if (uniqueListeners.has(foundListener.name)) return;
      uniqueListeners.add(foundListener.name);
      resultListenersArray.push(foundListener);
    });

    customListeners.forEach((listener) => {
      if (typeof listener !== 'object') return;
      if (!listener.name) return;

      if (uniqueListeners.has(listener.name)) {
        const index = resultListenersArray.findIndex(
          (candidate) => candidate.name === listener.name
        );
        if (listener.keys) resultListenersArray[index].keys = listener.keys;
        if (listener.onKeyPress) {
          listener.onKeyPress = listener.onKeyPress.bind(this);
          resultListenersArray[index].onKeyPress = listener.onKeyPress;
        }
      } else {
        if (!listener.keys) listener.keys = [];
        if (!listener.onKeyPress) listener.onKeyPress = () => {};
        uniqueListeners.add(listener.name);
        listener.onKeyPress = listener.onKeyPress.bind(this);
        resultListenersArray.push(listener);
      }
    });

    const getKeysLength = (obj) => {
      if (obj.keys[0] === 'ALWAYS_LAST') return Infinity;
      if (obj.keys[0] === 'ALWAYS_FIRST') return -Infinity;
      return obj.keys.reduce((acc, cur) => acc + cur.length, 0);
    };
    resultListenersArray = resultListenersArray.sort(
      (a, b) => getKeysLength(a) - getKeysLength(b)
    );

    return resultListenersArray;
  }

  static commonListeners = {
    forGeneralQuestions: [
      'onEnterPress',
      'onSomeLetter',
      'leftAndRight',
      'backspaceAndDelete',
      'clearErrors',
    ],
    forAlternativeQuestions: [
      'onAlternativeEnterPress',
      'alternativeUpAndDown',
    ],
  };

  listeners = [
    {
      name: 'clearErrors',
      keys: ['ALWAYS_FIRST'],
      onKeyPress: () => {
        const { print } = this.functions;
        print(moveRelY(-1) + deleteAllLine() + moveRelY(1));
      },
    },

    {
      name: 'onEnterPress',
      keys: ['\u000D'],
      onKeyPress: ({ currentStr, position }) => {
        const { confirm, createErr, print, validationFunc } = this.functions;
        const { minLength, validateErrMessage } = this.constants;
        let error = '';

        if (currentStr.length < minLength)
          error = `Error: currentStr.length (${currentStr.length}) < minLength (${minLength})`;
        if (validationFunc && !validationFunc(currentStr))
          error = validateErrMessage;

        if (error) print(createErr(error, position));
        else confirm();
      },
    },

    {
      name: 'onSomeLetter',
      keys: [...'abcdefghijklmnopqrstuvwxyz', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
      onKeyPress: ({ currentStr, char, position }) => {
        const { writeSingleChar, print } = this.functions;
        print(writeSingleChar({ currentStr, char, position }));
      },
    },

    {
      name: 'leftAndRight',
      keys: ['\u001B\u005B\u0044', '\u001B\u005B\u0043'],
      onKeyPress: ({ position, char, currentStr }) => {
        const { incrementCurrentPosition, print } = this.functions;
        const isBackspace = char === '\u001B\u005B\u0044';
        const newPosition = isBackspace ? -1 : +1;
        if (
          (position > 0 && isBackspace) ||
          (position < currentStr.length && !isBackspace)
        ) {
          incrementCurrentPosition(newPosition);
          print(moveRelX(newPosition));
        }
      },
    },

    {
      name: 'backspaceAndDelete',
      keys: ['\u0008', '\u001B\u005B\u0033\u007E'],
      onKeyPress: ({ currentStr, position, char }) => {
        const {
          incrementCurrentPosition,
          changeCurrentStr,
          print,
        } = this.functions;
        const { passMode, passSymbol } = this.constants;
        const isBackspace = char === '\u0008';
        const newPosition = isBackspace ? -1 : 0;
        if (
          (position > 0 && isBackspace) ||
          (position < currentStr.length && !isBackspace)
        ) {
          const realStr =
            currentStr.slice(0, position + newPosition) +
            currentStr.slice(position + newPosition + 1);
          const writtenStr = passMode
            ? passSymbol.repeat(realStr.length)
            : realStr;
          incrementCurrentPosition(newPosition);
          changeCurrentStr(realStr);
          print(
            moveRelX(-position) +
              deleteCurToEnd() +
              writtenStr +
              moveRelX(-writtenStr.length + position + newPosition)
          );
        }
      },
    },

    {
      name: 'onAlternativeEnterPress',
      keys: ['\u000D'],
      onKeyPress: () => this.functions.confirm(),
    },

    {
      name: 'alternativeUpAndDown',
      keys: ['\u001B\u005B\u0041', '\u001B\u005B\u0042'],
      onKeyPress: ({ position, char, answers }) => {
        const { changeCurrentPosition, print, redraw } = this.functions;
        const { maxLength, len, isRounded } = this.constants;
        const isUp = char === '\u001B\u005B\u0041';
        let newPosition = position + (isUp ? -1 : +1);
        if (isRounded && newPosition === len) newPosition = 0;
        if (isRounded && newPosition === -1) newPosition = len - 1;
        if (newPosition >= 0 && newPosition < len) {
          changeCurrentPosition(newPosition);
          let result = moveRelY(maxLength);
          for (let i = 0; i < maxLength; i++)
            result += deleteAllLine() + moveRelY(-1);
          print(
            result +
              moveAbsX(0) +
              moveRelY(maxLength) +
              redraw(newPosition, answers)
          );
        }
      },
    },

    {
      name: 'alternativeLeftAndRight',
      keys: ['\u001B\u005B\u0044', '\u001B\u005B\u0043'],
      onKeyPress: ({ position, char, answers }) => {
        const { print, redraw } = this.functions;
        const { maxLength } = this.constants;
        const isLeft = char === '\u001B\u005B\u0044';
        answers[Object.keys(answers)[position]] = !isLeft;
        const resultData = redraw(position, answers);
        let result = moveRelY(maxLength);
        for (let i = 0; i < maxLength; i++)
          result += deleteAllLine() + moveRelY(-1);
        print(result + moveAbsX(0) + moveRelY(maxLength) + resultData);
      },
    },
  ];
}

module.exports = makeActionsArray;
