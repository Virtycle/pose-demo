import { useRef, useEffect } from 'react';
import { Camera, Renderer2D, PoseDetection, Renderer3D } from '@/engine';
import './App.css';

function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvas2dRef = useRef<HTMLCanvasElement>(null);
    const canvas3dRef = useRef<HTMLDivElement>(null);
    const cameraRef = useRef<Camera | null>(null);
    const detectionRef = useRef<PoseDetection | null>(null);
    const render2dRef = useRef<Renderer2D | null>(null);
    const rfIdRef = useRef<number>(0);
    const isFirst = useRef(true);
    useEffect(() => {
        if (videoRef.current && canvas2dRef.current && canvas3dRef.current && isFirst.current) {
            isFirst.current = false;
            const render3d = new Renderer3D({ div: canvas3dRef.current });
            render3d.loadModel();
            Camera.setup(videoRef.current, { targetFPS: 30 }).then(async (camera) => {
                if (camera.videoElement) {
                    render2dRef.current = new Renderer2D({
                        ele: canvas2dRef.current as HTMLCanvasElement,
                        video: camera.videoElement,
                    });
                    detectionRef.current = await new PoseDetection().createDetector();
                    cameraRef.current = camera;
                    async function play() {
                        const detector = detectionRef.current;
                        const render2d = render2dRef.current;
                        const poses = await detector!.estimatePoses(canvas2dRef.current as HTMLCanvasElement);
                        if (poses.length) {
                            const poseTrust = poses[0].keypoints;
                            const poseTrust3d = poses[0].keypoints3D;
                            render2d!.updatePoses(poseTrust);
                            render3d!.updatePoses(poseTrust3d);
                        }
                        render2dRef.current!.draw();
                        render3d.render();
                        rfIdRef.current = requestAnimationFrame(play);
                    }
                    play();
                }
            });
        }
    }, []);
    return (
        <div className="wrapper">
            <div className="left">
                <video id="camera" src="" ref={videoRef}></video>
                <canvas id="show-2d" ref={canvas2dRef}></canvas>
            </div>
            <div className="right">
                <div id="show-3d" ref={canvas3dRef}></div>
            </div>
        </div>
    );
}

export default App;
