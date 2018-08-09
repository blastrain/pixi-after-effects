import * as PIXI from 'pixi.js';
import request from 'superagent';
import * as element from './element';
import Asset from './asset';

/**
 * Create assets and layers, also load all images includes AfterEffects animation.
 *
 * @class AEDataLoader
 * @memberof PIXI
 * @prop {function} imagePathProxy - Callback with image path before load image. If modify image path before load image, override this member and return newly path
 * @prop {function} createImageLoader - Create PIXI.loader.Loader for loading image. If create PIXI.loader.Loader for you want, override this member and can return another loader
 */
export default class AEDataLoader {
  constructor() {
    this.imagePathProxy = path => path;
    this.createImageLoader = imageAssets => new PIXI.loaders.Loader('', imageAssets.length);
  }

  /**
   * Load JSON data by url
   *
   * @memberof PIXI.AEDataLoader#
   * @param {string} - The JSON url
   * @return {Promise}
   */
  loadJSON(jsonPath) {
    return new Promise((resolve, reject) => {
      request.get(jsonPath).end((err, res) => {
        if (err) return reject(err);
        return this.load(res.body, jsonPath, null).then(() => {
          resolve(res.body);
        }).catch((e) => {
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
  loadJSONWithInterceptor(jsonPath, interceptor) {
    return new Promise((resolve, reject) => {
      if (!interceptor) {
        return reject(new Error('required interceptor parameter'));
      }
      return request.get(jsonPath).end((err, res) => {
        if (err) return reject(err);
        const data = res.body;
        return this.load(data, jsonPath, interceptor).then(() => {
          resolve(data);
        }).catch((e) => {
          reject(e);
        });
      });
    });
  }

  static loadLayers(data, interceptor) {
    return data.layers.map((layer) => {
      if (interceptor) interceptor.intercept(layer);
      return element.ElementFactory.create(layer);
    }).filter(layer => layer !== null);
  }

  loadAssets(data, jsonPath, interceptor) {
    const baseName = jsonPath.split('/').slice(0, -1).join('/');
    const assets = data.assets.map((asset) => {
      if (interceptor) interceptor.intercept(asset);
      return new Asset(this, asset, baseName);
    });
    const imageAssets = assets.filter((asset) => {
      return !!asset.imagePath;
    });
    if (imageAssets.length === 0) {
      return new Promise(resolve => resolve(assets));
    }
    return this.loadImages(imageAssets).then(() => assets);
  }

  loadImages(imageAssets) {
    return new Promise((resolve, reject) => {
      const loader = this.createImageLoader(imageAssets);

      // if override createImageLoader and use shared PIXI.Loaders,
      // possibly loader.resources has already loaded resource
      const requiredLoadAssets = imageAssets.filter(asset => !loader.resources[asset.imagePath]);
      if (requiredLoadAssets.length === 0) {
        imageAssets.forEach((asset) => {
          asset.texture = loader.resources[asset.imagePath].texture;
        });
        return resolve();
      }
      requiredLoadAssets.forEach((asset) => {
        loader.add(asset.imagePath, asset.imagePath);
      });
      loader.onError.add((error, _, resource) => {
        reject(error, resource);
      });
      return loader.load((_, resources) => {
        imageAssets.forEach(asset => asset.texture = resources[asset.imagePath].texture);
        resolve();
      });
    });
  }

  static resolveReference(layers, assets) {
    const assetMap = {};
    assets.forEach((asset) => {
      assetMap[asset.id] = asset;
    });
    layers.forEach((layer) => {
      if (layer.isCompType()) {
        layer.setupReference(assetMap);
      } else if (layer.isImageType()) {
        layer.setupImage(assetMap);
      }
    });
  }

  load(data, jsonPath, interceptor) {
    return this.loadAssets(data, jsonPath, interceptor)
      .then((assets) => {
        const layers = AEDataLoader.loadLayers(data, interceptor);
        AEDataLoader.resolveReference(layers, assets);
        data.assets  = assets;
        data.layers  = layers;
      });
  }
}
