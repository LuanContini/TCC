import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import api from "../../services/api"; // Ajuste o caminho conforme necessário

function FaceID() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);
  const [detectionError, setDetectionError] = useState(null);
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Aguardando detecção...");

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
          facingMode: "user"
        } 
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            console.log("Câmera iniciada");
          };
        }
      })
      .catch((err) => {
        console.error("Erro ao acessar câmera:", err);
        setDetectionError("Erro ao acessar a câmera: " + err.message);
      });
  };

  // Carrega modelos
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models/";
      console.log("Carregando modelos de:", MODEL_URL);
      
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + '/'),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log("Modelos carregados com sucesso");
        setStatus("Modelos carregados - Aguardando rosto...");
      } catch (err) {
        console.error("Erro ao carregar modelos:", err);
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
          scoreThreshold: 0.5
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

          setStatus("Rosto detectado - Analisando...");

          if (isFaceVisible(detection)) {
            const now = Date.now();
            if (now - lastSentTime > 3000) { // Reduzido para 3 segundos
              sendFaceToBackend();
              setLastSentTime(now);
            }
          }
        } else {
          setStatus("Nenhum rosto detectado");
          setDetectionError(null);
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
    const box = detection.detection.box;
    const minSize = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight) * 0.2;
    return box.width > minSize && box.height > minSize;
  };

  const sendFaceToBackend = async () => {
    try {
      setLoading(true);
      setStatus("Enviando imagem para reconhecimento...");

      // Capturar frame do vídeo
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(async (blob) => {
        try {
          const formData = new FormData();
          formData.append("foto", blob, "face_capture.jpg");

          const response = await api.post("/pacientes/encontrar", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.data.status === "success") {
            setPacienteEncontrado(response.data.paciente);
            setStatus("Paciente identificado com sucesso!");
            setDetectionError(null);
            
            if (videoRef.current && videoRef.current.srcObject) {
              videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
          } else {
            setStatus("Paciente não encontrado");
            setPacienteEncontrado(null);
          }
        } catch (error) {
          console.error("Erro ao enviar para backend:", error);
          setStatus("Erro no reconhecimento");
          if (error.response?.data?.erro) {
            setDetectionError(error.response.data.erro);
          } else {
            setDetectionError("Erro de comunicação com o servidor");
          }
        } finally {
          setLoading(false);
        }
      }, "image/jpeg", 0.8);
      
    } catch (err) {
      console.error("Erro ao capturar imagem:", err);
      setLoading(false);
      setStatus("Erro ao processar imagem");
    }
  };

  const reiniciarReconhecimento = () => {
    setPacienteEncontrado(null);
    setDetectionError(null);
    setStatus("Reiniciando...");
    startVideo();
    setTimeout(() => setStatus("Aguardando detecção..."), 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Reconhecimento Facial</h1>
      
      {detectionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {detectionError}
        </div>
      )}

      {pacienteEncontrado ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-green-600">Paciente Identificado</h2>
          <div className="space-y-2">
            <p><strong>Nome:</strong> {pacienteEncontrado.nomeComp}</p>
            <p><strong>CPF:</strong> {pacienteEncontrado.cpf}</p>
            <p><strong>Telefone:</strong> {pacienteEncontrado.telefone}</p>
            <p><strong>Email:</strong> {pacienteEncontrado.email}</p>
            <p><strong>Status:</strong> {pacienteEncontrado.status === 'A' ? 'Ativo' : 'Inativo'}</p>
          </div>
          <button
            onClick={reiniciarReconhecimento}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Nova Busca
          </button>
        </div>
      ) : (
        <>
          <div style={{ position: "relative" }} className="mb-4">
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
          
          <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
            <div className="text-center mb-4">
              <div className={`font-semibold ${
                status.includes("Erro") ? "text-red-600" : 
                status.includes("sucesso") ? "text-green-600" : 
                "text-blue-600"
              }`}>
                {status}
              </div>
              {loading && (
                <div className="mt-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              <p>• Posicione seu rosto no centro da imagem</p>
              <p>• Certifique-se de que há boa iluminação</p>
              <p>• Mantenha o rosto visível e sem obstruções</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FaceID;