import * as PIXI from "pixi.js";
import BezierEasing from "bezier-easing";
import {
  Element,
  ElementData,
  TransformData,
  Animation,
  OpacityAnimation,
  PositionAnimation,
  SeparatedPositionAnimation,
  TransformAnimationData,
  PositionData,
  OpacityData
} from "./element";
import pixiVersionHelper from "../versionHelper";

export interface PathData {
  m: any;
  e: any;
  nm: string;
  mn: string;
  d: number;
  ty: string;
  closed: boolean;
  ks: PathDetailData;
}

export interface PathDetailData {
  x: string;
  ix: string;
  a: number;
  k: PathParamData;
}

export interface PathParamData {
  c: boolean;
  i: number[][];
  o: number[][];
  v: number[][];
}

export declare enum LineCap {
  round = 2,
  butt = 1,
  square = 3
}

export declare enum LineJoin {
  round = 2,
  miter = 1,
  bevel = 3
}

export interface StrokeData {
  mn: string;
  nm: string;
  ty: string;
  lc: LineCap;
  lj: LineJoin;
  ml: number;
  fillEnabled: boolean;
  o: {
    k: number;
  };
  w: {
    k: number;
  };
  c: ColorData;
}

export interface TrimData {
  m: any;
  o: number;
  nm: string;
  mn: string;
  ty: string;
  s: {
    k: number;
  };
  e: {
    k: number;
  };
}

export interface RectData {
  mn: string;
  nm: string;
  ty: string;
  d: number;
  p: PositionData;
  s: PositionData;
  r: number;
}

export interface EllipseData {
  mn: string;
  nm: string;
  d: number;
  ty: string;
  p: PositionData;
  s: PositionData;
}

export interface FillData {
  mn: string;
  nm: string;
  ty: string;
  o: OpacityData;
  c: ColorData;
}

export interface ColorData {
  k: (number | ColorAnimationData)[];
}

export interface BoundsData {
  t: number;
  b: number;
  r: number;
  l: number;
}

export interface Path {
  moveTo: PIXI.Point;
  bezierCurveToPaths: {
    cp: PIXI.Point;
    cp2: PIXI.Point;
    to: PIXI.Point;
  }[];
  hasAnimatedPath?: boolean;
  paths?: PathAnimation[];
  isClosed?: boolean;
}

export interface ShapePath {
  isClosed: boolean;
  name: string;
  path: Path;
}

export interface StrokePath {
  miterLimit: number;
  opacity: number;
  width: number;
  color: string | ColorAnimation[];
  enabledFill: boolean;
  lineJoin: LineJoin;
  lineCap: LineCap;
}

export interface TrimShape {
  m: any;
  o: number;
  name: string;
  start: number | TrimAnimation[];
  end: number | TrimAnimation[];
  enabledAnimation?: boolean;
}

export interface Rect {
  name: string;
  direction: number;
  position: PIXI.Point | PositionAnimation[] | SeparatedPositionAnimation;
  size: PIXI.Point | PositionAnimation[] | SeparatedPositionAnimation;
  enabledAnimation?: boolean;
}

export interface Ellipse {
  direction: number;
  position: PIXI.Point | PositionAnimation[] | SeparatedPositionAnimation;
  size: PIXI.Point | PositionAnimation[] | SeparatedPositionAnimation;
  enabledAnimation?: boolean;
}

export interface Fill {
  name?: string;
  opacity?: number | OpacityAnimation[];
  color?: string | ColorAnimation[];
  enabled: boolean;
}

export interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface TrimAnimationData extends TransformAnimationData {
  i: {
    x: number[];
    y: number[];
  };
  o: {
    x: number[];
    y: number[];
  };
}

export interface ColorAnimationData extends TransformAnimationData {
  i: {
    x: number;
    y: number;
  };
  o: {
    x: number;
    y: number;
  };
}

export interface PathAnimationData {
  n: string[];
  s: PathAnimationData[][];
  e: PathAnimationData[][];
  t: number;
  i: {
    x: number;
    y: number;
  };
  o: {
    x: number;
    y: number;
  };
}

export interface TrimAnimation extends Animation {
  fromRatio: number | null;
  toRatio: number | null;
}

