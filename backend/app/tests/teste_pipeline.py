import numpy as np
import faiss
from insightface.app import FaceAnalysis
import cv2

# 1. Carregar modelo ArcFace (InsightFace)
app = FaceAnalysis(name="antelopev2", root="/home/luan/.insightface")
app.prepare(ctx_id=-1, det_size=(640, 640))  # CPU

face1 = "test_face3.jpg"
face2 = "test_face5.jpg"


# 2. Função para extrair embedding
def get_embedding(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Imagem não encontrada: {image_path}")
    faces = app.get(img)
    if not faces:
        raise ValueError(f"Nenhum rosto detectado na imagem: {image_path}")
    emb = faces[0].embedding.astype(np.float32)
    emb = emb / np.linalg.norm(emb)  # normalização L2
    return emb


# 3. Criar FAISS index
index = faiss.IndexFlatL2(512)

# 4. Adicionar primeiro embedding
foto1 = face1
emb1 = get_embedding(foto1).reshape(1, -1)
index.add(emb1)
print(f"[OK] Adicionado embedding para {foto1}")

# 5. Buscar com outra foto
foto2 = face2
emb2 = get_embedding(foto2).reshape(1, -1)
distances, indices = index.search(emb2, k=1)

print("Distância encontrada:", distances[0][0])
print("Índice retornado:", indices[0][0])

if distances[0][0] < 1.0:  # limiar ajustável
    print("[MATCH] É provavelmente a mesma pessoa")
else:
    print("[NO MATCH] Pessoa diferente")
