import * as PIXI from 'pixi.js';

const pixiVersionHelper = {
  version: PIXI.VERSION,
  semanticVersion() {
    const semVer = this.version.match(/([0-9]+)\.([0-9]+)\.([0-9]+)/);
    if (semVer.length < 3) {
      return [0, 0, 0];
    }
    const major = parseInt(semVer[1], 10);
    const minor = parseInt(semVer[2], 10);
    const patch = parseInt(semVer[3], 10);
    return [major, minor, patch];
  },
  major() { return this.semanticVersion()[0]; },
  minor() { return this.semanticVersion()[1]; },
  patch() { return this.semanticVersion()[2]; },
  isV4()  { return this.major() === 4; },
  isV5()  { return this.major() === 5; },
  select(v4func, v5func) {
    if (this.isV4() && v4func !== undefined) { return v4func; }
    if (this.isV5() && v5func !== undefined) { return v5func; }
    return () => {};
  },
};

export default pixiVersionHelper;
