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
      keys: [...'0123456789'],
      onKeyPress: ({ rewriteInputStr }) => ({
        respStr,
        currentStr,
        position,
      }) =>
        rewriteInputStr(
          currentStr.slice(0, currentStr.length + position) +
            respStr +
            currentStr.slice(currentStr.length + position, currentStr.length)
        ),
    },
  ];

  result.name = await generalQuestion('What is your name?');
  result.age = await generalQuestion('What is your age?', keysController);
  result.password = await generalQuestion('Your password:', [], {
    isPass: true,
  });

  console.log(result);
})();