export interface ColorAnimation extends Animation {
  fromColor: string;
  toColor: string;
}

export interface PathAnimation extends Animation {
  fromPath: Path | null;
  toPath: Path | null;
}

export class ShapeElement extends Element {
  shapePaths: ShapePath[];
  stroke: StrokePath;
  trim: TrimShape;
  rects: Rect[];
  ellipses: Ellipse[];
  fillRGBA: Fill;
  strokeColorHex: string | undefined;
  fillColorHex: string | undefined;
  isClosed: boolean;
  paths: PathAnimation[];
  beginProcess: Function;
  endProcess: Function;

  constructor(
    data: ElementData | null,
    inFrame: number,
    outFrame: number,
    startTime: number
  ) {
    super();
    if (!data) return;
    this.name = data.nm;
    this.type = data.ty;
    this.inFrame = inFrame;
    this.outFrame = outFrame;
    this.startTime = startTime;
    this.beginProcess = pixiVersionHelper.select(
      () => {} /* for v4 API */,
      () => {
        this.beginHole();
      } /* for v5 API */
    );
    this.endProcess = pixiVersionHelper.select(
      () => {
        // for v4 API
        if (this.graphicsData.length <= 1) {
          return;
        }
        this.addHole();
      },
      () => {
        // for v5 API
        this.endHole();
      }
    );
    if (!data.it) {
      this.setupShapeByType(data);
    } else {
      this.setupShapeIteration(data.it);
    }
    this.drawThis(0);
  }

  setupShapeByType(
    data:
      | ElementData
      | PathData
      | StrokeData
      | TrimData
      | RectData
      | EllipseData
      | FillData
      | TransformData
  ) {
    switch (data.ty) {
      case "sh":
        this.setupPath(data as PathData);
        break;
      case "st":
        this.setupStroke(data as StrokeData);
        break;
      case "tm":
        this.setupTrim(data as TrimData);
        break;
      case "rc":
        this.setupRect(data as RectData);
        break;
      case "el":
        this.setupEllipse(data as EllipseData);
        break;
      case "fl":
        this.setupFill(data as FillData);
        break;
      case "tr":
        this.setupProperties(data as TransformData);
        break;
      default:
        break;
    }
  }

  setupShapeIteration(data: TransformData[]) {
    data.forEach(def => {
      this.setupShapeByType(def);
    });
    if (this.shapePaths) this.shapePaths.reverse();
  }

  setupPath(data: PathData) {
    if (!this.shapePaths) this.shapePaths = [];
    this.shapePaths.push({
      isClosed: data.closed,
      name: data.nm,
      path: this.createPath(data.ks.k)
    });
  }

  setupStroke(data: StrokeData) {
    this.stroke = {
      lineCap: data.lc,
      lineJoin: data.lj,
      miterLimit: data.ml,
      opacity: data.o.k,
      width: data.w.k,
      color: ShapeElement.createColor(data.c),
      enabledFill: data.fillEnabled
    };
  }

  setupTrim(data: TrimData) {
    this.trim = {
      m: data.m,
      o: data.o,
      name: data.nm,
      start: ShapeElement.createTrim(data.s.k),
      end: ShapeElement.createTrim(data.e.k)
    };
    if ((this.trim.start as TrimAnimation[]).length > 0) {
      this.trim.enabledAnimation = true;
    }
  }

  static createTrim(data: number) {
    if (typeof data === "number") {
      return data;
    }
    return ShapeElement.createTrimAnimation(data);
  }

  static createTrimEasing(animData: TrimAnimationData) {
    if (animData.i && animData.o) {
      return BezierEasing(
        animData.o.x[0],
        animData.o.y[0],
        animData.i.x[0],
        animData.i.y[0]
      );
    }
    return (x: number) => x;
  }

  static createTrimAnimation(data: TrimAnimationData[]) {
    const lastIndex = data.length - 1;
    return data.map((animData, index) => {
      const anim: TrimAnimation = {
        name: animData.n,
        startFrame: animData.t,
        endFrame: lastIndex > index ? data[index + 1].t : animData.t,
        easing: ShapeElement.createTrimEasing(animData),
        fromRatio: animData.s ? animData.s[0] : null,
        toRatio: animData.e ? animData.e[0] : null
      };
      return anim;
    });
  }

