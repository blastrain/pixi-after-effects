import { Element } from './element';
import { ShapeElement, Path } from './shape';
export declare class MaskElement extends ShapeElement {
    maskShapePaths: Path[];
    isMaskLayer: boolean;
    maskTargetLayer: Element;
    maskMode: number;
    screenWidth: number;
    screenHeight: number;
    constructor(maskTargetLayer: Element);
    setBlendModeByMaskMode(mode: number): void;
    static toMaskMode(mode: string): number;
    updateAnimationFrameByBaseFrame(animBaseFrame: number): void;
    drawMask(frame: number, shapePath: Path): boolean;
    setupScreenSize(): void;
    drawAllMask(frame: number): boolean;
    __updateWithFrame(frame: number): boolean;
}
