import * as element from './element';

export default class Asset {
    constructor(data) {
        this.id     = data.id;
        this.layers = data.layers.map((layer) => {
            return element.ElementFactory.create(layer);
        }).filter((layer) => { return layer !== null });
    }
}
