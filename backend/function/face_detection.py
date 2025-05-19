from deepface import DeepFace
import cv2
import numpy as np
import time
import os
from threading import Thread
from queue import Queue
import matplotlib.pyplot as plt

# Configuration options for DeepFace
MODEL = "Facenet512"  # Best balance of accuracy and speed
DISTANCE_METRIC = "euclidean_l2"  # More accurate for Facenet512
CONFIDENCE_THRESHOLD = 0  # Adjust based on your needs
DB_PATH = "model/Original Images/"  # Path to your face database

class FaceRecognitionSystem:
    @staticmethod
    def single_image_recognition(img_path):
        """Perform face recognition on a single image"""
        try:
            # Load and display the image
            img = cv2.imread(img_path)
            if img is None:
                print(f"Error: Could not load image at {img_path}")
                return
                
            # Convert BGR to RGB for proper display
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Perform face recognition
            people = DeepFace.find(
                img_path=img_path,
                db_path=DB_PATH,
                model_name=MODEL,
                distance_metric=DISTANCE_METRIC,
                enforce_detection=False,
                detector_backend="retinaface",
                align=True
            )
            
            # Process and display results
            if isinstance(people, list) and len(people) > 0:
                best_match = None
                highest_confidence = 0
                for person in people:
                    if len(person) == 0 or 'identity' not in person:
                        continue
                    
                    for i in range(len(person['identity'])):
                        try:
                            # Get identity and bounding box
                            identity = person['identity'][i].split('/')[-1]
                            confidence = (1 - person['distance'][i]) * 100
                            if confidence < CONFIDENCE_THRESHOLD:
                                continue
                            if confidence > highest_confidence:
                                highest_confidence = confidence
                                best_match = person

                            x = int(person['source_x'][i])
                            y = int(person['source_y'][i])
                            w = int(person['source_w'][i])
                            h = int(person['source_h'][i])
                            
                            # Draw bounding box and name
                            cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)
                            # print(f"Identified: {identity} with {confidence:.1f}% confidence")
                        except (IndexError, KeyError) as e:
                            print(f"Error processing result: {e}")

                if best_match is not None:
                    best_match_person_name = best_match["identity"][0].split('/')[-1].split('\\')[-2]
                    print(f'Best match person: {best_match_person_name} with {highest_confidence:.1f}% confidence')
                else:
                    print("No match exceeds confidence threshold.")

                # Display the annotated image
                plt.figure(figsize=(12, 8))
                plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                plt.axis('off')
                plt.title('Face Recognition Results')
                plt.show()
            else:
                print("No faces found or recognized in the image.")
                plt.figure(figsize=(10, 6))
                plt.imshow(img_rgb)
                plt.axis('off')
                plt.title('Original Image - No Faces Recognized')
                plt.show()
                
        except Exception as e:
            print(f"Error in face recognition: {e}")

if __name__ == "__main__":
    model = FaceRecognitionSystem()
    model.single_image_recognition("model\Original Images\Camila Cabello\Camila Cabello_79.jpg")  # Process a single image