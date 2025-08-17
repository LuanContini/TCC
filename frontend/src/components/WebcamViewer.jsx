import React, { useEffect, useRef, useState } from 'react'

export default function WebcamViewer({ onCapture }){
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)

  useEffect(() => {
    let currentStream
    async function start() {
      try{
        currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        setStream(currentStream)
        if(videoRef.current){ videoRef.current.srcObject = currentStream }
      }catch(err){ console.error('Erro ao acessar câmera', err) }
    }
    start()
    return () => { currentStream && currentStream.getTracks().forEach(t=>t.stop()) }
  }, [])

  async function handleCapture(){
    const video = videoRef.current
    if(!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9))
    onCapture?.(blob)
  }

  return (
    <div className="card">
      <video ref={videoRef} autoPlay playsInline style={{width:'100%', borderRadius:12}} />
      <div style={{marginTop:8, display:'flex', gap:8}}>
        <button className="button" onClick={handleCapture}>Capturar Foto</button>
      </div>
    </div>
  )
}
