import * as PIXI from 'pixi.js';
import BezierEasing from 'bezier-easing';
import { AfterEffects } from '../AfterEffects';
import ElementFinder from './finder';
import ElementPlayer from './player';
import ElementDeltaPlayer from './delta_player';
import { ShapeElement, PathParamData } from './shape';
import { MaskElement } from './mask';

const TRACK_MATTE_TYPE = {
  ALPHA: 1,
  ALPHA_INVERTED: 2,
  LUMA: 3,
  LUMA_INVERTED: 4,
};

export interface Container extends PIXI.Graphics {
  parent: Container;
  isInvertedMask: boolean;
}

export interface ElementData {
  ao: number;
  w: number;
  h: number;
  nm: string;
  p?: string;
  id?: string;
  refId: string;
  ty: number | string;
  completed: any;
  ind: number;
  parent: number;
  ip: number;
  op: number;
  sr: number;
  st: number;
  hasMask: boolean;
  ks: TransformData;
  bm: number;
  bmPIXI: number;
  tt: any;
  td: any;
  masksProperties: MaskProperty[];
  events: {
    [x: string]: Function;
  };
  bounds: {
    t: number;
    b: number;
    l: number;
    r: number;
  };
  image?: PIXI.Sprite;
  sc?: string | number;
  sw?: number;
  sh?: number;
  text?: PIXI.Text;
  rawText?: string;
  t?: {
    d: {
      k: {
        s: TextData;
      }[];
    };
  };
  imagePath?: string;
  texture?: any;
  isDisused?: boolean;
  layers?: ElementData[];
  u?: string;
  it?: TransformData[];
  shapes: any[];
}

export interface TextData {
  f: string;
  fc: number[];
  s: number;
  t: string;
  lh: number;
  ls: any;
  tr: any;
  j: number;
}

export interface MaskProperty {
  cl: boolean;
  inv: boolean;
  pt: {
    k: PathParamData;
  };
  mode: string;
  o: OpacityData;
}

export interface TransformData {
  mn?: string;
  nm?: string;
  ty?: string;
  a: AnchorPointData;
  p: PositionData;
  s: ScaleData;
  r: RotationData;
  o: OpacityData;
}

export interface AnchorPointData {
  k: (number | AnchorPointAnimationData)[];
}

export interface PositionData {
  k: (number | PositionAnimationData)[];
  x: {
    k: number;
  };
  y: {
    k: number;
  };
}

export interface SeparatedPositionData {
  x: {
    k: SeparatedPositionAnimationData[];
  };
  y: {
    k: SeparatedPositionAnimationData[];
  };
}

export interface ScaleData {
  k: (number | ScaleAnimationData)[];
}

export interface RotationData {
  k: number | RotationAnimationData[];
}

export interface OpacityData {
  k: number | OpacityAnimationData[];
}

export interface TransformAnimationData {
  n: string[];
  s: number[];
  e: number[];
  t: number;
}

export interface AnchorPointAnimationData extends TransformAnimationData {
  i: {
    x: number;
    y: number;
  };
  o: {
    x: number;
    y: number;
  };
}

export interface PositionAnimationData extends TransformAnimationData {
  i: {
    x: number;
    y: number;
  };
  o: {
    x: number;
    y: number;
  };
}

export interface SeparatedPositionAnimationData extends TransformAnimationData {
  i: {
    x: number[];
    y: number[];
  };
  o: {
    x: number[];
    y: number[];
  };
}

export interface OpacityAnimationData extends TransformAnimationData {
  i: {
    x: number[];
    y: number[];
  };
  o: {
    x: number[];
    y: number[];
  };
}

export interface RotationAnimationData extends TransformAnimationData {
  i: {
    x: number[];
    y: number[];
  };
  o: {
    x: number[];
    y: number[];
  };
}

export interface ScaleAnimationData extends TransformAnimationData {
  i: {
    x: number[];
    y: number[];
  };
  o: {
    x: number[];
    y: number[];
  };
}

export interface Animation {
  name: string[];
  startFrame: number;
  endFrame: number;
  easing: (x: number) => number;
}

export interface AnchorPointAnimation extends Animation {
  fromAnchorPoint: number[] | undefined;
  toAnchorPoint: number[] | undefined;
}

export interface PositionAnimation extends Animation {
  fromPosition: number[] | undefined;
  toPosition: number[] | undefined;
}

export interface EachPositionAnimation extends Animation {
  fromPosition: number | undefined;
  toPosition: number | undefined;
}

export interface SeparatedPositionAnimation {
  x: EachPositionAnimation[];
  y: EachPositionAnimation[];
}

