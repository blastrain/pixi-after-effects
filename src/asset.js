import * as element from './element';

export default class Asset {
    constructor(data, jsonPath) {
        this.id = data.id;
        if (data.imagePath) {
            this.texture = new PIXI.Texture.fromImage(data.imagePath);
        } else if (data.p) {
            this.texture = new PIXI.Texture.fromImage(jsonPath + '/' + data.u + '/' + data.p);
        }
        this.layers = data.layers || [];
    }

    createLayers() {
        return this.layers.map((layer) => {
            return element.ElementFactory.create(layer);
        }).filter((layer) => { return layer !== null });
    }

    createLayerByIndex(index) {
        const foundLayers = this.layers.filter((layer) => {
            return layer.ind === index
        });
        if (foundLayers.length === 0) return null;

        return element.ElementFactory.create(foundLayers[0]);
    }
}
