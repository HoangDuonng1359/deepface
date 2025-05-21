import os
import numpy as np
from deepface import DeepFace
from deepface.modules import verification
import tensorflow as tf
from drivers.utils import *

class AIDriver:
    # Suppress TensorFlow logging (1 = INFO, 2 = WARNING, 3 = ERROR)
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    tf.get_logger().setLevel('ERROR')

    # Attempt to set memory growth for GPUs to avoid TensorFlow allocating all memory at once
    try:
        gpus = tf.config.list_physical_devices('GPU')
        if gpus:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        # Memory growth must be set before GPUs have been initialized
        print(f"Could not set memory growth for GPU (may already be initialized): {e}")

    # ——— Class-wide constants ———
    MODEL                = "Facenet512"
    DISTANCE_METRIC      = "cosine"
    CONFIDENCE_THRESHOLD = 0.9
    DB_PATH              = 'backend\\drivers\\db_cache'
    DETECTOR             = "opencv"
    embedding_model      = DeepFace.build_model(MODEL)

    def __init__(self, compare_images: list):
        """
        Build or load the face database on instantiation.
        compare_images: list of dicts with keys 'student_id' and 'image' (base64).
        """
        cache_file = os.path.join(self.DB_PATH, "face_data.npz")
        if not os.path.exists(cache_file):
            self.embeddings_matrix, self.ids_list = build_face_database(compare_images, self.DB_PATH)
        else:
            self.embeddings_matrix, self.ids_list = load_cached_embeddings(self.DB_PATH)

    def find(self, target_image: str) -> str:
        """
        Recognize a student from a base64-encoded image.
        Returns the student_id or "Unknown".
        """
        try:
            img = decode_base64_image(target_image)
            rep_target = DeepFace.represent(
                img_path=img,
                model_name=self.MODEL,
                enforce_detection=False,
                detector_backend=self.DETECTOR
            )[0]["embedding"]

            # Compute distances using updated function
            dists = verification.find_cosine_distance(self.embeddings_matrix, rep_target)
            best_idx = np.argmin(dists)
            if dists[best_idx] < self.CONFIDENCE_THRESHOLD:
                return self.ids_list[best_idx]
            return "Unknown"

        except Exception as e:
            print("Recognition failed:", e)
            return "Unknown"

    def add_student(self, student_id: str, base64_imgs: list) -> None:
        """
        Add a new student's images to the database and update cache.

        Parameters:
            student_id (str): Identifier for the new student.
            base64_imgs (list): List of base64-encoded images for this student.
        """
        new_embeddings = []
        for base64_img in base64_imgs:
            img = decode_base64_image(base64_img)
            rep = DeepFace.represent(
                img_path=img,
                model_name=self.MODEL,
                enforce_detection=False,
                detector_backend=self.DETECTOR
            )[0]["embedding"]
            new_embeddings.append(rep)
            self.ids_list.append(student_id)

        if new_embeddings:
            new_mat = np.vstack(new_embeddings)
            self.embeddings_matrix = np.vstack([self.embeddings_matrix, new_mat])
            np.savez(
                os.path.join(self.DB_PATH, "face_data.npz"),
                embeddings=self.embeddings_matrix,
                ids=np.array(self.ids_list, dtype=object)
            )

    def delete_student(self, student_id: str) -> None:
        """
        Remove all embeddings for a given student and update cache.

        Parameters:
            student_id (str): Identifier of the student to remove.
        """
        mask = [sid != student_id for sid in self.ids_list]
        self.embeddings_matrix = self.embeddings_matrix[mask]
        self.ids_list = [sid for sid in self.ids_list if sid != student_id]
        np.savez(
            os.path.join(self.DB_PATH, "face_data.npz"),
            embeddings=self.embeddings_matrix,
            ids=np.array(self.ids_list, dtype=object)
        )