export interface OpacityAnimation extends Animation {
  fromOpacity: number | undefined;
  toOpacity: number | undefined;
}

export interface RotationAnimation extends Animation {
  fromRotation: number | undefined;
  toRotation: number | undefined;
}

export interface ScaleAnimation extends Animation {
  fromScale: number[] | undefined;
  toScale: number[] | undefined;
}

export class Element extends PIXI.Graphics {
  name: string;

  referenceId: string;

  type: number | string;

  finder: ElementFinder;

  isCompleted: boolean;

  index: number;

  hasParent: boolean;

  parentIndex: number;

  inFrame: number;

  outFrame: number;

  stretch: number;

  hasMask: boolean;

  startTime: number;

  hasTrackMatteType: boolean;

  trackMatteType: number;

  isTrackMatteData: boolean;

  player: ElementPlayer;

  deltaPlayer: ElementDeltaPlayer;

  masksProperties: MaskProperty[];

  isInvertedMask: boolean;

  interactiveEventMap: { [key: string]: boolean };

  hasAnimatedAnchorPoint: boolean;

  hasAnimatedOpacity: boolean;

  hasAnimatedPosition: boolean;

  hasAnimatedSeparatedPosition: boolean;

  hasAnimatedRotation: boolean;

  hasAnimatedScale: boolean;

  animatedAnchorPoints: AnchorPointAnimation[];

  animatedOpacities: OpacityAnimation[];

  animatedPositions: PositionAnimation[] | SeparatedPositionAnimation;

  animatedRotations: RotationAnimation[];

  animatedScales: ScaleAnimation[];

  scaleX: number;

  scaleY: number;

  shapes: ShapeElement[];

  parent: Container;

  blendMode: number;

  maskLayer: MaskElement;

  [key: string]: any;

  constructor(data?: ElementData) {
    super();
    this.finder = new ElementFinder();
    if (!data) return;
    this.name = data.nm;
    this.referenceId = data.refId;
    this.type = data.ty;
    this.isCompleted = data.completed;
    this.index = data.ind;
    this.hasParent = Object.prototype.hasOwnProperty.call(data, 'parent');
    this.parentIndex = data.parent;
    this.inFrame = data.ip;
    this.outFrame = data.op;
    this.stretch = data.sr || 1;
    this.startTime = data.st;
    this.hasMask = data.hasMask;
    this.setupProperties(data.ks);
    this.blendMode = Element.toPIXIBlendMode(data.bm);
    if (data.bmPIXI) {
      this.blendMode = data.bmPIXI;
    }
    if (data.tt) {
      this.hasTrackMatteType = true;
      this.trackMatteType = data.tt;
    } else if (data.td) {
      this.isTrackMatteData = true;
    }
    this.player = new ElementPlayer(
      0,
      0,
      this.outFrame,
      (frame: number) => {
        this.updateWithFrameBySelfPlayer(frame);
      },
      () => {
        this.emit('completed', this);
      },
    );
    this.deltaPlayer = new ElementDeltaPlayer(
      0,
      0,
      this.outFrame,
      (frame: number) => {
        this.updateWithFrameBySelfPlayer(frame);
      },
      () => {
        this.emit('completed', this);
      },
    );
    if (data.masksProperties) {
      this.masksProperties = data.masksProperties;
    }
    if (data.events) {
      Object.keys(data.events).forEach((eventName) => {
        if (this.isInteractiveEvent(eventName)) this.interactive = true;
        this.on(eventName, data.events[eventName]);
      });
    }
  }

  static toPIXIBlendMode(mode: number) {
    switch (mode) {
    case 0:
      return PIXI.BLEND_MODES.NORMAL;
    case 1:
      return PIXI.BLEND_MODES.MULTIPLY;
    case 2:
      return PIXI.BLEND_MODES.SCREEN;
    case 3:
      return PIXI.BLEND_MODES.OVERLAY;
    case 4:
      return PIXI.BLEND_MODES.DARKEN;
    case 5:
      return PIXI.BLEND_MODES.LIGHTEN;
    case 6:
      return PIXI.BLEND_MODES.COLOR_DODGE;
    case 7:
      return PIXI.BLEND_MODES.COLOR_BURN;
    case 8:
      return PIXI.BLEND_MODES.HARD_LIGHT;
    case 9:
      return PIXI.BLEND_MODES.SOFT_LIGHT;
    case 10:
      return PIXI.BLEND_MODES.DIFFERENCE;
    case 11:
      return PIXI.BLEND_MODES.EXCLUSION;
    case 12:
      return PIXI.BLEND_MODES.HUE;
    case 13:
      return PIXI.BLEND_MODES.SATURATION;
    case 14:
      return PIXI.BLEND_MODES.COLOR;
    case 15:
      return PIXI.BLEND_MODES.LUMINOSITY;
    default:
      break;
    }
    return PIXI.BLEND_MODES.NORMAL;
  }

