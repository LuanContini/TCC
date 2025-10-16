import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import api from "../../services/api";

function FaceID() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);
  const [detectionError, setDetectionError] = useState(null);
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Aguardando detecção...");
  const [tentativas, setTentativas] = useState(0);
  const [ultimoErro, setUltimoErro] = useState(null);

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
            if (now - lastSentTime > 3000 && !loading) {
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
  }, [modelsLoaded, lastSentTime, loading]);

  const isFaceVisible = (detection) => {
    const box = detection.detection.box;
    const minSize = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight) * 0.2;
    return box.width > minSize && box.height > minSize;
  };

  const sendFaceToBackend = async () => {
    try {
      setLoading(true);
      setStatus("Enviando imagem para reconhecimento...");
      setDetectionError(null);

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
            setTentativas(0);
            
            if (videoRef.current && videoRef.current.srcObject) {
              videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
          } else {
            setStatus("Paciente não encontrado");
            setPacienteEncontrado(null);
            setTentativas(prev => prev + 1);
            setUltimoErro("Rosto não encontrado no sistema");
          }
        } catch (error) {
          console.error("Erro ao enviar para backend:", error);
          setTentativas(prev => prev + 1);
          
          if (error.response?.status === 404) {
            setStatus("Paciente não encontrado");
            setUltimoErro("Seu rosto não foi reconhecido no sistema");
            setDetectionError("❌ Rosto não cadastrado. Verifique se você está cadastrado no sistema.");
          } else if (error.response?.data?.erro) {
            setStatus("Erro no reconhecimento");
            setUltimoErro(error.response.data.erro);
            setDetectionError(`Erro: ${error.response.data.erro}`);
          } else {
            setStatus("Erro de comunicação");
            setUltimoErro("Erro de comunicação com o servidor");
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
      setDetectionError("Erro ao capturar imagem");
    }
  };

  const reiniciarReconhecimento = () => {
    setPacienteEncontrado(null);
    setDetectionError(null);
    setStatus("Reiniciando...");
    setUltimoErro(null);
    startVideo();
    setTimeout(() => setStatus("Aguardando detecção..."), 1000);
  };

  const getDicasReconhecimento = () => {
    if (tentativas > 2) {
      return (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Dicas para melhor reconhecimento:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Melhore a iluminação do ambiente</li>
            <li>• Posicione-se frente à câmera</li>
            <li>• Remova óculos escuros ou acessórios que cubram o rosto</li>
            <li>• Certifique-se de estar cadastrado no sistema</li>
            <li>• Tente uma foto mais recente caso tenha mudado de aparência</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  const getMensagemStatus = () => {
    if (loading) return "Processando reconhecimento...";
    if (detectionError) return detectionError;
    if (tentativas > 0) return `Tentativa ${tentativas} - ${status}`;
    return status;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Reconhecimento Facial</h1>
      
      {detectionError && (
        <div className={`w-full max-w-md mb-4 p-4 rounded-lg ${
          detectionError.includes("não cadastrado") 
            ? "bg-red-100 border border-red-400 text-red-700" 
            : "bg-yellow-100 border border-yellow-400 text-yellow-700"
        }`}>
          <div className="flex items-center">
            {detectionError.includes("não cadastrado") ? "❌" : "⚠️"}
            <span className="ml-2">{detectionError}</span>
          </div>
        </div>
      )}

      {pacienteEncontrado ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">✅</div>
            <h2 className="text-xl font-semibold text-green-600">Paciente Identificado</h2>
          </div>
          <div className="space-y-2">
            <p><strong>Nome:</strong> {pacienteEncontrado.nomeComp}</p>
            <p><strong>CPF:</strong> {pacienteEncontrado.cpf}</p>
            <p><strong>Telefone:</strong> {pacienteEncontrado.telefone}</p>
            <p><strong>Email:</strong> {pacienteEncontrado.email}</p>
            <p><strong>Status:</strong> {pacienteEncontrado.status === 'A' ? 'Ativo' : 'Inativo'}</p>
          </div>
          <button
            onClick={reiniciarReconhecimento}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            🔄 Nova Busca
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
                status.includes("Erro") || detectionError ? "text-red-600" : 
                status.includes("sucesso") ? "text-green-600" : 
                "text-blue-600"
              }`}>
                {getMensagemStatus()}
              </div>
              {loading && (
                <div className="mt-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Analisando rosto...</p>
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              <p className="font-semibold">💡 Para melhor reconhecimento:</p>
              <ul className="mt-2 space-y-1">
                <li>• Posicione-se em um ambiente bem iluminado</li>
                <li>• Olhe diretamente para a câmera</li>
                <li>• Mantenha o rosto dentro do quadro</li>
                <li>• Evite movimentos bruscos</li>
              </ul>
            </div>

            {tentativas > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Tentativas:</strong> {tentativas}
                  {ultimoErro && ` - Último erro: ${ultimoErro}`}
                </p>
              </div>
            )}

            {getDicasReconhecimento()}
          </div>

          {tentativas > 1 && (
            <button
              onClick={reiniciarReconhecimento}
              className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              🔄 Tentar Novamente
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default FaceID;