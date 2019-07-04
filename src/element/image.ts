import * as PIXI from 'pixi.js';
import { Asset } from '../asset';
import { Element, ElementData } from './element';

export default class ImageElement extends Element {
  image: PIXI.Sprite;

  blendMode: number;

  referenceId: string;

  constructor(data: ElementData) {
    super(data);
    if (data.bmPIXI) {
      this.blendMode = data.bmPIXI;
    }
    if (data.image) {
      this.image = data.image;
      if (this.blendMode !== PIXI.BLEND_MODES.NORMAL) {
        this.image.blendMode = this.blendMode;
      }
      this.addChild(this.image);
    }
  }

  setupImage(assetMap: { [key: string]: Asset }) {
    if (this.image) return;
    if (!this.referenceId) return;

    const asset = assetMap[this.referenceId];
    if (!asset) return;

    if (asset.blendMode) {
      this.blendMode = asset.blendMode;
    }
    this.image = new PIXI.Sprite(asset.texture);
    this.image.blendMode = this.blendMode;
    this.addChild(this.image);
  }
}
