import * as PIXI from 'pixi.js';
import BezierEasing from 'bezier-easing';
import ElementFinder from './finder';
import ElementPlayer from './player';
import ElementDeltaPlayer from './delta_player';
import { ShapeElement, PathParamData } from './shape';
import { MaskElement } from './mask';
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
export declare class Element extends PIXI.Graphics {
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
    interactiveEventMap: {
        [key: string]: boolean;
    };
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
    constructor(data?: ElementData);
    static toPIXIBlendMode(mode: number): PIXI.BLEND_MODES;
    __root(node: Container): Container | null;
    root(): Container | null;
    addChild(...children: PIXI.DisplayObject[]): PIXI.DisplayObject;
    isInvertTrackMatteType(): boolean;
    frameRate: number;
    opt: any;
    isInteractiveEvent(eventName: string): boolean;
    find(name: string): PIXI.DisplayObject[];
    isCompType(): boolean;
    isImageType(): boolean;
    setupProperties(data: TransformData): void;
    updateAnimationFrameByBaseFrame(animBaseFrame: number): void;
    setupAnchorPoint(data: AnchorPointData): void;
    static createAnchorPoint(data: AnchorPointData): PIXI.Point | AnchorPointAnimation[];
    static createAnchorPointEasing(animData: AnchorPointAnimationData): BezierEasing.EasingFunction;
    static createAnimatedAnchorPoint(data: AnchorPointAnimationData[]): AnchorPointAnimation[];
    setupOpacity(data: OpacityData): void;
    static createOpacity(data: OpacityData): number | OpacityAnimation[];
    static createOpacityEasing(animData: OpacityAnimationData): BezierEasing.EasingFunction;
    static createAnimatedOpacity(data: OpacityAnimationData[]): OpacityAnimation[];
    setupPosition(data: PositionData): void;
    static createPosition(data: PositionData | SeparatedPositionData): PIXI.Point | PositionAnimation[] | SeparatedPositionAnimation;
    static createSeparatedPositionEasing(animData: SeparatedPositionAnimationData): BezierEasing.EasingFunction;
    static createAnimatedSeparatedPosition(data: SeparatedPositionAnimationData[]): EachPositionAnimation[];
    static createPositionEasing(animData: PositionAnimationData | SeparatedPositionAnimationData): BezierEasing.EasingFunction;
    static createAnimatedPosition(data: PositionAnimationData[]): PositionAnimation[];
    setupRotation(data: RotationData): void;
    static createRotation(data: RotationData): number | RotationAnimation[];
    static createRotationEasing(animData: RotationAnimationData): BezierEasing.EasingFunction;
    static createAnimatedRotation(data: RotationAnimationData[]): RotationAnimation[];
    setupScale(data: ScaleData): void;
    static createScale(data: ScaleData): PIXI.Point | ScaleAnimation[];
    static createScaleEasing(animData: ScaleAnimationData): BezierEasing.EasingFunction;
    static createAnimatedScale(data: ScaleAnimationData[]): ScaleAnimation[];
    animateAnchorPoint(frame: number): boolean;
    animateOpacity(frame: number): boolean;
    animatePosition(frame: number): boolean;
    animateSeparatedPosition(frame: number): void;
    animateRotation(frame: number): boolean;
    animateScale(frame: number): boolean;
    hasAnimateProperty(): boolean;
    update(nowTime: number): void;
    updateByDelta(deltaTime: number): void;
    updateWithFrameBySelfPlayer(frame: number): void;
    updateWithFrame(frame: number): void;
    __updateWithFrame(frame: number): boolean;
    play(isLoop: boolean): void;
    pause(): void;
    resume(): void;
    stop(): void;
}
