import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  theme: any;
}

export default function CameraCapture({ onCapture, onClose, theme }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Cannot access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
    }
  };

  const themeColors = theme.isDayTime ? {
    bg: "bg-white",
    text: "text-gray-900",
    border: "border-gray-200",
  } : {
    bg: "bg-gray-900",
    text: "text-gray-100",
    border: "border-gray-700",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${themeColors.bg} rounded-xl shadow-xl max-w-md w-full`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${themeColors.text}`}>Take Attendance Photo</h3>
            <button
              onClick={onClose}
              className={`p-2 ${themeColors.text} hover:opacity-70`}
            >
              ✕
            </button>
          </div>

          {error ? (
            <div className="text-center p-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          ) : capturedImage ? (
            <div className="space-y-4">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={capturedImage}
                  alt="Captured"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  Retake
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Use Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                >
                  <div className="w-12 h-12 bg-red-500 rounded-full"></div>
                </button>
              </div>

              <div className="text-center">
                <p className={`text-sm ${themeColors.text} opacity-70`}>
                  Position yourself and click the red button to capture
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}