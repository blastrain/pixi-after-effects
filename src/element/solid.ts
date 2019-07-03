import { Element, ElementData } from "./element";

export default class SolidElement extends Element {
  color: string;
  colorNumber: number;
  sw: number;
  sh: number;

  constructor(data: ElementData) {
    super(data);
    this.color = (data.sc as string) || "";
    this.colorNumber = (data.sc as number) || 0;
    this.sw = data.sw || 0;
    this.sh = data.sh || 0;
    if (this.color.startsWith("#")) {
      this.color = `0x${this.color.substr(1)}`;
      this.colorNumber = parseInt(this.color, 16);
    }
  }

  __updateWithFrame(frame: number) {
    super.__updateWithFrame(frame);
    this.clear();
    this.beginFill(this.colorNumber, this.opacity);
    this.drawRect(0, 0, this.sw * this.scaleX, this.sh * this.scaleY);
    this.endFill();
    return true;
  }
}
