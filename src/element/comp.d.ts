import { Asset } from '../asset';
import { Element, ElementData } from './element';
import { MaskElement } from './mask';
export default class CompElement extends Element {
    originWidth: number;
    originHeight: number;
    clonedLayers: Element[];
    autoOriented: number;
    masks: {
        maskLayer: Element;
        maskTargetLayer: Element;
    }[];
    layers: Element[];
    noreplay: boolean;
    scaleX: number;
    scaleY: number;
    startTime: number;
    referenceId: string;
    constructor(data: ElementData);
    allLayers(): Element[];
    frameRate: number;
    opt: any;
    addMaskLayer(layer: Element): void;
    setupTrackMatteLayer(layer: Element, trackMatteLayer: MaskElement): void;
    setupReference(assetMap: {
        [key: string]: Asset;
    }): void;
    createParentLayer(layer: Element, asset: Asset): Element | null;
    resolveLayerReference(layers: Element[], assetMap: {
        [key: string]: Asset;
    }, asset: Asset): void;
    updateMask(frame: number): void;
    updateNotLayers(frame: number): void;
    updateLayers(frame: number): void;
    updateClonedLayers(frame: number): void;
    __updateWithFrame(frame: number): boolean;
}
