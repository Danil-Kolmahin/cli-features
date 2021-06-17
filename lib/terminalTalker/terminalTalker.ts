'use strict';

export class TerminalTalker {
  private stdin: NodeJS.ReadStream;
  constructor({ input }: { input: NodeJS.ReadStream }) {
    this.stdin = input;
  }

  get isRaw() {
    return this.stdin.isRaw;
  }

  setRawMode = (boolFlag: boolean) => this.stdin.setRawMode(boolFlag);

  listenSingleChar = () => {
    const { stdin, setRawMode } = this;
    const isRaw = stdin.isRaw;
    !isRaw && setRawMode(true);
    stdin.resume();
    return new Promise((resolve, reject) => {
      if (!process.stdin.isTTY) reject('!process.stdin.isTTY');
      stdin.once('data', (buffer) => {
        const respStr = buffer.toString();
        stdin.pause();
        !isRaw && setRawMode(false);
        return resolve(respStr);
      });
    });
  };
}
