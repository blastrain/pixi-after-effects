import * as element from './element';
import Asset from './asset';

const request = require('superagent');

export default class AEDataLoader {
    static loadJSON(jsonPath) {
        return new Promise((resolve, reject) => {
            request.get(jsonPath).end((err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(AEDataLoader.load(res.body, jsonPath));
            });
        });
    }

    static loadLayers(data) {
        return data.layers.map((layer) => {
            return element.ElementFactory.create(layer);
        }).filter((layer) => { return layer !== null });
    }

    static loadAssets(data, jsonPath) {
        const baseName = jsonPath.split('/').slice(0, -1).join('/');        
        return data.assets.map((asset) => {
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

    static load(data, jsonPath) {
        const assets = AEDataLoader.loadAssets(data, jsonPath);
        let layers   = AEDataLoader.loadLayers(data);
        AEDataLoader.resolveReference(layers, assets);
        data.assets  = assets;
        data.layers  = layers;
        return data;
    }
}
