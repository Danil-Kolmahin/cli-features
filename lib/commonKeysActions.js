'use strict';

const keysControllers = [
  {
    name: 'onEnterPress',
    keys: ['\u000D'],
    onKeyPress: ({ confirm }) => () => confirm(),
  },
  {
    name: 'onSomeLetter',
    keys: ['abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
    onKeyPress: ({ modifyInputStr }) => ({ respStr }) =>
      modifyInputStr(respStr),
  },
  {
    name: 'ctrlC',
    keys: ['\u0003'],
    onKeyPress: () => () => process.exit(),
  },
];

const commonKeysActions = {};
keysControllers.forEach(
  (rule) => rule.name && (commonKeysActions[rule.name] = rule)
);

module.exports = commonKeysActions;
