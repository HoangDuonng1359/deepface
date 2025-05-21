import os
from PIL import Image
from io import BytesIO
import base64
import numpy as np
from deepface import DeepFace
import pybase64
from concurrent.futures import ThreadPoolExecutor, as_completed
import pybase64
import numpy as np


def decode_base64_image(base64_str):
    img_data = pybase64.b64decode(base64_str)
    img = Image.open(BytesIO(img_data)).convert("RGB")
    return np.array(img)

def embed_single_image(student_id, base64_img):
    img = decode_base64_image(base64_img)
    rep = DeepFace.represent(
        img_path=img,
        model="Facenet512",
        enforce_detection=False,
        detector_backend='opencv'
    )[0]["embedding"]
    return student_id, rep

def load_cached_embeddings(db_path):
    data = np.load(os.path.join(db_path, "face_data.npz"), allow_pickle=True)
    return data["embeddings"], data["ids"].tolist()

def build_face_database(compare_images, db_path):
    """Reads base64 images, computes embeddings in parallel, saves them to one .npz file."""

    if len(compare_images) == 0:
        return np.array([]), np.array([])

    if not os.path.isdir(db_path):
        os.makedirs(db_path)
    
    embeddings = []
    ids = []

    with ThreadPoolExecutor(max_workers=4) as executor:
        futures = [
            executor.submit(embed_single_image, item["student_id"], item["image"]) 
            for item in compare_images
        ]
        
        for future in as_completed(futures):
            try:
                student_id, rep = future.result()
                embeddings.append(rep)
                ids.append(student_id)
            except Exception as e:
                print(f"Failed to embed an image: {e}")

    embeddings_matrix = np.vstack(embeddings)
    ids_array = np.array(ids, dtype=object)

    # Save to .npz file
    np.savez(os.path.join(db_path, "face_data.npz"),
             embeddings=embeddings_matrix,
             ids=ids_array)

    return embeddings_matrix, ids


# def save_base64_image(base64_str: str, filepath: str):
#     """Decode a base64 string and save it as an image if not already present."""
#     if os.path.exists(filepath):
#         return  # skip if already saved
#     # strip prefix if present
#     if "base64," in base64_str:
#         base64_str = base64_str.split("base64,")[-1]
#     img_data = base64.b64decode(base64_str)
#     img = Image.open(BytesIO(img_data)).convert("RGB")
#     img.save(filepath)


# def build_face_database(data: list, root_folder: str):
#     """
#     Given data = [
#         {"student_id": "23020326", "image": "<base64>"},
#         ...
#     ]
#     create subfolders under root_folder per student_id and save images there.
#     """
#     os.makedirs(root_folder, exist_ok=True)
#     for idx, item in enumerate(data):
#         sid = item["student_id"]
#         student_folder = os.path.join(root_folder, sid)
#         os.makedirs(student_folder, exist_ok=True)

#         # name each image <student_id>_<index>.jpg
#         fname = f"{sid}_{idx}.jpg"
#         filepath = os.path.join(student_folder, fname)

#         save_base64_image(item["image"], filepath)


def base64_to_rgb(base64_str : str):
    """
    Convert base64 image string to RGB NumPy array.

    Parameters:
        base64_str (str): Base64 encoded image string.

    Returns:
        np.ndarray: Image as an RGB array.
    """
    # Decode base64 string to bytes
    img_data = base64.b64decode(base64_str)

    # Open image with PIL from bytes
    img = Image.open(BytesIO(img_data)).convert("RGB")

    # Convert PIL image to NumPy array (RGB)
    img_rgb = np.array(img)

    return img_rgb

def find_input_shape(model):
    """Find input shape of the model"""
    # For most models in DeepFace
    if len(model.inputs[0].shape) == 4:
        input_shape = tuple((model.inputs[0].shape[1:3]))  # h, w
    else:
        input_shape = model.inputs[0].shape[1:3]
    
    if input_shape[0] == None:
        input_shape = (224, 224)  # Default
    
    return input_shape

def normalize_input(img, normalization="base"):
    """Normalize input based on the normalization type"""
    if normalization == "base":
        # Scale pixel values to [0, 1]
        return img / 255.0
    
    elif normalization == "raw":
        return img
    
    elif normalization == "facenet":
        # Facenet expects inputs in [-1, 1]
        mean = np.mean(img, axis=(0, 1, 2), keepdims=True)
        std = np.std(img, axis=(0, 1, 2), keepdims=True)
        std_adj = np.maximum(std, 1.0/np.sqrt(img.size))
        return (img - mean) / std_adj
    
    else:
        raise ValueError(f"Unsupported normalization type: {normalization}")