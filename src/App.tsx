import { useState, useRef, useEffect } from 'react';
import { Camera } from '@/engine';
import './App.css';

function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvas2dRef = useRef<HTMLCanvasElement>(null);
    const canvas3dRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (videoRef.current) Camera.setup(videoRef.current, { targetFPS: 30 }).then((camera) => {});
    }, []);
    return (
        <div className="wrapper">
            <div className="left">
                <video id="camera" style={{ width: '800px', height: '600px' }} src="" ref={videoRef}></video>
                <canvas id="show-2d" style={{ width: '800px', height: '600px' }} ref={canvas2dRef}></canvas>
            </div>
        </div>
    );
}

export default App;