  __root(node: Container): Container | null {
    if (node instanceof AfterEffects) return node;
    if (node.parent) return this.__root(node.parent);
    return null;
  }

  root(): Container | null {
    return this.__root(this);
  }

  addChild(...children: PIXI.DisplayObject[]): PIXI.DisplayObject {
    const o = super.addChild(...children);
    if (this.isInvertedMask) {
      children.forEach((child) => {
        const container = child as Container;
        container.isInvertedMask = true;
      });
    }
    return o;
  }

  isInvertTrackMatteType() {
    return (
      this.trackMatteType === TRACK_MATTE_TYPE.ALPHA_INVERTED
      || this.trackMatteType === TRACK_MATTE_TYPE.LUMA_INVERTED
    );
  }

  set frameRate(value: number) {
    if (this.player) {
      this.player.frameRate = value;
    }
    if (this.deltaPlayer) {
      this.deltaPlayer.frameRate = value;
    }
  }

  set opt(value: any) {
    Object.keys(value).forEach((key) => {
      this[key] = value[key];
    });
  }

  isInteractiveEvent(eventName: string) {
    if (!this.interactiveEventMap) {
      const interactiveEvents = [
        'click',
        'mousedown',
        'mousemove',
        'mouseout',
        'mouseover',
        'mouseup',
        'mouseupoutside',
        'pointercancel',
        'pointerdown',
        'pointermove',
        'pointerout',
        'pointerover',
        'pointertap',
        'pointerup',
        'pointerupoutside',
        'removed',
        'rightclick',
        'rightdown',
        'rightup',
        'rightupoutside',
        'tap',
        'touchcancel',
        'touchend',
        'touchendoutside',
        'touchmove',
        'touchstart',
      ];
      this.interactiveEventMap = {};
      interactiveEvents.forEach((event) => {
        this.interactiveEventMap[event] = true;
      });
    }
    return this.interactiveEventMap[eventName];
  }

  find(name: string) {
    return this.finder.findByName(name, this);
  }

  isCompType() {
    return this.type === 0;
  }

  isImageType() {
    return this.type === 2;
  }

  setupProperties(data: TransformData) {
    if (!data) return;

    this.setupPosition(data.p);
    this.setupAnchorPoint(data.a);
    this.setupOpacity(data.o);
    this.setupRotation(data.r);
    this.setupScale(data.s);
  }

  updateAnimationFrameByBaseFrame(animBaseFrame: number) {
    if (this.hasAnimatedAnchorPoint) {
      this.animatedAnchorPoints.forEach((animData: Animation) => {
        animData.startFrame += animBaseFrame;
        animData.endFrame += animBaseFrame;
      });
    }
    if (this.hasAnimatedOpacity) {
      this.animatedOpacities.forEach((animData: Animation) => {
        animData.startFrame += animBaseFrame;
        animData.endFrame += animBaseFrame;
      });
    }
    if (this.hasAnimatedPosition) {
      (this.animatedPositions as PositionAnimation[]).forEach(
        (animData: Animation) => {
          animData.startFrame += animBaseFrame;
          animData.endFrame += animBaseFrame;
        },
      );
    }
    if (this.hasAnimatedSeparatedPosition) {
      const animation = this.animatedPositions as SeparatedPositionAnimation;
      animation.x.forEach((animData: Animation) => {
        animData.startFrame += animBaseFrame;
        animData.endFrame += animBaseFrame;
      });
      animation.y.forEach((animData: Animation) => {
        animData.startFrame += animBaseFrame;
        animData.endFrame += animBaseFrame;
      });
    }
    if (this.hasAnimatedRotation) {
      this.animatedRotations.forEach((animData: Animation) => {
        animData.startFrame += animBaseFrame;
        animData.endFrame += animBaseFrame;
      });
    }
    if (this.hasAnimatedScale) {
      this.animatedScales.forEach((animData: Animation) => {
        animData.startFrame += animBaseFrame;
        animData.endFrame += animBaseFrame;
      });
    }
  }

