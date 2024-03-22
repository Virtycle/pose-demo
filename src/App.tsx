import { useState, useRef, useEffect } from 'react';
import { Camera } from '@/engine';
import './App.css';

function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (videoRef.current) Camera.setup(videoRef.current, { targetFPS: 30 });
    }, []);
    return (
        <div className="wrapper">
            <video style={{ width: '800px', height: '600px' }} src="" ref={videoRef}></video>
        </div>
    );
}

export default App;
