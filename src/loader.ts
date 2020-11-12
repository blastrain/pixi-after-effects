import * as PIXI from 'pixi.js';
import * as element from './element';
import { AEDataInterceptor } from './interceptor';
import { AssetData, Asset } from './asset';
import pixiVersionHelper from './versionHelper';
import { AEData } from './AfterEffects';

/**
 * Create assets and layers, also load all images includes AfterEffects animation.
 *
 * @class AEDataLoader
 * @memberof PIXI
 * @prop {function} imagePathProxy - Callback with image path before load image. If modify image path before load image, override this member and return newly path
 * @prop {function} createImageLoader - Create PIXI.loader.Loader for loading image. If create PIXI.loader.Loader for you want, override this member and can return another loader
 */
export class AEDataLoader {
  imagePathProxy: (path: string) => string;

  createImageLoader: Function;

  constructor() {
    this.imagePathProxy = path => path;
    this.createImageLoader = pixiVersionHelper.select(
      (imageAssets: Asset[]) => {
        // @ts-ignore
        return new PIXI.loaders.Loader('', imageAssets.length);
      },
      (imageAssets: Asset[]) => {
        return new PIXI.Loader('', imageAssets.length); /* for v5 API */
      },
    );
  }

  /**
   * Load JSON data by url
   *
   * @memberof PIXI.AEDataLoader#
   * @param {string} - The JSON url
   * @return {Promise}
   */
  loadJSON(jsonPath: string) {
    return new Promise((resolve: (value?: AEData) => void, reject) => {
      fetch(jsonPath)
        .then((res: Response) => {
          return res.json();
        })
        .then((json: object) => {
          if (!json) {
            return reject();
          }

          const data = json as AEData;
          return this.load(data, jsonPath, null)
            .then(() => {
              resolve(data);
            })
            .catch((e: Error) => {
              reject(e);
            });
        });
    });
  }

  /**
   * Load JSON data by url with PIXI.AEDataInterceptor
   *
   * @memberof PIXI.AEDataLoader#
   * @param {string} - The JSON url
   * @param {PIXI.AEDataInterceptor} - The AEDataInterceptor instance
   * @return {Promise}
   */
  loadJSONWithInterceptor(jsonPath: string, interceptor: AEDataInterceptor) {
    return new Promise((resolve: (value?: AEData | null) => void, reject) => {
      if (!interceptor) {
        return reject(new Error('required interceptor parameter'));
      }
      return fetch(jsonPath)
        .then((res: Response) => {
          return res.json();
        })
        .then((json: object) => {
          const data = json as AEData;
          return this.load(data, jsonPath, interceptor)
            .then(() => {
              resolve(data);
            })
            .catch((e: Error) => {
              reject(e);
            });
        });
    });
  }

  static loadLayers(data: any, interceptor: AEDataInterceptor | null) {
    return data.layers
      .map((layer: any) => {
        if (interceptor) interceptor.intercept(layer);
        return element.ElementFactory.create(layer);
      })
      .filter((layer: any) => layer !== null);
  }

  loadAssets(
    data: AEData,
    jsonPath: string,
    interceptor: AEDataInterceptor | null,
  ) {
    const baseName = jsonPath
      .split('/')
      .slice(0, -1)
      .join('/');
    const assets = data.assets.map((asset: AssetData) => {
      if (interceptor) interceptor.intercept(asset);
      return new Asset(this, asset, baseName);
    });
    const imageAssets = assets.filter((asset) => {
      return !!asset.imagePath;
    });
    if (imageAssets.length === 0) {
      return new Promise((resolve: (value?: Asset[]) => void) => resolve(assets));
    }
    return this.loadImages(imageAssets).then(() => assets);
  }

  loadImages(imageAssets: Asset[]) {
    return new Promise((resolve, reject) => {
      const loader = this.createImageLoader(imageAssets);

      // if override createImageLoader and use shared PIXI.Loaders,
      // possibly loader.resources has already loaded resource
      const requiredLoadAssets = imageAssets.filter(
        asset => !loader.resources[asset.imagePath],
      );
      if (requiredLoadAssets.length === 0) {
        imageAssets.forEach((asset) => {
          asset.texture = loader.resources[asset.imagePath].texture;
        });
        return resolve();
      }
      requiredLoadAssets.forEach((asset) => {
        loader.add(asset.imagePath, asset.imagePath);
      });
      loader.onError.add((error: Error) => {
        reject(error);
      });
      return loader.load((_: any, resources: { [k: string]: any }) => {
        imageAssets.forEach(
          asset => (asset.texture = resources[asset.imagePath].texture),
        );
        resolve();
      });
    });
  }

  static resolveReference(layers: any, assets: Asset[]) {
    const assetMap: { [key: string]: Asset } = {};
    assets.forEach((asset) => {
      assetMap[asset.id] = asset;
    });
    layers.forEach((layer: any) => {
      if (layer.isCompType()) {
        layer.setupReference(assetMap);
      } else if (layer.isImageType()) {
        layer.setupImage(assetMap);
      }
    });
  }

  load(data: AEData, jsonPath: string, interceptor: AEDataInterceptor | null) {
    return this.loadAssets(data, jsonPath, interceptor).then(
      (assets: Asset[]) => {
        const layers = AEDataLoader.loadLayers(data, interceptor);
        AEDataLoader.resolveReference(layers, assets);
        data.assets = assets;
        data.layers = layers;
      },
    );
  }
}
