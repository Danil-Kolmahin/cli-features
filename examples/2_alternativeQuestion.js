'use strict';

const Questioner = require('../lib/questioner/questioner');

(async () => {
  const { alternativeQuestion } = new Questioner({
    input: process.stdin,
    output: process.stdout,
  });

  const result = {};
  console.clear();

  const profession = ['Cleaner', 'Gardener', 'Plumber', 'Dishwasher'];
  result.profession = await alternativeQuestion(
    'What is your profession?',
    profession
  );

  const languages = {
    Spanish: false,
    English: false,
    German: false,
    JavaScript: true,
  };
  result.languages = await alternativeQuestion(
    'Which languages do you know?',
    languages
  );

  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  result.colors = await alternativeQuestion(
    'What is your favorite numbers?',
    numbers,
    { maxLength: 5 }
  );

  const colors = {
    Green: false,
    Red: true,
    Blue: false,
    White: true,
    Black: false,
  };
  result.colors = await alternativeQuestion(
    'What colors do you like?',
    colors,
    { startWith: 2, isRounded: true }
  );

  console.log(result);
})();
