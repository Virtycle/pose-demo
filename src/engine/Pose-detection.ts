import * as poseDetection from '@tensorflow-models/pose-detection';
import type { Pose, PoseDetectorInput } from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export class PoseDetection {
    protected detector: any;

    public static threshold = 0.85;

    async createDetector() {
        const model = poseDetection.SupportedModels.BlazePose;
        const detectorConfig = {
            runtime: 'tfjs',
            enableSmoothing: true,
            modelType: 'lite',
        };
        await tf.ready();
        this.detector = await poseDetection.createDetector(model, detectorConfig);
        return this;
    }

    async estimatePoses(img: PoseDetectorInput): Promise<Pose[]> {
        return this.detector.estimatePoses(img, { flipHorizontal: false });
    }
}
