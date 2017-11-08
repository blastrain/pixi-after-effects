import * as element from './element';
import Asset from './asset';

const request = require('superagent');

export default class AEDataLoader {
    static loadJSON(jsonPath) {
        return new Promise((resolve, reject) => {
            request.get(jsonPath).end((err, res) => {
                if (err) return reject(err);
                resolve(AEDataLoader.load(res.body, jsonPath, null));
            });
        });
    }

    static loadJSONWithInterceptor(jsonPath, interceptor) {
        return new Promise((resolve, reject) => {
            if (!interceptor) {
                return reject(new Error("required interceptor parameter"));
            }
            request.get(jsonPath).end((err, res) => {
                if (err) return reject(err);
                const data = res.body;
                resolve(AEDataLoader.load(data, jsonPath, interceptor));
            });
        });
    }

    static loadLayers(data, interceptor) {
        return data.layers.map((layer) => {
            if (interceptor) interceptor.intercept(layer);
            return element.ElementFactory.create(layer);
        }).filter((layer) => { return layer !== null });
    }

    static loadAssets(data, jsonPath, interceptor) {
        const baseName = jsonPath.split('/').slice(0, -1).join('/');
        return data.assets.map((asset) => {
            if (interceptor) interceptor.intercept(asset);
            return new Asset(asset, baseName);
        });
    }

    static resolveReference(layers, assets) {
        let layerIndexMap = {};
        layers.forEach((layer) => {
            layerIndexMap[layer.index] = layer;
        });
        layers.forEach((layer) => {
            if (layer.isCompType()) {
                layer.setupReference(assets);
            } else if (layer.isImageType()) {
                layer.setupImage(assets);
            }
        });
    }

    static load(data, jsonPath, interceptor) {
        const assets = AEDataLoader.loadAssets(data, jsonPath, interceptor);
        const layers = AEDataLoader.loadLayers(data, interceptor);
        AEDataLoader.resolveReference(layers, assets);
        data.assets  = assets;
        data.layers  = layers;
        return data;
    }
}