  setupRect(data: RectData) {
    if (!this.rects) this.rects = [];
    const rect: Rect = {
      name: data.nm,
      direction: data.d,
      position: ShapeElement.createPosition(data.p),
      size: ShapeElement.createSize(data.s)
    };
    const animPos = rect.position as PositionAnimation[];
    const animSize = rect.size as PositionAnimation[];
    if (animPos.length > 0 || animSize.length > 0) {
      rect.enabledAnimation = true;
    }
    this.rects.push(rect);
  }

  setupEllipse(data: EllipseData) {
    if (!this.ellipses) this.ellipses = [];
    const ellipse: Ellipse = {
      direction: data.d,
      position: ShapeElement.createPosition(data.p),
      size: ShapeElement.createSize(data.s)
    };
    const animPos = ellipse.position as PositionAnimation[];
    const animSize = ellipse.size as PositionAnimation[];
    if (animPos.length > 0 || animSize.length > 0) {
      ellipse.enabledAnimation = true;
    }
    this.ellipses.push(ellipse);
  }

  static createSize(data: PositionData) {
    return ShapeElement.createPosition(data);
  }

  static createColor(data: ColorData) {
    if (typeof data.k[0] === "number") {
      return ShapeElement.rgbArrayToHex(data.k as number[]);
    }
    return ShapeElement.createAnimatedColor(data.k as ColorAnimationData[]);
  }

  static createColorEasing(animData: ColorAnimationData) {
    if (animData.i && animData.o) {
      return BezierEasing(
        animData.o.x,
        animData.o.y,
        animData.i.x,
        animData.i.y
      );
    }
    return (x: number) => x;
  }

  static createAnimatedColor(data: ColorAnimationData[]) {
    const lastIndex = data.length - 1;
    return data.map((animData, index) => {
      const anim: ColorAnimation = {
        name: animData.n,
        startFrame: animData.t,
        endFrame: lastIndex > index ? data[index + 1].t : animData.t,
        easing: ShapeElement.createColorEasing(animData),
        fromColor: animData.s
          ? ShapeElement.rgbArrayToHex(animData.s)
          : "0x000000",
        toColor: animData.e
          ? ShapeElement.rgbArrayToHex(animData.e)
          : "0x000000"
      };
      return anim;
    });
  }

  static createPathEasing(animData: PathAnimationData) {
    if (animData.i && animData.o) {
      return BezierEasing(
        animData.o.x,
        animData.o.y,
        animData.i.x,
        animData.i.y
      );
    }
    return (x: number) => x;
  }

  createPathByAnimation(data: PathAnimationData[]) {
    const lastIndex = data.length - 1;
    const path: Path = {
      moveTo: new PIXI.Point(0, 0),
      bezierCurveToPaths: [],
      hasAnimatedPath: true,
      paths: data.map((animData, index) => {
        const anim: PathAnimation = {
          name: animData.n,
          startFrame: animData.t,
          endFrame: lastIndex > index ? data[index + 1].t : animData.t,
          easing: ShapeElement.createPathEasing(animData),
          fromPath: animData.s ? this.createPath(animData.s[0]) : null,
          toPath: animData.e ? this.createPath(animData.e[0]) : null
        };
        return anim;
      })
    };
    return path;
  }

  createPath(pathData: PathParamData | PathAnimationData[]): Path {
    if (!(pathData as PathParamData).v) {
      return this.createPathByAnimation(pathData as PathAnimationData[]);
    }

    // TODO: more smartly clone data
    const data = JSON.parse(JSON.stringify(pathData)) as PathParamData;

    const path: Path = {
      moveTo: new PIXI.Point(0, 0),
      bezierCurveToPaths: []
    };
    data.v.forEach((_v, index) => {
      data.i[index][0] += data.v[index][0];
      data.i[index][1] += data.v[index][1];
      data.o[index][0] += data.v[index][0];
      data.o[index][1] += data.v[index][1];
      if (index === 0) return;
      const cp = data.o[index - 1];
      const cp2 = data.i[index];
      const to = data.v[index];
      if (index === 1) {
        path.moveTo = new PIXI.Point(data.v[0][0], data.v[0][1]);
      }
      path.bezierCurveToPaths.push({
        cp: new PIXI.Point(cp[0], cp[1]),
        cp2: new PIXI.Point(cp2[0], cp2[1]),
        to: new PIXI.Point(to[0], to[1])
      });
    });
    path.bezierCurveToPaths.push({
      cp: new PIXI.Point(
        data.o[data.v.length - 1][0],
        data.o[data.v.length - 1][1]
      ),
      cp2: new PIXI.Point(data.i[0][0], data.i[0][1]),
      to: new PIXI.Point(data.v[0][0], data.v[0][1])
    });
    return path;
  }

