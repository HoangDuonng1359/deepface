import os
from PIL import Image
from io import BytesIO
import base64
import numpy as np

def save_base64_image(base64_str: str, filepath: str):
    """Decode a base64 string and save it as an image if not already present."""
    if os.path.exists(filepath):
        return  # skip if already saved
    # strip prefix if present
    if "base64," in base64_str:
        base64_str = base64_str.split("base64,")[-1]
    img_data = base64.b64decode(base64_str)
    img = Image.open(BytesIO(img_data)).convert("RGB")
    img.save(filepath)


def build_face_database(data: list, root_folder: str):
    """
    Given data = [
        {"student_id": "23020326", "image": "<base64>"},
        ...
    ]
    create subfolders under root_folder per student_id and save images there.
    """
    os.makedirs(root_folder, exist_ok=True)
    for idx, item in enumerate(data):
        sid = item["student_id"]
        student_folder = os.path.join(root_folder, sid)
        os.makedirs(student_folder, exist_ok=True)

        # name each image <student_id>_<index>.jpg
        fname = f"{sid}_{idx}.jpg"
        filepath = os.path.join(student_folder, fname)

        save_base64_image(item["image"], filepath)


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