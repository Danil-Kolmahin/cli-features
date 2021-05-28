'use strict';

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
      const {
        incrementCurrentPosition,
        changeCurrentStr,
        moveRelX,
        deleteCurToEnd,
      } = this.functions;
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

    const getKeysLength = (obj) =>
      obj.keys.reduce((acc, cur) => acc + cur.length);
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
    ],
  };

  listeners = [
    {
      name: 'onEnterPress',
      keys: ['\u000D'],
      onKeyPress: () => {
        const { confirm } = this.functions;
        confirm();
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
        const { incrementCurrentPosition, print, moveRelX } = this.functions;
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
          moveRelX,
          deleteCurToEnd,
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
  ];
}

module.exports = makeActionsArray;
