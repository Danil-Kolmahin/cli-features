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
const {
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  ARROW_DOWN,
  ENTER,
  BACKSPACE,
  DELETE,
} = require('../keysNames').keysNames;
const { ALPHABET, UPPER_ALPHABET } = require('../keysNames').multitudes;

const ALWAYS_LAST = 'ALWAYS_LAST';
const ALWAYS_FIRST = 'ALWAYS_FIRST';

class makeActionsArray {
  prepareListenersArray = (selectedListeners, customListeners) => {
    let resultListenersArray = [];
    const uniqueListeners = new Set();

    // prepare selectedListeners
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

    // prepare customListeners
    customListeners.forEach((listener) => {
      if (typeof listener !== 'object') return;
      if (!listener.name) return;

      if (uniqueListeners.has(listener.name)) {
        const index = resultListenersArray.findIndex(
          (candidate) => candidate.name === listener.name
        );
        if (listener.keys) resultListenersArray[index].keys = listener.keys;
        if (listener.onKeyPress)
          resultListenersArray[index].onKeyPress = listener.onKeyPress.bind(
            this
          );
      } else {
        if (!listener.keys) listener.keys = [];
        if (!listener.onKeyPress) listener.onKeyPress = () => {};
        uniqueListeners.add(listener.name);
        resultListenersArray.push(listener.onKeyPress.bind(this));
      }
    });

    // sort by number of keys
    const getKeysLength = (obj) => {
      if (obj.keys[0] === ALWAYS_LAST) return Infinity;
      if (obj.keys[0] === ALWAYS_FIRST) return -Infinity;
      return obj.keys.reduce((acc, cur) => acc + cur.length, 0);
    };
    resultListenersArray = resultListenersArray.sort(
      (a, b) => getKeysLength(a) - getKeysLength(b)
    );

    return resultListenersArray;
  };

  constructor(
    functions = {},
    constants = {},
    selectedListeners = [],
    customListeners = []
  ) {
    Object.assign(this.functions, functions);
    this.constants = constants;
    return this.prepareListenersArray(selectedListeners, customListeners);
  }

  functions = {
    writeSingleChar: ({ currentStr, char, position }) => {
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
    },

    createErr: (errMessage, errType, position) => {
      const { preposition, theme } = this.constants;
      return (
        moveRelY(-1) +
        moveAbsX(0) +
        theme.errorType(errType) +
        ' ' +
        theme.errorMessage(errMessage) +
        moveRelY(1) +
        moveAbsX(preposition.length + position)
      );
    },
  };

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
      keys: [ALWAYS_FIRST],
      onKeyPress: () => {
        const { print } = this.functions;
        print(moveRelY(-1), deleteAllLine(), moveRelY(1));
      },
    },

    {
      name: 'onEnterPress',
      keys: [ENTER],
      onKeyPress: ({ currentStr, position }) => {
        const { confirm, createErr, print, validationFunc } = this.functions;
        const { minLength, validateErrMessage } = this.constants;
        let error = '';
        let errType = 'Some unrecognized error:';

        if (currentStr.length < minLength) {
          error = `Error: currentStr.length (${currentStr.length}) < minLength (${minLength})`;
          errType = 'MinLength error:';
        }
        if (validationFunc && !validationFunc(currentStr)) {
          error = validateErrMessage;
          errType = 'Validation error:';
        }

        if (error) print(createErr(error, errType, position));
        else confirm();
      },
    },

    {
      name: 'onSomeLetter',
      keys: [...ALPHABET, ...UPPER_ALPHABET],
      onKeyPress: ({ currentStr, char, position }) => {
        const { writeSingleChar, print } = this.functions;
        print(writeSingleChar({ currentStr, char, position }));
      },
    },

    {
      name: 'leftAndRight',
      keys: [ARROW_LEFT, ARROW_RIGHT],
      onKeyPress: ({ position, char, currentStr }) => {
        const { incrementCurrentPosition, print } = this.functions;
        const isLeft = char === ARROW_LEFT;
        const newPosition = isLeft ? -1 : +1;
        if (
          (position > 0 && isLeft) ||
          (position < currentStr.length && !isLeft)
        ) {
          incrementCurrentPosition(newPosition);
          print(moveRelX(newPosition));
        }
      },
    },

    {
      name: 'backspaceAndDelete',
      keys: [BACKSPACE, DELETE],
      onKeyPress: ({ currentStr, position, char }) => {
        const {
          incrementCurrentPosition,
          changeCurrentStr,
          print,
        } = this.functions;
        const { passMode, passSymbol } = this.constants;
        const isBackspace = char === BACKSPACE;
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
            moveRelX(-position),
            deleteCurToEnd(),
            writtenStr,
            moveRelX(-writtenStr.length + position + newPosition)
          );
        }
      },
    },

    {
      name: 'onAlternativeEnterPress',
      keys: [ENTER],
      onKeyPress: () => this.functions.confirm(),
    },

    {
      name: 'alternativeUpAndDown',
      keys: [ARROW_UP, ARROW_DOWN],
      onKeyPress: ({ position, char, answers }) => {
        const { changeCurrentPosition, print, redraw } = this.functions;
        const { maxLength, len, isRounded } = this.constants;
        let newPosition = position + (char === ARROW_UP ? -1 : +1);
        if (isRounded && newPosition === len) newPosition = 0;
        if (isRounded && newPosition === -1) newPosition = len - 1;
        if (newPosition >= 0 && newPosition < len) {
          changeCurrentPosition(newPosition);
          let result = moveRelY(maxLength);
          for (let i = 0; i < maxLength; i++)
            result += deleteAllLine() + moveRelY(-1);
          print(
            result,
            moveAbsX(0),
            moveRelY(maxLength),
            redraw(newPosition, answers)
          );
        }
      },
    },

    {
      name: 'alternativeLeftAndRight',
      keys: [ARROW_LEFT, ARROW_RIGHT],
      onKeyPress: ({ position, char, answers }) => {
        const { print, redraw } = this.functions;
        const { maxLength } = this.constants;
        answers[Object.keys(answers)[position]] = char === ARROW_RIGHT;
        const resultData = redraw(position, answers);
        let result = moveRelY(maxLength);
        for (let i = 0; i < maxLength; i++)
          result += deleteAllLine() + moveRelY(-1);
        print(result, moveAbsX(0), moveRelY(maxLength), resultData);
      },
    },
  ];
}

module.exports = makeActionsArray;
