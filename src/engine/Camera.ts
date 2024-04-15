// https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/demos/live_video/src/camera.js
export class Camera {
    width: number;
    height: number;

    private streamFlag = false;

    constructor(protected videoEle: HTMLVideoElement) {
        this.width = videoEle.clientWidth;
        this.height = videoEle.clientHeight;
    }

    setCameraStream(stream: MediaStream): Promise<HTMLVideoElement> {
        this.videoEle.srcObject = stream;
        return new Promise((resolve) => {
            this.videoEle.onloadedmetadata = () => {
                const videoWidth = this.videoEle.videoWidth;
                const videoHeight = this.videoEle.videoHeight;
                this.width = this.videoEle.width = videoWidth;
                this.height = this.videoEle.height = videoHeight;
                this.videoEle.play();
                this.streamFlag = true;
                resolve(this.videoEle);
            };
        });
    }

    get videoElement() {
        return this.streamFlag ? this.videoEle : null;
    }

    static async setup(videoEle: HTMLVideoElement, cameraParam: { targetFPS: number }): Promise<Camera> {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
        }
        const camera = new Camera(videoEle);
        const { targetFPS } = cameraParam;
        const videoConfig = {
            audio: false,
            video: {
                facingMode: 'user',
                width: camera.width,
                height: camera.height,
                frameRate: {
                    ideal: targetFPS,
                },
            },
        };

        const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

        await camera.setCameraStream(stream);

        return camera;
    }
}
