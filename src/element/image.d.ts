import * as PIXI from "pixi.js";
import { Asset } from "../asset";
import { Element, ElementData } from "./element";
export default class ImageElement extends Element {
    image: PIXI.Sprite;
    blendMode: number;
    referenceId: string;
    constructor(data: ElementData);
    setupImage(assetMap: {
        [key: string]: Asset;
    }): void;
}
