import { AEDataInterceptor } from './interceptor';
import { Asset } from './asset';
import { AEData } from './AfterEffects';
/**
 * Create assets and layers, also load all images includes AfterEffects animation.
 *
 * @class AEDataLoader
 * @memberof PIXI
 * @prop {function} imagePathProxy - Callback with image path before load image. If modify image path before load image, override this member and return newly path
 * @prop {function} createImageLoader - Create PIXI.loader.Loader for loading image. If create PIXI.loader.Loader for you want, override this member and can return another loader
 */
export declare class AEDataLoader {
    imagePathProxy: (path: string) => string;
    createImageLoader: Function;
    constructor();
    /**
     * Load JSON data by url
     *
     * @memberof PIXI.AEDataLoader#
     * @param {string} - The JSON url
     * @return {Promise}
     */
    loadJSON(jsonPath: string): Promise<AEData>;
    /**
     * Load JSON data by url with PIXI.AEDataInterceptor
     *
     * @memberof PIXI.AEDataLoader#
     * @param {string} - The JSON url
     * @param {PIXI.AEDataInterceptor} - The AEDataInterceptor instance
     * @return {Promise}
     */
    loadJSONWithInterceptor(jsonPath: string, interceptor: AEDataInterceptor): Promise<AEData | null>;
    static loadLayers(data: any, interceptor: AEDataInterceptor | null): any;
    loadAssets(data: AEData, jsonPath: string, interceptor: AEDataInterceptor | null): Promise<Asset[]>;
    loadImages(imageAssets: Asset[]): Promise<unknown>;
    static resolveReference(layers: any, assets: Asset[]): void;
    load(data: AEData, jsonPath: string, interceptor: AEDataInterceptor | null): Promise<void>;
}
