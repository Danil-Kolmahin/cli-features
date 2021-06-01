# cli-features
Convenient interface for communicating with the user from the command line

Base Usage:
```js
const { Questioner } = require('cli-features');

const { generalQuestion } = new Questioner({
  input: process.stdin,
  output: process.stdout,
});

generalQuestion('What is your name?').then(console.log);
```
![](https://drive.google.com/uc?export=view&id=13oP-cZmHtfB7UXLIUqfoq64DULo5EHrO)

From [examples/1_generalQuestion.js](./examples/1_generalQuestion.js):
```js
'use strict';

const { Questioner } = require('cli-features');

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
  result.age = parseFloat(await generalQuestion('What is your age?', {
    possibleChars: [...'0123456789'],
  }));
  result.phone = await generalQuestion('What is your phone number?', {
    possibleChars: [...'+-()0123456789'],
    validate: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im,
    validateErrMessage: "it isn't phone number",
  });
  result.password = await passQuestion('Your password:', {
    minLength: 6,
  });

  console.log(result);
})();
```
![](https://drive.google.com/uc?export=view&id=1z9avImuKwU1S_iZNTOEKC1qhdsl0uNju)