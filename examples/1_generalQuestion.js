'use strict';

const Questioner = require('../lib/questioner');

(async () => {
  const { generalQuestion } = new Questioner({
    input: process.stdin,
    output: process.stdout,
  });

  const result = {};
  console.clear();

  const keysController = [
    {
      name: 'onSomeLetter',
    },
    {
      name: 'onSomeDigit',
      keys: ['0123456789'],
      onKeyPress: ({ modifyInputStr }) => ({ respStr }) =>
        modifyInputStr(respStr),
    },
  ];

  result.name = await generalQuestion('What is your name?');
  result.age = await generalQuestion('What is your age?', keysController);

  console.log(result);
})();
