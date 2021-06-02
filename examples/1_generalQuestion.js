'use strict';

const Questioner = require('../lib/questioner/questioner');

(async () => {
  const {
    generalQuestion,
    passQuestion,
    yesNoQuestion,
    alternativeQuestion,
  } = new Questioner({
    input: process.stdin,
    output: process.stdout,
  });

  const result = {};
  console.clear();

  result.name = await generalQuestion('What is your name?');
  result.isMale = await yesNoQuestion('Are you male?', {
    defaultAnswer: true,
  });
  result.age = parseFloat(
    await generalQuestion('What is your age?', {
      possibleChars: [...'0123456789'],
    })
  );
  result.phone = await generalQuestion('What is your phone number?', {
    possibleChars: [...'+-()0123456789'],
    validate: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
    validateErrMessage: "it isn't phone number",
  });
  result.password = await passQuestion('Your password:', {
    minLength: 6,
  });
  result.profession = await alternativeQuestion('What is your profession?', [
    'Cleaner',
    'Gardener',
    'Plumber',
    'Dishwasher',
  ]);
  result.professionalSkills = await alternativeQuestion(
    'What abilities do you have?',
    {
      Cleaning: false,
      Gardening: false,
      Plumbing: true,
      Dishwashing: false,
    }
  );

  console.log(result);
})();