  setupFill(data: FillData) {
    this.fillRGBA = {
      color: ShapeElement.createColor(data.c),
      enabled: true,
      name: data.nm,
      opacity: ShapeElement.createOpacity(data.o)
    };
  }

  static rgbArrayToHex(arr: number[]) {
    return ShapeElement.rgbToHex(arr[0], arr[1], arr[2]);
  }

  static rgbToHex(r: number, g: number, b: number) {
    const toHex = ShapeElement.toHex;
    return `0x${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  static toHex(c: number) {
    if (c <= 1) {
      c *= 255;
      c = Math.floor(c);
    }
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }

  updateAnimationFrameByBaseFrame(animBaseFrame: number) {
    super.updateAnimationFrameByBaseFrame(animBaseFrame);
    if (!this.shapePaths) return;
    this.shapePaths.forEach(shapePath => {
      if (!shapePath.path.hasAnimatedPath) return;
      if (!shapePath.path.paths) return;

      shapePath.path.paths.forEach(animData => {
        animData.startFrame += animBaseFrame;
        animData.endFrame += animBaseFrame;
      });
    });
    if (this.ellipses) {
      this.ellipses.forEach(ellipse => {
        if (!ellipse.enabledAnimation) return;

        const sizeAnim = ellipse.size as PositionAnimation[];
        if (sizeAnim.length > 0) {
          sizeAnim.forEach(animData => {
            animData.startFrame += animBaseFrame;
            animData.endFrame += animBaseFrame;
          });
        }
        const posAnim = ellipse.position as PositionAnimation[];
        if (posAnim.length > 0) {
          posAnim.forEach(animData => {
            animData.startFrame += animBaseFrame;
            animData.endFrame += animBaseFrame;
          });
        }
      });
    }
    if (this.rects) {
      this.rects.forEach(rect => {
        if (!rect.enabledAnimation) return;

        const sizeAnim = rect.size as PositionAnimation[];
        if (sizeAnim.length > 0) {
          sizeAnim.forEach(animData => {
            animData.startFrame += animBaseFrame;
            animData.endFrame += animBaseFrame;
          });
        }

        const posAnim = rect.position as PositionAnimation[];
        if (posAnim.length > 0) {
          posAnim.forEach(animData => {
            animData.startFrame += animBaseFrame;
            animData.endFrame += animBaseFrame;
          });
        }
      });
    }
  }

  drawPathForMask(shapePath: Path) {
    const moveTo = shapePath.moveTo;
    this.moveTo(moveTo.x, moveTo.y);
    shapePath.bezierCurveToPaths.forEach(path => {
      this.bezierCurveTo(
        path.cp.x,
        path.cp.y,
        path.cp2.x,
        path.cp2.y,
        path.to.x,
        path.to.y
      );
    });
    this.closePath();
  }

  beforeDraw() {
    if (this.stroke) {
      if (this.stroke.enabledFill && this.strokeColorHex) {
        this.beginFill(parseInt(this.strokeColorHex, 16));
      } else if (this.fillRGBA && this.fillColorHex) {
        this.beginFill(parseInt(this.fillColorHex, 16));
      }
      if (this.strokeColorHex) {
        this.lineStyle(this.stroke.width, parseInt(this.strokeColorHex, 16));
      }
      // TODO: ignore miterLimit and lineCap and lineJoin
    } else if (this.fillRGBA && this.fillColorHex) {
      if (this.fillRGBA.enabled) {
        this.beginFill(parseInt(this.fillColorHex, 16));
      } else {
        this.lineStyle(2, parseInt(this.fillColorHex, 16));
      }
    }
  }

  afterDraw() {
    if (!this.isClosed) return;

    if (this.stroke) {
      if (this.stroke.enabledFill) {
        this.endFill();
      } else if (this.fillRGBA) {
        this.endFill();
      } else {
        this.closePath();
      }
    } else if (this.fillRGBA) {
      if (this.fillRGBA.enabled) {
        this.endFill();
      } else {
        this.closePath();
      }
    }
  }

  drawPath(shapePath: Path) {
    this.beforeDraw();

    this.moveTo(shapePath.moveTo.x, shapePath.moveTo.y);
    shapePath.bezierCurveToPaths.forEach(path => {
      this.bezierCurveTo(
        path.cp.x,
        path.cp.y,
        path.cp2.x,
        path.cp2.y,
        path.to.x,
        path.to.y
      );
    });

    this.afterDraw();
  }

  static createAnimatePos(
    animData: Animation,
    frame: number,
    fromPos: PIXI.Point,
    toPos: PIXI.Point
  ) {
    const totalFrame = animData.endFrame - animData.startFrame;
    const playFrame = (frame - animData.startFrame) * 1.0;
    const posDiffX = toPos.x - fromPos.x;
    const posDiffY = toPos.y - fromPos.y;
    const playRatio = playFrame / totalFrame;
    const posRatio = animData.easing(playRatio);
    const posX = posDiffX * posRatio + fromPos.x;
    const posY = posDiffY * posRatio + fromPos.y;
    return new PIXI.Point(posX, posY);
  }

  static createAnimatePath(animData: PathAnimation, frame: number) {
    const fromPath = animData.fromPath as Path;
    const toPath = animData.toPath as Path;
    return {
      moveTo: ShapeElement.createAnimatePos(
        animData,
        frame,
        fromPath.moveTo,
        toPath.moveTo
      ),
      bezierCurveToPaths: fromPath.bezierCurveToPaths.map((path, index) => {
        const fromBezierCurveToPath = fromPath.bezierCurveToPaths[index];
        const toBezierCurveToPath = toPath.bezierCurveToPaths[index];
        const cp = ShapeElement.createAnimatePos(
          animData,
          frame,
          fromBezierCurveToPath.cp,
          toBezierCurveToPath.cp
        );
        const cp2 = ShapeElement.createAnimatePos(
          animData,
          frame,
          fromBezierCurveToPath.cp2,
          toBezierCurveToPath.cp2
        );
        const to = ShapeElement.createAnimatePos(
          animData,
          frame,
          fromBezierCurveToPath.to,
          toBezierCurveToPath.to
        );
        return { cp, cp2, to };
      })
    };
  }

  setupStrokeColor(frame: number) {
    if (!this.stroke) return;

    if (typeof this.stroke.color !== "string") {
      const firstColor = this.stroke.color[0];
      if (frame < firstColor.startFrame) {
        this.strokeColorHex = firstColor.fromColor;
        return;
      }
      this.stroke.color.forEach(animData => {
        if (animData.startFrame <= frame && frame <= animData.endFrame) {
          this.strokeColorHex = animData.fromColor;
        }
      });
      const lastColor = this.stroke.color[this.stroke.color.length - 2];
      if (frame > lastColor.endFrame) {
        this.strokeColorHex = lastColor.fromColor;
      }
    } else {
      this.strokeColorHex = this.stroke.color;
    }
  }

  setupFillColor(frame: number) {
    if (!this.fillRGBA) return;

    if (typeof this.fillRGBA.color !== "string") {
      const color = this.fillRGBA.color as ColorAnimation[];
      const firstColor = color[0];
      if (frame < firstColor.startFrame) {
        this.fillColorHex = firstColor.fromColor;
        return;
      }
      color.forEach(animData => {
        if (animData.startFrame <= frame && frame <= animData.endFrame) {
          this.fillColorHex = animData.fromColor;
        }
      });
      const lastColor = color[color.length - 2];
      if (frame > lastColor.endFrame) {
        this.fillColorHex = lastColor.toColor;
      }
    } else {
      this.fillColorHex = this.fillRGBA.color;
    }
  }

  static createShapePosition(frame: number, shape: Rect | Ellipse) {
    const posAnim = shape.position as PositionAnimation[];
    if (posAnim.length > 0) {
      let pos: PIXI.Point | null = null;
      posAnim.forEach(animData => {
        if (!animData.toPosition) return;
        if (!animData.fromPosition) return;

        if (animData.startFrame <= frame && frame <= animData.endFrame) {
          const posDiffX = animData.toPosition[0] - animData.fromPosition[0];
          const posDiffY = animData.toPosition[1] - animData.fromPosition[1];
          const totalFrame = animData.endFrame - animData.startFrame;
          const playFrame = (frame - animData.startFrame) * 1.0;
          const playRatio = playFrame / totalFrame;
          const posRatio = animData.easing(playRatio);
          const posX = posDiffX * posRatio + animData.fromPosition[0];
          const posY = posDiffY * posRatio + animData.fromPosition[1];
          pos = new PIXI.Point(posX, posY);
        }
      });
      const lastPos = posAnim[posAnim.length - 2];
      if (frame > lastPos.endFrame && lastPos.toPosition) {
        pos = new PIXI.Point(lastPos.toPosition[0], lastPos.toPosition[1]);
      }
      return pos;
    }
    return shape.position as PIXI.Point;
  }

  static createShapeSize(frame: number, shape: Rect | Ellipse) {
    const sizeAnim = shape.size as PositionAnimation[];
    if (sizeAnim.length > 0) {
      let size: PIXI.Point | null = null;
      sizeAnim.forEach(animData => {
        if (!animData.toPosition) return;
        if (!animData.fromPosition) return;

        if (animData.startFrame <= frame && frame <= animData.endFrame) {
          const sizeDiffW = animData.toPosition[0] - animData.fromPosition[0];
          const sizeDiffH = animData.toPosition[1] - animData.fromPosition[1];
          const totalFrame = animData.endFrame - animData.startFrame;
          const playFrame = (frame - animData.startFrame) * 1.0;
          const playRatio = playFrame / totalFrame;
          const sizeRatio = animData.easing(playRatio);
          const sizeWidth = sizeDiffW * sizeRatio + animData.fromPosition[0];
          const sizeHeight = sizeDiffH * sizeRatio + animData.fromPosition[1];
          size = new PIXI.Point(sizeWidth, sizeHeight);
        }
      });
      const lastSize = sizeAnim[sizeAnim.length - 2];
      if (frame > lastSize.endFrame && lastSize.toPosition) {
        size = new PIXI.Point(lastSize.toPosition[0], lastSize.toPosition[1]);
      }
      return size;
    }
    return shape.size as PIXI.Point;
  }

  drawEllipseAnimation(frame: number, ellipse: Ellipse) {
    const pos = ShapeElement.createShapePosition(frame, ellipse);
    const size = ShapeElement.createShapeSize(frame, ellipse);
    if (!pos || !size) return;

    this.drawEllipse(pos.x, pos.y, size.x / 2.0, size.y / 2.0);
  }

  drawRectAnimation(frame: number, rect: Rect) {
    const pos = ShapeElement.createShapePosition(frame, rect);
    const size = ShapeElement.createShapeSize(frame, rect);
    if (!pos || !size) return;

    this.drawRect(pos.x, pos.y, size.x, size.y);
  }

  drawTrim(frame: number) {
    if (!this.trim.enabledAnimation) {
      this.beforeDraw();
      this.shapePaths.forEach(shapePath => {
        const path = shapePath.path;

        const fromPath = path.moveTo;
        const toPath = path.bezierCurveToPaths[0];
        const xDiff = toPath.to.x - fromPath.x;
        const yDiff = toPath.to.y - fromPath.y;

        const start = this.trim.start as number;
        const end = this.trim.end as number;
        const startX = fromPath.x + (xDiff * start) / 100;
        const startY = fromPath.y + (yDiff * start) / 100;
        const endX = fromPath.x + (xDiff * end) / 100;
        const endY = fromPath.y + (yDiff * end) / 100;
        this.moveTo(startX, startY);
        this.lineTo(endX, endY);
      });
      this.afterDraw();
      return;
    }

    const startAnim = this.trim.start as TrimAnimation[];
    const endAnim = this.trim.end as TrimAnimation[];
    if (frame < startAnim[0].startFrame && frame < endAnim[0].startFrame) {
      return;
    }

    let trimStartRatio: number = 0;
    startAnim.some(animData => {
      if (animData.startFrame === animData.endFrame) {
        return false;
      }
      if (animData.startFrame <= frame && frame <= animData.endFrame) {
        if (animData.toRatio === null) return false;
        if (animData.fromRatio === null) return false;

        const ratioDiff = animData.toRatio - animData.fromRatio;
        const totalFrame = animData.endFrame - animData.startFrame;
        const playFrame = frame - animData.startFrame;
        const perFrameRatio = (1.0 * ratioDiff) / totalFrame;
        trimStartRatio = playFrame * perFrameRatio + animData.fromRatio;
        return true;
      }
      return false;
    });
    let last = startAnim[startAnim.length - 2];
    if (last.endFrame <= frame) {
      trimStartRatio = last.toRatio as number;
    }

    let trimEndRatio = 0;
    endAnim.some(animData => {
      if (animData.startFrame === animData.endFrame) {
        return false;
      }
      if (animData.startFrame <= frame && frame <= animData.endFrame) {
        if (animData.toRatio === null) return false;
        if (animData.fromRatio === null) return false;

        const ratioDiff = animData.toRatio - animData.fromRatio;
        const totalFrame = animData.endFrame - animData.startFrame;
        const playFrame = frame - animData.startFrame;
        const perFrameRatio = (1.0 * ratioDiff) / totalFrame;
        trimEndRatio = playFrame * perFrameRatio + animData.fromRatio;
        return true;
      }
      return false;
    });
    last = endAnim[endAnim.length - 2];
    if (last.endFrame <= frame) {
      trimEndRatio = last.toRatio as number;
    }

    if (trimStartRatio > trimEndRatio) {
      const tmp = trimStartRatio;
      trimStartRatio = trimEndRatio;
      trimEndRatio = tmp;
    }
    this.beforeDraw();
    this.shapePaths.forEach(shapePath => {
      const path = shapePath.path;

      const fromPath = path.moveTo;
      const toPath = path.bezierCurveToPaths[0];
      const xDiff = toPath.to.x - fromPath.x;
      const yDiff = toPath.to.y - fromPath.y;

      const startX = fromPath.x + (xDiff * trimStartRatio) / 100;
      const startY = fromPath.y + (yDiff * trimStartRatio) / 100;
      const endX = fromPath.x + (xDiff * trimEndRatio) / 100;
      const endY = fromPath.y + (yDiff * trimEndRatio) / 100;
      this.moveTo(startX, startY);
      this.lineTo(endX, endY);
    });
    this.afterDraw();
  }

  drawShapePath(frame: number, shapePath: ShapePath, index: number) {
    if (shapePath.path.hasAnimatedPath) {
      this.isClosed = shapePath.isClosed;
      const paths = shapePath.path.paths;
      if (!paths) return;

      if (frame < paths[0].startFrame) {
        if (index !== 0) {
          this.beginProcess();
        }
        this.drawPath(paths[0].fromPath as Path);
        if (index !== 0) {
          this.endProcess();
        }
      }
      paths.some(animData => {
        if (animData.startFrame === animData.endFrame) {
          return false;
        }
        if (animData.startFrame <= frame && frame <= animData.endFrame) {
          if (animData.fromPath === null) return false;
          if (index !== 0) {
            this.beginProcess();
          }
          const animatePath = ShapeElement.createAnimatePath(animData, frame);
          this.drawPath(animatePath);
          if (index !== 0) {
            this.endProcess();
          }
          return true;
        }
        return false;
      });
      const lastPath = paths[paths.length - 2];
      if (lastPath.endFrame <= frame) {
        if (index !== 0) {
          this.beginProcess();
        }
        this.drawPath(lastPath.toPath as Path);
        if (index !== 0) {
          this.endProcess();
        }
      }
    } else if (this.inFrame <= frame && frame <= this.outFrame) {
      if (index !== 0) {
        this.beginProcess();
      }
      this.isClosed = shapePath.isClosed;
      this.drawPath(shapePath.path);
      if (index !== 0) {
        this.endProcess();
      }
    }
  }

  drawShapePaths(frame: number) {
    this.shapePaths.forEach((shapePath, index) => {
      this.drawShapePath(frame, shapePath, index);
    });
  }

  drawThis(frame: number) {
    this.clear();

    this.setupStrokeColor(frame);
    this.setupFillColor(frame);

    if (this.trim) {
      this.drawTrim(frame);
    } else if (this.shapePaths) {
      this.drawShapePaths(frame);
    }

    if (this.ellipses) {
      this.beforeDraw();
      this.ellipses.forEach(ellipse => {
        if (ellipse.enabledAnimation) {
          this.drawEllipseAnimation(frame, ellipse);
        } else {
          const position = ellipse.position as PIXI.Point;
          const size = ellipse.size as PIXI.Point;
          this.drawEllipse(position.x, position.y, size.x / 2.0, size.y / 2.0);
        }
      });
      this.afterDraw();
    }
    if (this.rects) {
      this.beforeDraw();
      this.rects.forEach(rect => {
        if (rect.enabledAnimation) {
          this.drawRectAnimation(frame, rect);
        } else {
          const position = rect.position as PIXI.Point;
          const size = rect.size as PIXI.Point;
          this.drawRect(position.x, position.y, size.x, size.y);
        }
      });
      this.afterDraw();
    }
  }

  __updateWithFrame(frame: number) {
    super.__updateWithFrame(frame);
    this.drawThis(frame);
    return true;
  }
}

export default class ShapeContainerElement extends Element {
  shapes: ShapeElement[];
  bounds: Bounds;
  noreplay: boolean;

  constructor(data: ElementData) {
    super(data);
    if (data.bounds) {
      this.setupBounds(data.bounds);
    } else {
      this.width = 0;
      this.height = 0;
    }
    this.shapes = data.shapes.map(shape => {
      return new ShapeElement(
        shape,
        this.inFrame,
        this.outFrame,
        this.startTime
      );
    });
    this.shapes.forEach(shape => {
      if (this.scaleX && this.scaleY) {
        shape.scaleX = this.scaleX;
        shape.scaleY = this.scaleY;
        shape.scale = new PIXI.Point(this.scaleX, this.scaleY);
      }
      this.addChild(shape);
    });
  }

  destroy(opt: any) {
    const children = this.children.concat();
    children.forEach(child => {
      (child as ShapeElement).destroy(opt);
      this.removeChild(child);
    });
  }

  set frameRate(value: number) {
    super.frameRate = value;
    this.children.forEach(child => {
      (child as Element).frameRate = value;
    });
  }

  set opt(value: any) {
    super.opt = value;
    this.children.forEach(child => {
      (child as ShapeElement).opt = value;
    });
  }

  updateAnimationFrameByBaseFrame(animBaseFrame: number) {
    super.updateAnimationFrameByBaseFrame(animBaseFrame);
    this.shapes.forEach(shape => {
      shape.inFrame += animBaseFrame;
      shape.outFrame += animBaseFrame;
      shape.updateAnimationFrameByBaseFrame(animBaseFrame);
    });
  }

  setupBounds(data: BoundsData) {
    this.width = data.r - data.l;
    this.height = data.b - data.t;
    this.bounds = {
      top: data.t,
      bottom: data.b,
      left: data.l,
      right: data.r
    };
  }

  __updateWithFrame(frame: number) {
    super.__updateWithFrame(frame);
    if (this.noreplay) {
      const children = this.children.concat();
      children.forEach(child => {
        const layer = child as ShapeElement;
        if (layer.outFrame < frame) {
          this.removeChild(layer);
          layer.destroy();
          return false;
        }

        layer.__updateWithFrame(frame);
        return true;
      });
    } else {
      this.children.forEach(child => {
        const layer = child as ShapeElement;
        layer.__updateWithFrame(frame);
      });
    }
    return true;
  }
}
