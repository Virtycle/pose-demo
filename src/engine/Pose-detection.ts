import * as posedetection from '@tensorflow-models/pose-detection';

export class PoseDetection {
    // async function createDetector() {
    //     switch (STATE.model) {
    //       case posedetection.SupportedModels.PoseNet:
    //         return posedetection.createDetector(STATE.model, {
    //           quantBytes: 4,
    //           architecture: 'MobileNetV1',
    //           outputStride: 16,
    //           inputResolution: {width: 500, height: 500},
    //           multiplier: 0.75
    //         });
    //       case posedetection.SupportedModels.BlazePose:
    //         const runtime = STATE.backend.split('-')[0];
    //         if (runtime === 'mediapipe') {
    //           return posedetection.createDetector(STATE.model, {
    //             runtime,
    //             modelType: STATE.modelConfig.type,
    //             solutionPath:
    //                 `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${mpPose.VERSION}`
    //           });
    //         } else if (runtime === 'tfjs') {
    //           return posedetection.createDetector(
    //               STATE.model, {runtime, modelType: STATE.modelConfig.type});
    //         }
    //       case posedetection.SupportedModels.MoveNet:
    //         let modelType;
    //         if (STATE.modelConfig.type == 'lightning') {
    //           modelType = posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING;
    //         } else if (STATE.modelConfig.type == 'thunder') {
    //           modelType = posedetection.movenet.modelType.SINGLEPOSE_THUNDER;
    //         } else if (STATE.modelConfig.type == 'multipose') {
    //           modelType = posedetection.movenet.modelType.MULTIPOSE_LIGHTNING;
    //         }
    //         const modelConfig = {modelType};
    //         if (STATE.modelConfig.customModel !== '') {
    //           modelConfig.modelUrl = STATE.modelConfig.customModel;
    //         }
    //         if (STATE.modelConfig.type === 'multipose') {
    //           modelConfig.enableTracking = STATE.modelConfig.enableTracking;
    //         }
    //         return posedetection.createDetector(STATE.model, modelConfig);
    //     }
    //   }
}