  setupAnchorPoint(data: AnchorPointData) {
    const anchorPoint = Element.createAnchorPoint(data);
    const animData = anchorPoint as AnchorPointAnimation[];
    if (animData.length > 0) {
      this.hasAnimatedAnchorPoint = true;
      this.animatedAnchorPoints = anchorPoint as AnchorPointAnimation[];
    } else {
      this.pivot = anchorPoint as PIXI.Point;
    }
  }

  static createAnchorPoint(data: AnchorPointData) {
    if (typeof data.k[0] === 'number') {
      const point = data.k as number[];
      return new PIXI.Point(point[0], point[1]);
    }
    return Element.createAnimatedAnchorPoint(
      data.k as AnchorPointAnimationData[],
    );
  }

  static createAnchorPointEasing(animData: AnchorPointAnimationData) {
    if (animData.i && animData.o) {
      return BezierEasing(
        animData.o.x,
        animData.o.y,
        animData.i.x,
        animData.i.y,
      );
    }
    return (x: number) => x;
  }

  static createAnimatedAnchorPoint(data: AnchorPointAnimationData[]) {
    const lastIndex = data.length - 1;
    return data.map((animData, index) => {
      const d: AnchorPointAnimation = {
        name: animData.n,
        startFrame: animData.t,
        endFrame: lastIndex > index ? data[index + 1].t : animData.t,
        easing: Element.createAnchorPointEasing(animData),
        fromAnchorPoint: animData.s,
        toAnchorPoint: animData.e,
      };
      return d;
    });
  }

  setupOpacity(data: OpacityData) {
    const opacity = Element.createOpacity(data);
    const anim = opacity as OpacityAnimation[];
    if (anim.length > 0) {
      this.hasAnimatedOpacity = true;
      this.animatedOpacities = opacity as OpacityAnimation[];
    } else {
      this.alpha = opacity as number;
    }
  }

  static createOpacity(data: OpacityData) {
    const opacity = data.k;
    if (typeof opacity === 'number') {
      return opacity / 100.0;
    }
    return Element.createAnimatedOpacity(data.k as OpacityAnimationData[]);
  }

  static createOpacityEasing(animData: OpacityAnimationData) {
    if (animData.i && animData.o) {
      return BezierEasing(
        animData.o.x[0],
        animData.o.y[0],
        animData.i.x[0],
        animData.i.y[0],
      );
    }
    return (x: number) => x;
  }

  static createAnimatedOpacity(data: OpacityAnimationData[]) {
    const lastIndex = data.length - 1;
    return data.map((animData, index) => {
      let fromOpacity;
      let toOpacity;
      if (animData.s && animData.e) {
        fromOpacity = animData.s[0];
        toOpacity = animData.e[0];
      } else if (animData.s && !animData.e) {
        fromOpacity = animData.s[0];
        toOpacity = fromOpacity;
      }
      const d: OpacityAnimation = {
        name: animData.n,
        startFrame: animData.t,
        endFrame: lastIndex > index ? data[index + 1].t : animData.t,
        easing: Element.createOpacityEasing(animData),
        fromOpacity:
          fromOpacity !== undefined ? fromOpacity / 100.0 : undefined,
        toOpacity: toOpacity !== undefined ? toOpacity / 100.0 : undefined,
      };
      return d;
    });
  }

  setupPosition(data: PositionData) {
    const pos = Element.createPosition(data);
    const spAnim = pos as SeparatedPositionAnimation;
    const posAnim = pos as PositionAnimation[];
    if (spAnim.x && spAnim.y && spAnim.x.length > 0 && spAnim.y.length > 0) {
      this.hasAnimatedSeparatedPosition = true;
      this.animatedPositions = pos as SeparatedPositionAnimation;
    } else if (posAnim.length > 0) {
      this.hasAnimatedPosition = true;
      this.animatedPositions = pos as PositionAnimation[];
    } else {
      this.position = pos as PIXI.Point;
    }
  }

  static createPosition(data: PositionData | SeparatedPositionData) {
    const posData = data as PositionData;
    if (!posData.k && data.x && data.y) {
      if (typeof data.x.k === 'number') {
        return new PIXI.Point(posData.x.k, posData.y.k);
      }
      const spData = data as SeparatedPositionData;
      const p: SeparatedPositionAnimation = {
        x: Element.createAnimatedSeparatedPosition(spData.x.k),
        y: Element.createAnimatedSeparatedPosition(spData.y.k),
      };
      return p;
    }
    const pos = posData.k;
    if (typeof pos[0] === 'number') {
      const point = posData.k as number[];
      return new PIXI.Point(point[0], point[1]);
    }
    return Element.createAnimatedPosition(posData.k as PositionAnimationData[]);
  }

