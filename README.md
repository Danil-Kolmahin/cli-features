&thinsp;┌─┐┬&emsp;&thinsp;&thinsp;┬&emsp; &emsp; &emsp; &thinsp;&thinsp;&thinsp;&thinsp;┌─┐┌─┐&thinsp;&thinsp;┌─┐┌┬┐&thinsp;┬&nbsp;&thinsp;&thinsp;┬ ┬─┐┌─┐┌─┐<br/>
&nbsp;│&ensp; &nbsp;&thinsp; │&emsp; &thinsp;│&emsp; ───&ensp;&nbsp;&thinsp; ├┤&ensp;&thinsp;├┤&ensp;&nbsp; ├─┤&ensp; │&ensp;&thinsp; │&ensp; │ ├┬┘├┤&nbsp;&thinsp; └─┐<br/>
&thinsp;└─┘┴─┘┴&emsp; &emsp; &ensp; &nbsp; &nbsp; &thinsp;└&ensp; &nbsp;&thinsp;&thinsp;└─┘ ┴&ensp; ┴&nbsp;&thinsp;&thinsp;┴&ensp;&thinsp;&thinsp;└─┘ ┴└─└─┘└─┘<br/>

Convenient interface for communicating with user from command line

## Main memo

- Install: `npm install concolor`
- Require: `const { Questioner, EscSequences } = require('cli-features');`
- How you can use it:
    - [base usage](#base-usage)
    - [general question](#general-question)
    - [alternative question](#alternative-question)
    - [esc sequences](#esc-sequences)

## Base Usage

```js
const { Questioner } = require('cli-features');

const { generalQuestion } = new Questioner({
  input: process.stdin,
  output: process.stdout,
});

generalQuestion('What is your name?').then(console.log);
```

<span style="display:block;text-align:center">
<img alt="wait for .gif" src="https://drive.google.com/uc?export=view&id=13oP-cZmHtfB7UXLIUqfoq64DULo5EHrO"/>
</span>

## General question

Examples: [1_generalQuestion.js](./examples/1_generalQuestion.js)

<span style="display:block;text-align:center">
<img alt="wait for .gif" src="https://drive.google.com/uc?export=view&id=1z9avImuKwU1S_iZNTOEKC1qhdsl0uNju"/>
</span>

## Alternative question

####alternativeQuestion(
* **questionStr**: `string` - the line that will be printed at the start of the poll. **(mandatory)**
* **answers**: `array[string] || object{string: boolean}` - possible answer options. If answers is an object, then instead of choosing one option, it becomes possible to select several (you can also specify which options will be enabled by default, by specifying the true key). **(mandatory)**
* **options**: {
  - _maxLength_: `number` - the maximum length of the list, after exceeding which, the list will be partially displayed
  - _startWith_: `number` - starting element index
  - _isRounded_: `boolean` - indicates whether the list looped back<br/>
}
####) => `string || array[string]` - selected points

Examples: [2_alternativeQuestion.js](./examples/2_alternativeQuestion.js)

<span style="display:block;text-align:center">
<img alt="wait for .gif" src="https://drive.google.com/uc?export=view&id=1XkDG6tSChqjuqIcZeQoqxJU_UTkeBpgQ"/>
</span>

## ESC sequences

> Remember!!! Esc sequences must be printed, otherwise there will be no effect!!!

####EscSequences{
* **movement** {
  - _moveRelX_ (**dx** `number`) - moves the cursor along the x-axis by **dx** columns
  - _moveRelY_ (**dy** `number`) - moves the cursor along the y-axis by **dy** rows
  - _moveRel_ (**dx** `number`, **dy** `number`) - moves the cursor along the x-axis by **dx** columns and along the y-axis by **dy** rows
  - _moveAbsX_ (**x** `number`) - moves the cursor to the point corresponding to the coordinate **x**
  - _moveAbsY_ (**y** `number`) - moves the cursor to the point corresponding to the coordinate **y**
  - _moveAbs_ (**x** `number`, **y** `number`) - moves the cursor to the point corresponding to the coordinates **x**, **y**<br/>
}
* **visibility** {
  - _setInvisibleMode_ () - makes the cursor invisible
  - _setVisibleMode_ () - makes the cursor visible<br/>
}
* **deleting** {
  - _deleteStartToCur_ () - clears the line from the current cursor position to the end of the line
  - _deleteCurToEnd_ () - clears the line from the beginning of the line to the current cursor position
  - _deleteAllLine_ () - clears the whole line<br/>
    }
* **decoration** {
  - _normal_ () - character after which everything printed will have its original form
  - _bold_ () - makes the text **bold**
  - _underlined_ () - makes text underlined
  - _invert_ () - inverts the color of the text
  - _setForegroundColor_ (**color** `number || string`, **isBright** `boolean`) - set text foreground **color**, if **isBright** is true, then another color pad will be used
  - _setBackgroundColor_  (**color** `number || string`, **isBright** `boolean`) - set text background **color**, if **isBright** is true, then another color pad will be used
  - _setTheme_ ({
    **options** = `array[string]`,
    **foregroundColor** `number || string`,
    **isForeColorBright** `boolean`,
    **backgroundColor** `number || string`,
    **isBackColorBright** `boolean`,
    }) - **foregroundColor** and **isForeColorBright** correspond to color and isBright from setForegroundColor (), so do **backgroundColor** and **isBackColorBright**, in options you can pass something like `['bold', 'underlined']`, to styling the text<br/>
    }
> Possible colors: 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'<br/>
> Their numbers: &emsp;0, &emsp;&emsp;1, &emsp;&emsp;2, &emsp;&emsp;&nbsp;&nbsp;3, &emsp;&emsp;4, &emsp;&emsp;&nbsp;&nbsp;5, &emsp;&emsp;&emsp;6, &emsp;&nbsp;&nbsp;&nbsp;&nbsp;7
####}

Examples: [escSequences.test.js](./lib/escSequences/escSequences.test.js)
