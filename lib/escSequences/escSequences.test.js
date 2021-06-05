'use strict';

const {
  moveRelX,
  moveRelY,
  moveRel,
  moveAbsX,
  moveAbsY,
  moveAbs,
} = require('./escSequences').movement;
const {
  setInvisibleMode,
  setVisibleMode,
} = require('./escSequences').visibility;
const {
  deleteStartToCur,
  deleteCurToEnd,
  deleteAllLine,
} = require('./escSequences').deleting;
const {
  bold,
  underlined,
  invert,
  setTheme,
} = require('./escSequences').decoration;

describe('RelMovement:', () => {
  test("should return '' if take not number or 0", () => {
    const failTests = [{}, '', '5', NaN, null, undefined, 0];
    for (const test of failTests) expect(moveRel(test)).toBe('');
  });

  test("shouldn't return '' if take not successful values", () => {
    const successTests = [-1, 1, 10, 100, -33, Number.MAX_SAFE_INTEGER];
    for (const test of successTests) expect(moveRel(test)).not.toBe('');
  });

  test('shouldn return correct answers', () => {
    const actionsAndExpectations = [
      [() => moveRel(5, 7), '\x1b[5C\x1b[7A'],
      [() => moveRel(-4, -3), '\x1b[4D\x1b[3B'],
    ];
    for (const [action, expected] of actionsAndExpectations)
      expect(moveRel(action())).not.toBe(expected);
  });
});

describe('AbsMovement:', () => {
  test("should return '' if take not number or 0", () => {
    const failTests = [{}, '', '5', NaN, null, undefined, -1, -999];
    for (const test of failTests) expect(moveAbs(test)).toBe('');
  });

  test("shouldn't return '' if take not successful values", () => {
    const successTests = [-0, 0, 1, 10, 100, Number.MAX_SAFE_INTEGER];
    for (const test of successTests) expect(moveAbs(test)).not.toBe('');
  });
});

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
      setTheme({ foregroundColor: i })(i) +
        setTheme({ foregroundColor: i, isForeColorBright: true })(i) +
        setTheme({ backgroundColor: i })(i) +
        setTheme({ backgroundColor: i, isBackColorBright: true })(i)
    );
};

const tests = [
  // testMovementVisual,
  // testDeletingVisual,
  // testInvisibleVisual,
  // testColorsVisual,
];

(async () => {
  for (const test of tests) await test();
})();
