export default class ElementDeltaPlayer {
    frameRate: number;
    inFrame: number;
    outFrame: number;
    isLoop: boolean;
    isCompleted: boolean;
    updater: ((value: number) => void);
    completed: () => void;
    isPlaying: boolean;
    firstTime: (number | null);
    nowTime: number;
    elapsedTime: number;
    constructor(frameRate: number, inFrame: number, outFrame: number, updater: ((value: number) => void), completed: () => void);
    showFirstFrame(): void;
    update(deltaTime: number): void;
    play(isLoop: boolean): void;
    pause(): void;
    resume(): void;
    stop(): void;
}
