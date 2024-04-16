import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export class PoseDetection {
    protected detector: any;

    async createDetector() {
        const model = poseDetection.SupportedModels.BlazePose;
        const detectorConfig = {
            runtime: 'tfjs',
            enableSmoothing: true,
            modelType: 'full',
        };
        await tf.ready();
        this.detector = await poseDetection.createDetector(model, detectorConfig);
        return this;
    }

    async estimatePoses(img: HTMLVideoElement) {
        return this.detector.estimatePoses(img);
    }
}