  static createSeparatedPositionEasing(
    animData: SeparatedPositionAnimationData,
  ) {
    if (animData.i && animData.o) {
      return BezierEasing(
        animData.o.x[0],
        animData.o.y[0],
        animData.i.x[0],
        animData.i.y[0],
      );
    }
    return (x: number) => x;
  }

  static createAnimatedSeparatedPosition(
    data: SeparatedPositionAnimationData[],
  ) {
    const lastIndex = data.length - 1;
    return data.map((animData, index) => {
      const d: EachPositionAnimation = {
        name: animData.n,
        startFrame: animData.t,
        endFrame: lastIndex > index ? data[index + 1].t : animData.t,
        easing: Element.createSeparatedPositionEasing(animData),
        fromPosition: animData.s ? animData.s[0] : undefined,
        toPosition: animData.e ? animData.e[0] : undefined,
      };
      return d;
    });
  }

  static createPositionEasing(
    animData: PositionAnimationData | SeparatedPositionAnimationData,
  ) {
    if (!animData.i || !animData.o) {
      return (x: number) => x;
    }
    if (typeof animData.i.x === 'number') {
      animData = animData as PositionAnimationData;
      return BezierEasing(
        animData.o.x,
        animData.o.y,
        animData.i.x,
        animData.i.y,
      );
    }
    animData = animData as SeparatedPositionAnimationData;
    return BezierEasing(
      animData.o.x[0],
      animData.o.y[0],
      animData.i.x[0],
      animData.i.y[0],
    );
  }

  static createAnimatedPosition(data: PositionAnimationData[]) {
    const lastIndex = data.length - 1;
    return data.map((animData, index) => {
      let toPosition;
      if (animData.e) {
        toPosition = animData.e;
      } else if (data[index + 1] && data[index + 1].s) {
        toPosition = data[index + 1].s;
      } else {
        toPosition = animData.s;
      }

      const d: PositionAnimation = {
        name: animData.n,
        startFrame: animData.t,
        endFrame: lastIndex > index ? data[index + 1].t : animData.t,
        easing: Element.createPositionEasing(animData),
        fromPosition: animData.s,
        toPosition,
      };
      return d;
    });
  }

  setupRotation(data: RotationData) {
    if (!data) return; // not 'r' property at z rotation pattern

    const rotation = Element.createRotation(data);
    const anim = rotation as RotationAnimation[];
    if (anim.length > 0) {
      this.hasAnimatedRotation = true;
      this.animatedRotations = rotation as RotationAnimation[];
    } else {
      this.rotation = rotation as number;
    }
  }

  static createRotation(data: RotationData) {
    const rotation = data.k;
    if (typeof rotation === 'number') {
      return (Math.PI * rotation) / 180.0;
    }
    return Element.createAnimatedRotation(data.k as RotationAnimationData[]);
  }

  static createRotationEasing(animData: RotationAnimationData) {
    if (animData.i && animData.o) {
      return BezierEasing(
        animData.o.x[0],
        animData.o.y[0],
        animData.i.x[0],
        animData.i.y[0],
      );
    }
    return (x: number) => x;
  }

  static createAnimatedRotation(data: RotationAnimationData[]) {
    const lastIndex = data.length - 1;
    return data.map((animData, index) => {
      let toRotation: number | undefined;
      if (animData.e) {
        toRotation = Math.PI * animData.e[0] / 180.0;
      } else if (data[index + 1] && data[index + 1].s) {
        toRotation = data[index + 1].s[0] / 180.0;
      } else {
        toRotation = undefined;
      }

      const d: RotationAnimation = {
        name: animData.n,
        startFrame: animData.t,
        endFrame: lastIndex > index ? data[index + 1].t : animData.t,
        easing: Element.createRotationEasing(animData),
        fromRotation: animData.s
          ? (Math.PI * animData.s[0]) / 180.0
          : undefined,
        toRotation,
      };
      return d;
    });
  }

  setupScale(data: ScaleData) {
    const scale = Element.createScale(data);
    const anim = scale as ScaleAnimation[];
    if (anim.length > 0) {
      this.hasAnimatedScale = true;
      this.animatedScales = scale as ScaleAnimation[];
    } else {
      const scalePoint = scale as PIXI.Point;
      this.scaleX = scalePoint.x;
      this.scaleY = scalePoint.y;
      this.scale = scalePoint;
    }
  }

  static createScale(data: ScaleData) {
    const scale = data.k;
    if (typeof scale[0] === 'number') {
      const scaleData = scale as number[];
      const scaleX = scaleData[0] / 100.0;
      const scaleY = scaleData[1] / 100.0;
      return new PIXI.Point(scaleX, scaleY);
    }
    return Element.createAnimatedScale(data.k as ScaleAnimationData[]);
  }

