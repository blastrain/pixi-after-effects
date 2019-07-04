declare const pixiVersionHelper: {
    version: string;
    semanticVersion(): {
        major: number;
        minor: number;
        patch: number;
    };
    major(): number;
    minor(): number;
    patch(): number;
    isV4(): boolean;
    isV5(): boolean;
    select(v4func: Function, v5func: Function): Function;
};
export default pixiVersionHelper;
