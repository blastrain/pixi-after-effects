import * as PIXI from 'pixi.js';
import BezierEasing from 'bezier-easing';
import { Element, ElementData, TransformData, Animation, OpacityAnimation, PositionAnimation, SeparatedPositionAnimation, TransformAnimationData, PositionData, OpacityData } from './element';
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
export declare class ShapeElement extends Element {
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
    constructor(data: ElementData | null, inFrame: number, outFrame: number, startTime: number);
    setupShapeByType(data: ElementData | PathData | StrokeData | TrimData | RectData | EllipseData | FillData | TransformData): void;
    setupShapeIteration(data: TransformData[]): void;
    setupPath(data: PathData): void;
    setupStroke(data: StrokeData): void;
    setupTrim(data: TrimData): void;
    static createTrim(data: number): number | TrimAnimation[];
    static createTrimEasing(animData: TrimAnimationData): BezierEasing.EasingFunction;
    static createTrimAnimation(data: TrimAnimationData[]): TrimAnimation[];
    setupRect(data: RectData): void;
    setupEllipse(data: EllipseData): void;
    static createSize(data: PositionData): PIXI.Point | PositionAnimation[] | SeparatedPositionAnimation;
    static createColor(data: ColorData): string | ColorAnimation[];
    static createColorEasing(animData: ColorAnimationData): BezierEasing.EasingFunction;
    static createAnimatedColor(data: ColorAnimationData[]): ColorAnimation[];
    static createPathEasing(animData: PathAnimationData): BezierEasing.EasingFunction;
    createPathByAnimation(data: PathAnimationData[]): Path;
    createPath(pathData: PathParamData | PathAnimationData[]): Path;
    setupFill(data: FillData): void;
    static rgbArrayToHex(arr: number[]): string;
    static rgbToHex(r: number, g: number, b: number): string;
    static toHex(c: number): string;
    updateAnimationFrameByBaseFrame(animBaseFrame: number): void;
    drawPathForMask(shapePath: Path): void;
    beforeDraw(): void;
    afterDraw(): void;
    drawPath(shapePath: Path): void;
    static createAnimatePos(animData: Animation, frame: number, fromPos: PIXI.Point, toPos: PIXI.Point): PIXI.Point;
    static createAnimatePath(animData: PathAnimation, frame: number): {
        moveTo: PIXI.Point;
        bezierCurveToPaths: {
            cp: PIXI.Point;
            cp2: PIXI.Point;
            to: PIXI.Point;
        }[];
    };
    setupStrokeColor(frame: number): void;
    setupFillColor(frame: number): void;
    static createShapePosition(frame: number, shape: Rect | Ellipse): PIXI.Point | null;
    static createShapeSize(frame: number, shape: Rect | Ellipse): PIXI.Point | null;
    drawEllipseAnimation(frame: number, ellipse: Ellipse): void;
    drawRectAnimation(frame: number, rect: Rect): void;
    drawTrim(frame: number): void;
    drawShapePath(frame: number, shapePath: ShapePath, index: number): void;
    drawShapePaths(frame: number): void;
    drawThis(frame: number): void;
    __updateWithFrame(frame: number): boolean;
}
export default class ShapeContainerElement extends Element {
    shapes: ShapeElement[];
    bounds: Bounds;
    noreplay: boolean;
    constructor(data: ElementData);
    destroy(opt: any): void;
    frameRate: number;
    opt: any;
    updateAnimationFrameByBaseFrame(animBaseFrame: number): void;
    setupBounds(data: BoundsData): void;
    __updateWithFrame(frame: number): boolean;
}
