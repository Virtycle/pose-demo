import posenet, { PoseNet } from '@tensorflow-models/posenet';

export default class PoseNetPro {
    protected net!: PoseNet;

    async init() {
        this.net = await posenet.load();
    }

    async estimatePoseOnImage(image: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) {
        const pose = await this.net.estimateSinglePose(image, {
            flipHorizontal: false,
        });
        return pose;
    }
}
