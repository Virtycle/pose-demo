import Konva from 'konva';
export class Renderer2D {
    protected stage;

    protected animation;

    protected videoLayer = new Konva.Layer();

    protected group = new Konva.Group();

    constructor(params: { id: string; width: number; height: number; video: HTMLVideoElement }) {
        this.stage = new Konva.Stage({
            container: params.id,
            width: params.width,
            height: params.height,
        });
        const image = new Konva.Image({
            image: params.video,
        });
        this.animation = new Konva.Animation(function () {}, this.videoLayer);
        this.videoLayer.add(image);
        this.videoLayer.add(this.group);
        this.stage.add(this.videoLayer);
    }

    play() {
        this.animation.start();
    }

    stop() {
        this.animation.stop();
    }
}