  static createScaleEasing(animData: ScaleAnimationData) {
    if (animData.i && animData.o) {
      return BezierEasing(
        animData.o.x[0],
        animData.o.y[1],
        animData.i.x[0],
        animData.i.y[1],
      );
    }
    return (x: number) => x;
  }

  static createAnimatedScale(data: ScaleAnimationData[]) {
    const lastIndex = data.length - 1;
    return data.map((animData, index) => {
      let toScale = null;
      if (animData.e) {
        toScale = animData.e;
      } else if (data[index + 1] && data[index + 1].s) {
        toScale = data[index + 1].s;
      } else {
        toScale = animData.s;
      }

      const d: ScaleAnimation = {
        name: animData.n,
        startFrame: animData.t,
        endFrame: lastIndex > index ? data[index + 1].t : animData.t,
        easing: Element.createScaleEasing(animData),
        fromScale: animData.s,
        toScale,
      };
      return d;
    });
  }

  animateAnchorPoint(frame: number) {
    let isAnimated = false;
    if (frame < this.animatedAnchorPoints[0].startFrame) {
      const anchorPoint = this.animatedAnchorPoints[0].fromAnchorPoint;
      if (anchorPoint) {
        this.pivot = new PIXI.Point(anchorPoint[0], anchorPoint[1]);
      }
    }
    this.animatedAnchorPoints.some((animData: AnchorPointAnimation) => {
      if (animData.startFrame === animData.endFrame) {
        return false;
      }
      if (animData.startFrame <= frame && frame <= animData.endFrame) {
        if (animData.toAnchorPoint === undefined) return false;
        if (animData.fromAnchorPoint === undefined) return false;

        const anchorPointDiffX =          animData.toAnchorPoint[0] - animData.fromAnchorPoint[0];
        const anchorPointDiffY =          animData.toAnchorPoint[1] - animData.fromAnchorPoint[1];
        const totalFrame = animData.endFrame - animData.startFrame;
        const playFrame = (frame - animData.startFrame) * 1.0;
        const playRatio = playFrame / totalFrame;
        const posRatio = animData.easing(playRatio);
        const anchorPointX =          posRatio * anchorPointDiffX + animData.fromAnchorPoint[0];
        const anchorPointY =          posRatio * anchorPointDiffY + animData.fromAnchorPoint[1];
        this.pivot = new PIXI.Point(anchorPointX, anchorPointY);
        isAnimated = true;
        return true;
      }
      return false;
    });
    if (
      !isAnimated
      && frame
        > this.animatedAnchorPoints[this.animatedAnchorPoints.length - 1].endFrame
    ) {
      const anchorPoint = this.animatedAnchorPoints[
        this.animatedAnchorPoints.length - 2
      ].toAnchorPoint;
      if (anchorPoint) {
        this.pivot = new PIXI.Point(anchorPoint[0], anchorPoint[1]);
      }
    }
    return isAnimated;
  }

  animateOpacity(frame: number) {
    let isAnimated = false;
    if (frame < this.animatedOpacities[0].startFrame) {
      const opacity = this.animatedOpacities[0].fromOpacity;
      if (opacity !== undefined) {
        this.alpha = opacity;
      }
    }
    this.animatedOpacities.some((animData: OpacityAnimation) => {
      if (animData.startFrame === animData.endFrame) {
        return false;
      }
      if (animData.startFrame <= frame && frame <= animData.endFrame) {
        if (animData.toOpacity === undefined) return false;
        if (animData.fromOpacity === undefined) return false;

        const opacityDiff = animData.toOpacity - animData.fromOpacity;
        const totalFrame = animData.endFrame - animData.startFrame;
        const playFrame = (frame - animData.startFrame) * 1.0;
        const playRatio = playFrame / totalFrame;
        const opacityRatio = animData.easing(playRatio);
        const opacity = opacityDiff * opacityRatio + animData.fromOpacity;
        this.alpha = opacity;
        isAnimated = true;
        return true;
      }
      return false;
    });
    if (
      !isAnimated
      && frame > this.animatedOpacities[this.animatedOpacities.length - 1].endFrame
    ) {
      const opacity = this.animatedOpacities[this.animatedOpacities.length - 2]
        .toOpacity;
      if (opacity !== undefined) {
        this.alpha = opacity;
      }
    }
    return isAnimated;
  }

