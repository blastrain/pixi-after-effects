export interface CharData {
  ch: string;
  fFamily: string;
  size: number;
  style: string;
  w: number;
  data: {
    shapes: any
  };
};

export default class Char {
  ch: string;
  fontFamily: string;
  fontSize: number;
  fontStyle: string;
  width: number;
  shapes: any;

  constructor(data : CharData) {
    this.ch         = data.ch;
    this.fontFamily = data.fFamily;
    this.fontSize   = data.size;
    this.fontStyle  = data.style;
    this.width      = data.w;
    this.shapes     = data.data.shapes;
  }
}
