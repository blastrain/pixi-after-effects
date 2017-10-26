import Element from './element';
import CompElement  from './comp';
import ShapeContainerElement from './shape';

const ELEMENT_TYPE = {
    COMP:   0,
    SOLID:  1,
    IMAGE:  2,
    NULL:   3,
    SHAPE:  4,
    TEXT:   5,
    CAMERA: 13,
};

export default class ElementFactory {
    static create(data) {
        let elem = null;
        switch (data.ty) {
        case ELEMENT_TYPE.COMP:
            elem = new CompElement(data);
            break;
        case ELEMENT_TYPE.SOLID:
            break;
        case ELEMENT_TYPE.IMAGE:
            break;
        case ELEMENT_TYPE.SHAPE:
            elem = new ShapeContainerElement(data);
            break;
        case ELEMENT_TYPE.TEXT:
            break;
        case ELEMENT_TYPE.CAMERA:
            break;
        case ELEMENT_TYPE.NULL:
            elem = new CompElement(data);
            break;
        default:
            console.log(data);
            break;
        }
        return elem;
    }
}
