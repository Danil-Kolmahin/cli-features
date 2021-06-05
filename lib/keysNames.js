'use strict';

const keysNames = {
  ARROW_UP: '\u001B\u005B\u0041',
  ARROW_DOWN: '\u001B\u005B\u0042',
  ARROW_LEFT: '\u001B\u005B\u0044',
  ARROW_RIGHT: '\u001B\u005B\u0043',

  ENTER: '\u000D',
  SPACE: '\u0020',

  BACKSPACE: '\u0008',
  DELETE: '\u001B\u005B\u0033\u007E',
};

const multitudes = {
  ALPHABET: 'abcdefghijklmnopqrstuvwxyz',
  UPPER_ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  DIGITS: '0123456789',
};

module.exports = { keysNames, multitudes };
