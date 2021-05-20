'use strict';

const keysControllers = [
  {
    name: 'onEnterPress',
    keys: ['\u000D'],
    onKeyPress: ({ confirm }) => () => confirm(),
  },
  {
    name: 'onSomeLetter',
    keys: [...'abcdefghijklmnopqrstuvwxyz', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
    onKeyPress: ({ rewriteInputStr }) => ({ respStr, currentStr, position }) =>
      rewriteInputStr(
        currentStr.slice(0, currentStr.length + position) +
          respStr +
          currentStr.slice(currentStr.length + position, currentStr.length)
      ),
  },
  {
    name: 'ctrlC',
    keys: ['\u0003'],
    onKeyPress: () => () => process.exit(),
  },
  {
    name: 'backspace',
    keys: ['\u0008'],
    onKeyPress: ({ rewriteInputStr, move }) => ({ currentStr, position }) => {
      const newStr =
        currentStr.slice(0, currentStr.length + position - 1) +
        currentStr.slice(currentStr.length + position, currentStr.length);
      rewriteInputStr(newStr);
      if (!(position !== 0 && newStr.length + position > 0)) move(1);
    },
  },
  {
    name: 'left',
    keys: ['\u001B\u005B\u0044'],
    onKeyPress: ({ move }) => () => move(-1),
  },
  {
    name: 'right',
    keys: ['\u001B\u005B\u0043'],
    onKeyPress: ({ move }) => () => move(1),
  },
  {
    name: 'up',
    keys: ['\u001B\u005B\u0041'],
    onKeyPress: ({ moveHistory }) => () => moveHistory(1),
  },
  {
    name: 'down',
    keys: ['\u001B\u005B\u0042'],
    onKeyPress: ({ moveHistory }) => () => moveHistory(-1),
  },
];

const commonKeysActions = {};
keysControllers.forEach(
  (rule) => rule.name && (commonKeysActions[rule.name] = rule)
);

module.exports = commonKeysActions;
