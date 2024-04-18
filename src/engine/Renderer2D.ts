import * as poseDetection from '@tensorflow-models/pose-detection';
import type { Keypoint } from '@tensorflow-models/pose-detection';
import { PoseDetection } from './Pose-detection';

export type Vec2 = {
    x: number;
    y: number;
};

// export class Renderer2D {
//     protected stage;

//     protected animation;

//     protected videoLayer = new Konva.Layer();

//     protected group = new Konva.Group();

//     private keypointsMap: { [key: string]: Konva.Circle } = {};

//     constructor(params: { id: string; width: number; height: number; video: HTMLVideoElement }) {
//         this.stage = new Konva.Stage({
//             container: params.id,
//             width: params.width,
//             height: params.height,
//         });
//         const image = new Konva.Image({
//             image: params.video,
//         });
//         this.animation = new Konva.Animation(function () {}, this.videoLayer);
//         this.videoLayer.add(image);
//         this.videoLayer.add(this.group);
//         this.stage.add(this.videoLayer);
//     }

//     get stageOver() {
//         return this.stage;
//     }

//     play() {
//         this.animation.start();
//     }

//     stop() {
//         this.animation.stop();
//     }

//     updatePoses(poses: Keypoint[]) {
//         for (let index = 0; index < poses.length; index++) {
//             const pose = poses[index];
//             const name = pose.name;
//             if (!name) continue;
//             if (this.keypointsMap[name]) {
//                 this.keypointsMap[name].setAttrs({
//                     x: pose.x,
//                     y: pose.y,
//                 });
//             } else {
//                 this.keypointsMap[name] = new Konva.Circle({
//                     radius: 3,
//                     fill: '#fabed4',
//                     stroke: 'black',
//                     x: pose.x,
//                     y: pose.y,
//                 });
//                 this.group.add(this.keypointsMap[name]);
//             }
//         }
//     }
// }

export class Renderer2D {
    protected context!: CanvasRenderingContext2D;

    protected width: number;
    protected height: number;

    protected video!: HTMLVideoElement;

    private keypointsMap: { [key: string]: Path2D } = {};

    constructor(params: { ele: HTMLCanvasElement; video: HTMLVideoElement }) {
        const { ele, video } = params;
        this.width = ele.width = video.videoWidth;
        this.height = ele.height = video.videoHeight;
        ele.style.width = `${video.videoWidth}px`;
        ele.style.height = `${video.videoHeight}px`;
        const context = ele.getContext('2d');
        if (context) this.context = context;
        this.video = video;
    }

    get context2d() {
        return this.context;
    }

    draw() {
        this.context.drawImage(this.video, 0, 0, this.width, this.height);
        const keys = Object.keys(this.keypointsMap);
        this.context.fillStyle = 'Orange';
        this.context.strokeStyle = 'Black';
        for (let index = 0; index < keys.length; index++) {
            const circle = this.keypointsMap[keys[index]];
            this.context.fill(circle);
            this.context.stroke(circle);
        }
        this.keypointsMap = {};
    }

    updatePoses(poses: Keypoint[]) {
        for (let index = 0; index < poses.length; index++) {
            const pose = poses[index];
            const name = pose.name;
            if (!name || (pose.score && pose.score <= PoseDetection.threshold)) continue;
            const circle = new Path2D();
            circle.arc(pose.x, pose.y, 3, 0, 2 * Math.PI);
            this.keypointsMap[name] = circle;
        }
        poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.BlazePose).forEach(([i, j]) => {
            const kp1 = poses[i];
            const kp2 = poses[j];
            const name1 = kp1.name;
            const name2 = kp2.name;
            const score1 = kp1.score;
            const score2 = kp2.score;
            if (
                !name1 ||
                !name2 ||
                !score1 ||
                (score1 && score1 <= PoseDetection.threshold) ||
                !score2 ||
                (score2 && score2 <= PoseDetection.threshold)
            )
                return;
            const joint = new Path2D();
            joint.moveTo(kp1.x, kp1.y);
            joint.lineTo(kp2.x, kp2.y);
            this.keypointsMap[`${name1}${name2}`] = joint;
        });
    }
}
