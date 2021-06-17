'use strict';

import { movement, visibility, deleting, decoration } from './escSequences';

const { moveRelX, moveRelY, moveRel, moveAbsX, moveAbsY, moveAbs } = movement;
const { setInvisibleMode, setVisibleMode } = visibility;
const { deleteStartToCur, deleteCurToEnd, deleteAllLine } = deleting;
const { bold, underlined, invert, setTheme } = decoration;

import { strict as assert } from 'assert';

const testMovementRel = () => {
  const failTests = [NaN, 0];
  for (const test of failTests)
    assert.strictEqual(moveRel(test, test), '', `moveRel(${test}) !== ''`);
  const successTests = [-1, 1, 10, 100, -33, Number.MAX_SAFE_INTEGER];
  for (const test of successTests)
    assert.notStrictEqual(moveRel(test, test), '', `moveRel(${test}) === ''`);
  const actionsAndExpectations: Array<[() => {}, string]> = [
    [() => moveRel(5, 7), '\x1b[5C\x1b[7A'],
    [() => moveRel(-4, -3), '\x1b[4D\x1b[3B'],
  ];
  for (const [action, expected] of actionsAndExpectations)
    assert.strictEqual(action(), expected, `${action()} !== ${expected}`);
};
const testMovementAbs = () => {
  const failTests = [-1, -999];
  for (const test of failTests)
    assert.strictEqual(moveAbs(test, test), '', `moveAbs(${test}) !== ''`);
  const successTests = [-0, 0, 1, 10, 100, Number.MAX_SAFE_INTEGER];
  for (const test of successTests)
    assert.notStrictEqual(moveAbs(test, test), '', `moveAbs(${test}) === ''`);
};

const printStr = (str: string): void => {
  process.stdout.write(str);
};
const SECOND = 1000;
const printSlowly = async (str: string, time = SECOND) =>
  await new Promise<void>((resolve) =>
    setTimeout(() => {
      printStr(str);
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
  printStr('SomeText'.repeat(10) + moveRelX(-40));
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
  printStr(bold('bold'));
  printStr(underlined('underlined'));
  printStr(invert('invert'));

  for (let i = 0; i < 8; i++) {
    const s = i.toString();
    printStr(
      setTheme({ foregroundColor: i })(s) +
        setTheme({ foregroundColor: i, isForeColorBright: true })(s) +
        setTheme({ backgroundColor: i })(s) +
        setTheme({ backgroundColor: i, isBackColorBright: true })(s)
    );
  }
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
