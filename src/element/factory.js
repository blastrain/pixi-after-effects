import Element from './element';
import CompElement  from './comp';
import ImageElement from './image';
import SolidElement from './solid';
import TextElement  from './text';
import ShapeContainerElement from './shape';

const ELEMENT_TYPE = {
    COMP:   0,
    SOLID:  1,
    IMAGE:  2,
    NULL:   3,
    SHAPE:  4,
    TEXT:   5,
    MOVIE:  9,
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
            elem = new SolidElement(data);
            break;
        case ELEMENT_TYPE.IMAGE:
            elem = new ImageElement(data);
            break;
        case ELEMENT_TYPE.SHAPE:
            elem = new ShapeContainerElement(data);
            break;
        case ELEMENT_TYPE.TEXT:
            elem = new TextElement(data);
            break;
        case ELEMENT_TYPE.CAMERA:
            break;
        case ELEMENT_TYPE.NULL:
            elem = new CompElement(data);
            break;
        case ELEMENT_TYPE.MOVIE:
            elem = new CompElement(data);
            break;
        default:
            console.log(data);
            break;
        }
        return elem;
    }
}
