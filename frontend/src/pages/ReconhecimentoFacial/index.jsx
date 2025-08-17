import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

function FaceID() {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);
  const [detectionError, setDetectionError] = useState(null);
  const canvasRef = useRef(null);

  // Inicia câmera
  useEffect(() => {
    startVideo();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: "user" // Garante que use a câmera frontal
        } 
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log("📷 Câmera iniciada - Resolução:", 
              videoRef.current.videoWidth, "x", videoRef.current.videoHeight);
          };
        }
      })
      .catch((err) => {
        console.error("❌ Erro ao acessar câmera:", err);
        setDetectionError("Erro ao acessar a câmera: " + err.message);
      });
  };

  // Carrega modelos
  // Carrega modelos
useEffect(() => {
  const loadModels = async () => {
    // Corrigido: Removido process.env.PUBLIC_URL
    const MODEL_URL = "/models/";
    console.log("Carregando modelos de:", MODEL_URL);
    
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + '/'),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      console.log("✅ Modelos carregados com sucesso");
    } catch (err) {
      console.error("❌ Erro ao carregar modelos:", err);
      setDetectionError("Erro ao carregar modelos de reconhecimento");
    }
  };
  
  loadModels();
}, []);

  // Loop de detecção
  useEffect(() => {
    if (!modelsLoaded) return;

    const detectFaces = async () => {
      try {
        if (!videoRef.current || videoRef.current.readyState !== 4) return;

        const options = new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.5 // Reduzido para melhor detecção
        });

        const detection = await faceapi.detectSingleFace(videoRef.current, options)
          .withFaceLandmarks()
          .withFaceDescriptor();

        const canvas = canvasRef.current;
        const displaySize = { 
          width: videoRef.current.videoWidth, 
          height: videoRef.current.videoHeight 
        };
        
        faceapi.matchDimensions(canvas, displaySize);
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          const resized = faceapi.resizeResults(detection, displaySize);
          faceapi.draw.drawDetections(canvas, [resized.detection]);
          faceapi.draw.drawFaceLandmarks(canvas, resized);


          if (isFaceVisible(detection)) {
            const now = Date.now();
            if (now - lastSentTime > 5000) {
              sendFaceToBackend();
              setLastSentTime(now);
            }
          }
        } else {
          setDetectionError("Nenhum rosto detectado");
        }
      } catch (err) {
        console.error("Erro durante detecção:", err);
        setDetectionError("Erro durante detecção: " + err.message);
      }
    };

    const interval = setInterval(detectFaces, 300);
    return () => clearInterval(interval);
  }, [modelsLoaded, lastSentTime]);

  const isFaceVisible = (detection) => {
  const box = detection.detection.box; // ✅ aqui
  const minSize = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight) * 0.2;
  return box.width > minSize && box.height > minSize;
};


  const sendFaceToBackend = async () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      console.log("📤 Capturou imagem para envio");
      // Restante do código de envio...
    } catch (err) {
      console.error("Erro ao capturar imagem:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Reconhecimento Facial</h1>
      {detectionError && (
        <div className="text-red-500 mb-4">{detectionError}</div>
      )}
      <div style={{ position: "relative" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width="640"
          height="480"
          style={{ borderRadius: "10px" }}
        />
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      </div>
      <div className="mt-4">
        Status: {modelsLoaded ? "Modelos carregados" : "Carregando modelos..."}
      </div>
    </div>
  );
}

export default FaceID;