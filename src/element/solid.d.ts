import { Element, ElementData } from './element';
export default class SolidElement extends Element {
    color: string;
    colorNumber: number;
    sw: number;
    sh: number;
    constructor(data: ElementData);
    __updateWithFrame(frame: number): boolean;
}
