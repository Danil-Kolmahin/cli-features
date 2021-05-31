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
  result.age = await question('What is your phone number?', {
    possibleChars: [...'+-()0123456789'],
    validate: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
    validateErrMessage: "Error: it isn't phone number",
  });
  result.password = await question('Your password:', {
    passMode: true,
    minLength: 6,
  });

  console.log(result);
})();
