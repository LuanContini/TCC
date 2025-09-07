import faiss
import numpy as np
import os
import pickle
import insightface

FAISS_INDEX_FILE = "faiss_index.bin"
ID_MAP_FILE = "id_map.pkl"

# Carrega modelo ArcFace (buffalo_l = modelo robusto)
model = insightface.app.FaceAnalysis(name='buffalo_l')
model.prepare(ctx_id=0, det_size=(640, 640))

# FAISS index para embeddings 512D
dimension = 512
index = faiss.IndexFlatL2(dimension)
id_map = []

def _load_index():
    global index, id_map
    if os.path.exists(FAISS_INDEX_FILE):
        index = faiss.read_index(FAISS_INDEX_FILE)
    if os.path.exists(ID_MAP_FILE):
        with open(ID_MAP_FILE, "rb") as f:
            id_map[:] = pickle.load(f)

def _save_index():
    faiss.write_index(index, FAISS_INDEX_FILE)
    with open(ID_MAP_FILE, "wb") as f:
        pickle.dump(id_map, f)

def _extract_embedding(image_path: str):
    img = insightface.utils.image.read_img(image_path)
    faces = model.get(img)
    if not faces:
        raise ValueError("Nenhum rosto detectado")
    embedding = faces[0].embedding.astype(np.float32)
    embedding /= np.linalg.norm(embedding)  # normalização L2
    return np.array([embedding], dtype=np.float32)

def register_face(image_path: str, db_id: int):
    embedding = _extract_embedding(image_path)
    index.add(embedding)
    id_map.append(db_id)
    _save_index()

def recognize_face(image_path: str, threshold=1.0):
    embedding = _extract_embedding(image_path)
    distances, indices = index.search(embedding, 1)

    if distances[0][0] <= threshold and indices[0][0] < len(id_map):
        return id_map[indices[0][0]], float(distances[0][0])

    return None, None

# Carregar FAISS ao iniciar servidor
_load_index()
