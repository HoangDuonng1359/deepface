from deepface import DeepFace
import cv2
import numpy as np
import time
from threading import Thread
from queue import Queue
import matplotlib.pyplot as plt
from utils import *


"""
Note:
    Định dạng compare_images:
    [
        {"student_id": "23020326", "image": "base64_image_1"},
        {"student_id": "23020326", "image": "base64_image_2"},
        {"student_id": "23020326", "image": "base64_image_3"},
        {"student_id": "23020327", "image": "base64_image_1"},
        {"student_id": "23020327", "image": "base64_image_2"}
    ]

"""
class AIDriver:
    MODEL = "Facenet512"
    DISTANCE_METRIC = "cosine"
    CONFIDENCE_THRESHOLD = 20
    DB_PATH = 'backend\drivers\images_from_compare_images'

    @staticmethod
    def find(
        target_image: str,
        compare_images: list
    ) -> str:
        """
            Tìm kiếm sinh viên

            Parameters:
                target_image (str): Mã hóa base64 cho bức ảnh mục tiêu
                compare_images (list[dict]): Danh sách các ảnh lấy được trong cơ sở dữ liệu

            Returns:
                str: Mã sinh viên
        
        """

        target_image_to_rgb = base64_to_rgb(target_image)
        
        if not os.path.exists(AIDriver.DB_PATH):
            build_face_database(compare_images, AIDriver.DB_PATH)

        # Perform face recognition
        try:
            results = DeepFace.find(
                img_path=target_image_to_rgb,
                db_path=AIDriver.DB_PATH,
                model_name=AIDriver.MODEL,
                distance_metric=AIDriver.DISTANCE_METRIC,
                enforce_detection=False,
                detector_backend="retinaface",
                align=True
            )

            if results and not results[0].empty:
                best_match_path = results[0].iloc[0]['identity']
                # best_distance = results[0].iloc[0][f'{AIDriver.MODEL}_{AIDriver.DISTANCE_METRIC}']
                student_id = best_match_path.split(os.sep)[-2]
                return student_id
            else:
                return "Unknown"

        except Exception as e:
            print("Error during comparison:", e)
            return "Unknown"
        