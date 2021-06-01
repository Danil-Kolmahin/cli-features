'use strict';

const Questioner = require('../lib/questioner/questioner');

(async () => {
  const { generalQuestion, passQuestion, yesNoQuestion } = new Questioner({
    input: process.stdin,
    output: process.stdout,
  });

  const result = {};
  console.clear();

  result.name = await generalQuestion('What is your name?');
  result.isMale = await yesNoQuestion('Are you male?', {
    defaultAnswer: true,
  });
  result.age = await generalQuestion('What is your age?', {
    possibleChars: [...'0123456789'],
  });
  result.phone = await generalQuestion('What is your phone number?', {
    possibleChars: [...'+-()0123456789'],
    validate: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
    validateErrMessage: "Error: it isn't phone number",
  });
  result.password = await passQuestion('Your password:', {
    minLength: 6,
  });

  console.log(result);
})();
