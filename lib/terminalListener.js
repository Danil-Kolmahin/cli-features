'use strict';

class TerminalListener {
  constructor({ input }) {
    this.stdin = input;
  }

  setRawMode = (boolFlag) => this.stdin.setRawMode(boolFlag);

  configureKeysController = (keysController, props) => {
    const mySet = new Set();
    return keysController
      .filter((rule) =>
        !rule.name || mySet.has(rule.name) ? false : mySet.add(rule.name)
      )
      .map((rule) => ({
        keys: rule.keys || [],
        onKeyPress: rule.onKeyPress ? rule.onKeyPress(props) : () => {},
      }));
  };

  listenSingleChar = (keysRules) => {
    const { stdin } = this;
    const isRaw = stdin.isRaw;
    !isRaw && stdin.setRawMode(true);
    stdin.resume();
    return new Promise((resolve) =>
      stdin.once('data', (buffer) => {
        const respStr = buffer.toString();
        stdin.pause();
        !isRaw && stdin.setRawMode(false);
        return resolve({
          foundControlCases: keysRules.filter((rule) =>
            rule.keys.some((str) => str === respStr)
          ),
          respStr,
        });
      })
    );
  };
}

module.exports = TerminalListener;
