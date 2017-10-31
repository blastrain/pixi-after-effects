import * as element from './element';

export default class Asset {
    constructor(data, jsonPath) {
        this.id = data.id;
        if (data.p) {
            this.texture = new PIXI.Texture.fromImage(jsonPath + '/' + data.u + '/' + data.p);
        }
        if (!data.layers) return;
        this.layers = data.layers.map((layer) => {
            return element.ElementFactory.create(layer);
        }).filter((layer) => { return layer !== null });
    }
}