  animatePosition(frame: number) {
    let isAnimated = false;
    const animation = this.animatedPositions as PositionAnimation[];
    if (frame < animation[0].startFrame) {
      const position = animation[0].fromPosition;
      if (position) {
        this.position = new PIXI.Point(position[0], position[1]);
      }
    }
    animation.some((animData: PositionAnimation) => {
      if (animData.startFrame === animData.endFrame) {
        return false;
      }
      if (animData.startFrame <= frame && frame <= animData.endFrame) {
        if (animData.toPosition === undefined) return false;
        if (animData.fromPosition === undefined) return false;

        const posDiffX = animData.toPosition[0] - animData.fromPosition[0];
        const posDiffY = animData.toPosition[1] - animData.fromPosition[1];
        const totalFrame = animData.endFrame - animData.startFrame;
        const playFrame = (frame - animData.startFrame) * 1.0;
        const playRatio = playFrame / totalFrame;
        const posRatio = animData.easing(playRatio);
        const posX = posDiffX * posRatio;
        const posY = posDiffY * posRatio;
        this.x = animData.fromPosition[0] + posX;
        this.y = animData.fromPosition[1] + posY;
        isAnimated = true;
        return true;
      }
      return false;
    });
    if (!isAnimated && frame > animation[animation.length - 1].endFrame) {
      const position = animation[animation.length - 2].toPosition;
      if (position) {
        this.position = new PIXI.Point(position[0], position[1]);
      }
    }
    return isAnimated;
  }

  animateSeparatedPosition(frame: number) {
    const animation = this.animatedPositions as SeparatedPositionAnimation;
    const animatedPositionX = animation.x;
    const animatedPositionY = animation.y;
    if (frame < animatedPositionX[0].startFrame) {
      this.x = animatedPositionX[0].fromPosition || 0;
    }
    if (frame < animatedPositionY[0].startFrame) {
      this.y = animatedPositionY[0].fromPosition || 0;
    }
    animatedPositionX.some((animData: EachPositionAnimation) => {
      if (animData.startFrame === animData.endFrame) {
        return false;
      }
      if (animData.startFrame <= frame && frame <= animData.endFrame) {
        if (animData.toPosition === undefined) return false;
        if (animData.fromPosition === undefined) return false;

        const posDiff = animData.toPosition - animData.fromPosition;
        const totalFrame = animData.endFrame - animData.startFrame;
        const playFrame = (frame - animData.startFrame) * 1.0;
        const playRatio = playFrame / totalFrame;
        const posRatio = animData.easing(playRatio);
        this.x = posDiff * posRatio + animData.fromPosition;
        return true;
      }
      return false;
    });
    animatedPositionY.some((animData: EachPositionAnimation) => {
      if (animData.startFrame === animData.endFrame) {
        return false;
      }
      if (animData.startFrame <= frame && frame <= animData.endFrame) {
        if (animData.toPosition === undefined) return false;
        if (animData.fromPosition === undefined) return false;

        const posDiff = animData.toPosition - animData.fromPosition;
        const totalFrame = animData.endFrame - animData.startFrame;
        const playFrame = (frame - animData.startFrame) * 1.0;
        const playRatio = playFrame / totalFrame;
        const posRatio = animData.easing(playRatio);
        this.y = posDiff * posRatio + animData.fromPosition;
        return true;
      }
      return false;
    });
    if (frame > animatedPositionX[animatedPositionX.length - 1].endFrame) {
      const x = animatedPositionX[animatedPositionX.length - 2].toPosition;
      const y = animatedPositionY[animatedPositionY.length - 2].toPosition;
      this.position = new PIXI.Point(x, y);
    }
  }

  animateRotation(frame: number) {
    let isAnimated = false;
    if (frame < this.animatedRotations[0].startFrame) {
      const rotation = this.animatedRotations[0].fromRotation;
      if (rotation !== undefined) {
        this.rotation = rotation;
      }
    }
    this.animatedRotations.some((animData: RotationAnimation) => {
      if (animData.startFrame === animData.endFrame) {
        return false;
      }
      if (animData.startFrame <= frame && frame <= animData.endFrame) {
        if (animData.toRotation === undefined) return false;
        if (animData.fromRotation === undefined) return false;

        const rotDiff = animData.toRotation - animData.fromRotation;
        const totalFrame = animData.endFrame - animData.startFrame;
        const playFrame = (frame - animData.startFrame) * 1.0;
        const playRatio = playFrame / totalFrame;
        const rotRatio = animData.easing(playRatio);
        this.rotation = rotDiff * rotRatio + animData.fromRotation;
        isAnimated = true;
        return true;
      }
      return false;
    });
    if (
      !isAnimated
      && frame > this.animatedRotations[this.animatedRotations.length - 1].endFrame
    ) {
      const rotation = this.animatedRotations[this.animatedRotations.length - 2]
        .toRotation;
      if (rotation !== undefined) {
        this.rotation = rotation;
      }
    }
    return isAnimated;
  }

