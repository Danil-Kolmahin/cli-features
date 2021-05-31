'use strict';

const assert = require('assert').strict;
const {
  moveRelX,
  moveRelY,
  moveRel,
  moveAbsX,
  moveAbsY,
  moveAbs,
} = require('./escSequences').movement;
const { setInvisibleMode, setVisibleMode } = require('./escSequences');
const {
  deleteStartToCur,
  deleteCurToEnd,
  deleteAllLine,
} = require('./escSequences');
const { bold, underlined, invert, colorize } = require('./escSequences').colors;

const testMovementRel = () => {
  const failTests = [{}, '', '5', NaN, null, undefined, 0];
  for (const test of failTests)
    assert.strictEqual(moveRel(test), '', `moveRel(${test}) !== ''`);

  const successTests = [-1, 1, 10, 100, -33, Number.MAX_SAFE_INTEGER];
  for (const test of successTests)
    assert.notStrictEqual(moveRel(test), '', `moveRel(${test}) === ''`);

  const actionsAndExpectations = [
    [() => moveRel(5, 7), '\x1b[5C\x1b[7A'],
    [() => moveRel(-4, -3), '\x1b[4D\x1b[3B'],
  ];
  for (const [action, expected] of actionsAndExpectations)
    assert.strictEqual(action(), expected, `${action()} !== ${expected}`);
};

const testMovementAbs = () => {
  const failTests = [{}, '', '5', NaN, null, undefined, -1, -999];
  for (const test of failTests)
    assert.strictEqual(moveAbs(test), '', `moveAbs(${test}) !== ''`);

  const successTests = [-0, 0, 1, 10, 100, Number.MAX_SAFE_INTEGER];
  for (const test of successTests)
    assert.notStrictEqual(moveAbs(test), '', `moveAbs(${test}) === ''`);
};

const print = (str) => process.stdout.write(str);
const SECOND = 1000;
const printSlowly = async (str, time = SECOND) =>
  await new Promise((resolve) =>
    setTimeout(() => {
      print(str);
      resolve();
    }, time)
  );

const testMovementVisual = async () => {
  for (let i = 1; i < 12; i++) await printSlowly(moveRelX(1), SECOND / 10);
  for (let i = 1; i < 4; i++) await printSlowly(moveRelY(-1), SECOND / 10);
  for (let i = 1; i < 12; i++) await printSlowly(moveRelX(-1), SECOND / 10);
  for (let i = 1; i < 4; i++) await printSlowly(moveRelY(1), SECOND / 10);

  for (let i = 1; i < 4; i++) await printSlowly(moveAbsY(i), SECOND / 10);
  for (let i = 1; i < 12; i++) await printSlowly(moveAbsX(i), SECOND / 10);
  for (let i = 3; i >= 0; i--) await printSlowly(moveAbsY(i), SECOND / 10);
  for (let i = 11; i >= 0; i--) await printSlowly(moveAbsX(i), SECOND / 10);
};

const testDeletingVisual = async () => {
  print('SomeText'.repeat(10) + moveRelX(-40));
  await printSlowly(deleteStartToCur());
  await printSlowly(deleteCurToEnd());
  await printSlowly(moveRelX(-40) + 'SomeText'.repeat(10) + moveRelX(-40));
  await printSlowly(deleteAllLine());
};

const testInvisibleVisual = async () => {
  await printSlowly(setInvisibleMode() + '0');
  await printSlowly('1');
  await printSlowly(setVisibleMode() + '2');
  await printSlowly('3');
};

const testColorsVisual = async () => {
  print(bold('bold'));
  print(underlined('underlined'));
  print(invert('invert'));

  for (let i = 0; i < 8; i++)
    print(
      colorize(i)(i) +
        colorize(i, true, true)(i) +
        colorize(i, false)(i) +
        colorize(i, false, true)(i)
    );
};

const tests = [
  testMovementRel,
  testMovementAbs,
  testMovementVisual,
  testDeletingVisual,
  testInvisibleVisual,
  testColorsVisual,
];

(async () => {
  for (const test of tests) await test();
})();