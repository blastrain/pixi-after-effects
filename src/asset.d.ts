import * as element from "./element";
export interface AssetData {
    id: string;
    layers: any;
    isDisused: boolean;
    texture: any;
    imagePath: string;
    p: string;
    u: string;
    bmPIXI: PIXI.BLEND_MODES;
}
/**
 * @class Asset
 */
export declare class Asset {
    id: string;
    layers: element.ElementData[];
    texture: any;
    imagePath: string;
    blendMode: number;
    constructor(loader: any, data: AssetData, jsonPath: string);
    /**
     * Create All Elements
     *
     * @memberof Asset#
     * @return {Array} - The Element collection
     */
    createLayers(): element.Element[];
    /**
     * Create Element collection
     *
     * @memberof Asset#
     * @param {number}   - The index of layer
     * @return {Element} - The newly Element instance
     */
    createLayerByIndex(index: number): element.Element | null;
}