  animateScale(frame: number) {
    let isAnimated = false;
    if (frame < this.animatedScales[0].startFrame) {
      const scale = this.animatedScales[0].fromScale;
      if (scale !== undefined) {
        this.scale = new PIXI.Point(scale[0] / 100.0, scale[1] / 100.0);
      }
    }
    this.animatedScales.some((animData: ScaleAnimation) => {
      if (animData.startFrame === animData.endFrame) {
        return false;
      }
      if (animData.startFrame <= frame && frame <= animData.endFrame) {
        if (animData.toScale === undefined) return false;
        if (animData.fromScale === undefined) return false;

        const scaleDiffX = animData.toScale[0] - animData.fromScale[0];
        const scaleDiffY = animData.toScale[1] - animData.fromScale[1];
        const totalFrame = animData.endFrame - animData.startFrame;
        const playFrame = (frame - animData.startFrame) * 1.0;
        const playRatio = playFrame / totalFrame;
        const scaleRatio = animData.easing(playRatio);
        const scaleX = scaleDiffX * scaleRatio + animData.fromScale[0];
        const scaleY = scaleDiffY * scaleRatio + animData.fromScale[1];
        this.scaleX = scaleX / 100.0;
        this.scaleY = scaleY / 100.0;
        this.scale = new PIXI.Point(this.scaleX, this.scaleY);
        isAnimated = true;
        return true;
      }
      return false;
    });
    if (
      !isAnimated
      && frame > this.animatedScales[this.animatedScales.length - 1].endFrame
    ) {
      const scale = this.animatedScales[this.animatedScales.length - 2].toScale;
      if (scale !== undefined) {
        this.scale = new PIXI.Point(scale[0] / 100.0, scale[1] / 100.0);
      }
    }
    return isAnimated;
  }

  hasAnimateProperty() {
    return (
      this.hasAnimatedAnchorPoint
      || this.hasAnimatedOpacity
      || this.hasAnimatedPosition
      || this.hasAnimatedRotation
      || this.hasAnimatedScale
      || this.hasAnimatedSeparatedPosition
    );
  }

  update(nowTime: number) {
    if (!this.player) return;
    this.player.update(nowTime);
  }

  updateByDelta(deltaTime: number) {
    if (!this.deltaPlayer) return;
    this.deltaPlayer.update(deltaTime);
  }

  // called from self player
  updateWithFrameBySelfPlayer(frame: number) {
    this.__updateWithFrame(frame);
  }

  // called from parent layer. if self player is playing, stop it.
  updateWithFrame(frame: number) {
    if (this.player && this.player.isPlaying) {
      this.player.stop();
    }
    if (this.deltaPlayer && this.deltaPlayer.isPlaying) {
      this.deltaPlayer.stop();
    }
    this.__updateWithFrame(frame);
  }

  __updateWithFrame(frame: number) {
    if (this.inFrame <= frame && frame <= this.outFrame) {
      this.visible = true;
    } else {
      this.visible = false;
    }
    if (!this.visible || !this.hasAnimateProperty()) {
      return true;
    }

    if (this.hasAnimatedAnchorPoint) this.animateAnchorPoint(frame);
    if (this.hasAnimatedOpacity) this.animateOpacity(frame);
    if (this.hasAnimatedPosition) this.animatePosition(frame);
    if (this.hasAnimatedRotation) this.animateRotation(frame);
    if (this.hasAnimatedScale) this.animateScale(frame);
    if (this.hasAnimatedSeparatedPosition) this.animateSeparatedPosition(frame);
    return true;
  }

  play(isLoop: boolean) {
    if (this.player) {
      this.player.play(isLoop);
    }
    if (this.deltaPlayer) {
      this.deltaPlayer.play(isLoop);
    }
  }

  pause() {
    if (this.player) {
      this.player.pause();
    }
    if (this.deltaPlayer) {
      this.deltaPlayer.pause();
    }
  }

  resume() {
    if (this.player) {
      this.player.resume();
    }
    if (this.deltaPlayer) {
      this.deltaPlayer.resume();
    }
  }

  stop() {
    if (this.player) {
      this.player.stop();
    }
    if (this.deltaPlayer) {
      this.deltaPlayer.stop();
    }
  }
}
