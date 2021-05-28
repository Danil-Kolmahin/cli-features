'use strict';

const Questioner = require('../lib/questioner/questioner');

(async () => {
  const { question } = new Questioner({
    input: process.stdin,
    output: process.stdout,
  });

  const result = {};
  console.clear();

  result.name = await question('What is your name?');
  result.age = await question('What is your age?', {
    possibleChars: [...'0123456789'],
  });
  result.password = await question('Your password:', {
    passMode: true,
  });

  console.log(result);
})();
