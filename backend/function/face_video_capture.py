import cv2
import numpy as np
import os
import time
import logging
import pickle
import atexit # For cleanup

from deepface import DeepFace
from deepface.commons import functions as deepface_functions

# Conditional imports for optimization
try:
    import onnxruntime as ort
    import tf2onnx # For Keras to ONNX
    import tensorflow as tf # For loading Keras model initially
except ImportError:
    ort = None
    tf2onnx = None
    tf = None
    logging.warning("TensorFlow, tf2onnx, or ONNX Runtime not found. ONNX/TRT optimization for custom models will be disabled.")

try:
    import tensorrt as trt
    import pycuda.autoinit # Initializes CUDA context
    import pycuda.driver as cuda
except ImportError:
    trt = None
    cuda = None
    logging.warning("TensorRT or PyCUDA not found. TensorRT optimization will be disabled.")


# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# DeepFace Configuration
RECOGNITION_MODEL_NAME = "SFace"
DETECTOR_BACKEND = "retinaface"
DISTANCE_METRIC = "cosine"

# --- Optimization Configuration ---
OPTIMIZE_MODEL_NAME = "SFace"  # Which DeepFace model to optimize
USE_TRT_OPTIMIZATION = True    # Master switch for attempting optimization
MODELS_DIR = "optimized_models" # Directory to store ONNX and TRT files
os.makedirs(MODELS_DIR, exist_ok=True)

# SFace specific (or generally for the model you optimize)
# These need to be accurate for your chosen OPTIMIZE_MODEL_NAME
OPTIMIZED_MODEL_TARGET_SIZE = (112, 112) # SFace input H, W
OPTIMIZED_MODEL_EMBEDDING_SIZE = 128     # SFace embedding dimension
OPTIMIZED_MODEL_INPUT_CHANNELS = 3

# Reference Database
REFERENCE_DB_PATH = "reference_face_embeddings.pkl"
os.makedirs("reference_images", exist_ok=True)

class ModernFaceRecognitionSystem:
    def __init__(self, model_name=RECOGNITION_MODEL_NAME, detector_backend=DETECTOR_BACKEND,
                 distance_metric=DISTANCE_METRIC, db_path=REFERENCE_DB_PATH):
        self.model_name = model_name
        self.detector_backend = detector_backend
        self.distance_metric = distance_metric
        self.db_path = db_path
        self.reference_embeddings = []

        # --- TRT Optimization Attributes ---
        self.use_trt_optimization = USE_TRT_OPTIMIZATION and (self.model_name == OPTIMIZE_MODEL_NAME) \
                                    and trt is not None and cuda is not None and ort is not None \
                                    and tf is not None and tf2onnx is not None
        self.trt_engine = None
        self.trt_context = None
        self.trt_stream = None
        self.d_input_trt = None
        self.d_output_trt = None
        self.h_input_trt = None
        self.h_output_trt = None
        self.onnx_input_shape_nchw = (1, OPTIMIZED_MODEL_INPUT_CHANNELS,
                                      OPTIMIZED_MODEL_TARGET_SIZE[0], OPTIMIZED_MODEL_TARGET_SIZE[1])


        if self.use_trt_optimization:
            logging.info(f"Attempting TensorRT optimization for model: {OPTIMIZE_MODEL_NAME}")
            self._setup_optimized_model()
            if self.trt_engine:
                atexit.register(self._cleanup_tensorrt_resources)
            else: # Fallback if TRT setup failed
                self.use_trt_optimization = False
                logging.warning(f"TensorRT setup failed for {OPTIMIZE_MODEL_NAME}. Falling back to standard DeepFace.")
        
        if not self.use_trt_optimization: # If TRT not used or failed, load standard DeepFace
            logging.info(f"Using standard DeepFace for model: {self.model_name}")
            DeepFace.build_model(self.model_name) # Pre-load if not optimized

        # Common setup
        DeepFace.build_model(self.detector_backend) # Pre-load detector
        self.verification_threshold = deepface_functions.get_threshold(self.model_name, self.distance_metric)
        logging.info(f"Verification threshold for {self.model_name} ({self.distance_metric}): {self.verification_threshold}")
        self.load_reference_embeddings()

    def _get_optimized_model_paths(self):
        model_filename_base = OPTIMIZE_MODEL_NAME.lower().replace("-", "_")
        onnx_path = os.path.join(MODELS_DIR, f"{model_filename_base}.onnx")
        trt_path = os.path.join(MODELS_DIR, f"{model_filename_base}.trt")
        return onnx_path, trt_path

    def _setup_optimized_model(self):
        """Loads or builds the ONNX/TensorRT optimized model."""
        onnx_path, trt_path = self._get_optimized_model_paths()

        if not os.path.exists(trt_path):
            logging.info(f"TensorRT engine not found at {trt_path}. Attempting to build...")
            if not os.path.exists(onnx_path):
                logging.info(f"ONNX model not found at {onnx_path} for {OPTIMIZE_MODEL_NAME}. Exporting...")
                try:
                    # Load the original Keras model from DeepFace
                    # Important: DeepFace.build_model() might return a model that's already
                    # part of a larger graph if called multiple times.
                    # For export, it's safer to build it in a clean graph context if possible,
                    # or ensure it's the first call for this model.
                    tf.keras.backend.clear_session() # Try to clear session before loading
                    original_keras_model = DeepFace.build_model(OPTIMIZE_MODEL_NAME)
                    self._export_model_to_onnx(original_keras_model, onnx_path)
                except Exception as e:
                    logging.error(f"Failed to export {OPTIMIZE_MODEL_NAME} to ONNX: {e}")
                    return
            
            if os.path.exists(onnx_path):
                self._convert_onnx_to_trt(onnx_path, trt_path)
            else:
                logging.error(f"ONNX model still not available at {onnx_path}. Cannot build TRT engine.")
                return

        if os.path.exists(trt_path):
            self.trt_engine = self._load_tensorrt_engine(trt_path)
            if self.trt_engine:
                self._initialize_tensorrt_buffers()
                logging.info(f"TensorRT engine for {OPTIMIZE_MODEL_NAME} loaded and buffers initialized.")
            else:
                logging.error(f"Failed to load TensorRT engine from {trt_path}")
        else:
            logging.error(f"TensorRT engine not built or found at {trt_path}")


    def _export_model_to_onnx(self, keras_model, onnx_path_local):
        """Export Keras model to ONNX format."""
        try:
            # SFace Keras input: (None, H, W, C) e.g. (None, 112, 112, 3)
            # We want ONNX input as NCHW for typical TRT optimization
            spec = (tf.TensorSpec(keras_model.inputs[0].shape, keras_model.inputs[0].dtype, name=keras_model.inputs[0].name.split(':')[0]),)
            
            # Define the output name for ONNX graph explicitly
            output_node_name = "output_embedding" # Choose a consistent name
            
            # Modify the Keras model to have a named output if necessary, or find the existing one
            # For SFace from DeepFace, the last layer is usually the embedding.
            # We can rely on tf2onnx to find the output, or specify it.
            # The 'outputs' parameter in from_keras can take the Keras tensor name.
            # Example: keras_model.outputs[0].name
            
            model_proto, _ = tf2onnx.convert.from_keras(
                keras_model,
                input_signature=spec,
                opset=11, # Or 13, 15. Check compatibility.
                output_path=onnx_path_local,
                # Define output names in the ONNX graph. This helps in TRT parsing.
                # The name here should match what we expect from the Keras model's final embedding layer.
                output_names=[output_node_name],
                # Tell tf2onnx to convert specified Keras inputs (NHWC) to NCHW in the ONNX graph
                inputs_as_nchw=[keras_model.inputs[0].name.split(':')[0]]
            )
            logging.info(f"Keras model {OPTIMIZE_MODEL_NAME} exported to ONNX (NCHW) at {onnx_path_local}")
        except Exception as e:
            logging.error(f"Failed to export Keras model to ONNX: {e}", exc_info=True)
            if os.path.exists(onnx_path_local): os.remove(onnx_path_local)


    def _convert_onnx_to_trt(self, onnx_path_local, trt_path_local):
        TRT_LOGGER = trt.Logger(trt.Logger.WARNING)
        builder = trt.Builder(TRT_LOGGER)
        network = builder.create_network(1 << int(trt.NetworkDefinitionCreationFlag.EXPLICIT_BATCH))
        parser = trt.OnnxParser(network, TRT_LOGGER)
        config = builder.create_builder_config()
        config.max_workspace_size = 1 << 30  # 1GB
        if builder.platform_has_fast_fp16:
            config.set_flag(trt.BuilderFlag.FP16)
            logging.info("Enabled FP16 precision for TensorRT.")
        
        try:
            with open(onnx_path_local, 'rb') as model_file:
                if not parser.parse(model_file.read()):
                    for error_idx in range(parser.num_errors):
                        logging.error(f"ONNX Parser Error: {parser.get_error(error_idx)}")
                    raise ValueError(f"Failed to parse ONNX file: {onnx_path_local}")
            
            # Check input and output details from the parsed network
            logging.info(f"TRT Network Input: {network.get_input(0).name}, Shape: {network.get_input(0).shape}, DType: {network.get_input(0).dtype}")
            logging.info(f"TRT Network Output: {network.get_output(0).name}, Shape: {network.get_output(0).shape}, DType: {network.get_output(0).dtype}")

            engine = builder.build_engine(network, config)
            if not engine: raise RuntimeError("Failed to build TensorRT engine.")
            with open(trt_path_local, 'wb') as f: f.write(engine.serialize())
            logging.info(f"TensorRT engine saved to {trt_path_local}")
        except Exception as e:
            logging.error(f"Failed to convert ONNX to TensorRT: {e}", exc_info=True)
            if os.path.exists(trt_path_local): os.remove(trt_path_local)

    def _load_tensorrt_engine(self, trt_path_local):
        TRT_LOGGER = trt.Logger(trt.Logger.WARNING)
        try:
            with open(trt_path_local, 'rb') as f, trt.Runtime(TRT_LOGGER) as runtime:
                return runtime.deserialize_cuda_engine(f.read())
        except Exception as e:
            logging.error(f"Failed to load TensorRT engine: {e}")
            return None

    def _initialize_tensorrt_buffers(self):
        if not self.trt_engine: return
        try:
            self.trt_context = self.trt_engine.create_execution_context()
            
            # Input buffer (NCHW as per onnx_input_shape_nchw)
            input_volume = trt.volume(self.onnx_input_shape_nchw)
            self.h_input_trt = cuda.pagelocked_empty(input_volume, dtype=np.float32)
            self.d_input_trt = cuda.mem_alloc(self.h_input_trt.nbytes)

            # Output buffer (embedding size)
            self.h_output_trt = cuda.pagelocked_empty(OPTIMIZED_MODEL_EMBEDDING_SIZE, dtype=np.float32)
            self.d_output_trt = cuda.mem_alloc(self.h_output_trt.nbytes)
            
            self.trt_stream = cuda.Stream()
            logging.info("TensorRT CUDA buffers and context initialized.")
        except Exception as e:
            logging.error(f"Error initializing TensorRT buffers: {e}", exc_info=True)
            self._cleanup_tensorrt_resources()
            self.use_trt_optimization = False # Disable if setup fails

    def _inference_tensorrt_optimized(self, face_crop_bgr):
        """Performs inference using the loaded TensorRT engine."""
        if not self.trt_context:
            logging.error("TensorRT context not initialized.")
            return None
        try:
            # 1. Preprocess the face crop (BGR HWC uint8)
            #    DeepFace's preprocess_face does normalization, BGR->RGB, and resizing.
            #    It returns NHWC format, float32.
            #    Pass model_name for model-specific normalization (e.g., SFace normalizes to [-1, 1])
            img_preprocessed_nhwc = deepface_functions.preprocess_face(
                img=face_crop_bgr,
                target_size=OPTIMIZED_MODEL_TARGET_SIZE,
                detector_backend='skip', # Already cropped
                enforce_detection=False,
                align=False, # Assuming input crop is already aligned if align=True was used in extract_faces
                model_name=OPTIMIZE_MODEL_NAME # Crucial for correct normalization for SFace
            )
            # Output of preprocess_face is (1, H, W, C)

            # 2. Transpose to NCHW for TRT engine
            img_tensor_nchw_flat = np.transpose(img_preprocessed_nhwc, (0, 3, 1, 2)).astype(np.float32).ravel()
            
            # 3. PyCUDA TRT Inference
            np.copyto(self.h_input_trt, img_tensor_nchw_flat)
            cuda.memcpy_htod_async(self.d_input_trt, self.h_input_trt, self.trt_stream)
            
            bindings = [int(self.d_input_trt), int(self.d_output_trt)]
            self.trt_context.execute_async_v2(bindings=bindings, stream_handle=self.trt_stream.handle)
            
            cuda.memcpy_dtoh_async(self.h_output_trt, self.d_output_trt, self.trt_stream)
            self.trt_stream.synchronize()
            
            return self.h_output_trt.copy() # Return a copy of the embedding
        except Exception as e:
            logging.error(f"Error during optimized TensorRT inference: {e}", exc_info=True)
            return None

    def _cleanup_tensorrt_resources(self):
        logging.info("Cleaning up TensorRT resources...")
        if self.trt_stream: self.trt_stream = None # PyCUDA streams are simple objects
        if self.d_output_trt: self.d_output_trt.free(); self.d_output_trt = None
        if self.d_input_trt: self.d_input_trt.free(); self.d_input_trt = None
        self.trt_context = None 
        self.trt_engine = None 
        # pycuda.autoinit handles context destruction at exit
        logging.info("TensorRT resources cleaned.")

    # --- Modified methods to use optimized path ---
    def _get_embedding(self, face_crop_bgr):
        """Helper to get embedding, using optimized path if available."""
        if self.use_trt_optimization and self.trt_engine:
            return self._inference_tensorrt_optimized(face_crop_bgr)
        else:
            # Standard DeepFace.represent()
            embedding_objs = DeepFace.represent(
                img_path=face_crop_bgr,
                model_name=self.model_name,
                enforce_detection=False,
                detector_backend='skip',
                align=False # Already aligned if done during extraction
            )
            return np.array(embedding_objs[0]["embedding"]) if embedding_objs else None

    def add_identity_from_file(self, image_path, person_name):
        # (Code from previous ModernFaceRecognitionSystem)
        # ...
        # Inside the try block, after getting face_objs:
        # face_crop_bgr = face_objs[0]["face"]
        # embedding_vector = self._get_embedding(face_crop_bgr) # USE HELPER
        # ...
        if not os.path.exists(image_path):
            logging.error(f"Image file not found: {image_path}")
            return False
        if any(name == person_name for name, _ in self.reference_embeddings):
            logging.warning(f"Person '{person_name}' already exists. Skipping.")
            return False
        try:
            # For adding identity, we want the best quality, so detect and align robustly.
            face_objs = DeepFace.extract_faces(img_path=image_path,
                                               detector_backend=self.detector_backend,
                                               align=True, # Crucial
                                               enforce_detection=True)
            if not face_objs:
                 logging.warning(f"No face detected in {image_path} for {person_name}.")
                 return False
            
            face_crop_bgr = face_objs[0]["face"] # This is aligned
            embedding_vector = self._get_embedding(face_crop_bgr)

            if embedding_vector is None:
                 logging.warning(f"Could not generate embedding for {image_path} [{person_name}].")
                 return False

            self.reference_embeddings.append((person_name, embedding_vector)) # Already np.array from helper
            self.save_reference_embeddings()
            logging.info(f"Added identity: {person_name} from {image_path}")
            return True
        except ValueError as ve:
             logging.warning(f"Could not process {image_path} for {person_name}: {ve}")
             return False
        except Exception as e:
            logging.error(f"Error adding identity {person_name} from {image_path}: {e}", exc_info=True)
            return False


    def recognize_faces(self, frame_bgr):
        # (Code from previous ModernFaceRecognitionSystem)
        # ...
        # Inside the loop for face_obj in face_objs:
        # face_crop_bgr = face_obj["face"] # This is aligned from extract_faces
        # current_embedding = self._get_embedding(face_crop_bgr) # USE HELPER
        # ...
        recognized_faces_info = []
        try:
            face_objs = DeepFace.extract_faces(img_path=frame_bgr,
                                               detector_backend=self.detector_backend,
                                               align=True,
                                               enforce_detection=False)
            if not face_objs: return []

            for face_obj in face_objs:
                face_crop_bgr = face_obj["face"]
                bbox_dict = face_obj["facial_area"]
                detector_confidence = face_obj["confidence"]

                current_embedding = self._get_embedding(face_crop_bgr)
                if current_embedding is None:
                    logging.debug("Failed to get embedding for a detected face.")
                    continue

                best_match_name = "Unknown"
                min_distance = float('inf')

                if not self.reference_embeddings:
                    logging.debug("Reference database is empty.")
                else:
                    for ref_name, ref_embedding in self.reference_embeddings:
                        # Distance calculation remains the same
                        if self.distance_metric == "cosine":
                            distance = deepface_functions.findCosineDistance(ref_embedding, current_embedding)
                        # ... (other metrics) ...
                        else: distance = deepface_functions.findCosineDistance(ref_embedding, current_embedding)

                        if distance < min_distance:
                            min_distance = distance
                            if distance < self.verification_threshold:
                                best_match_name = ref_name
                
                recognized_faces_info.append({
                    "name": best_match_name,
                    "bbox": (bbox_dict['x'], bbox_dict['y'], bbox_dict['w'], bbox_dict['h']),
                    "detector_confidence": detector_confidence,
                    "recognition_distance": min_distance
                })
            return recognized_faces_info
        except Exception as e:
            logging.error(f"Error during face recognition: {e}", exc_info=False)
            return []

    # --- Unchanged methods: load_reference_embeddings, save_reference_embeddings ---
    def load_reference_embeddings(self):
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, 'rb') as f:
                    self.reference_embeddings = pickle.load(f)
                logging.info(f"Loaded {len(self.reference_embeddings)} reference embeddings from {self.db_path}")
            except Exception as e:
                logging.error(f"Error loading reference database: {e}. Starting with an empty database.")
                self.reference_embeddings = []
        else:
            logging.info("No existing reference database found. Starting fresh.")
            self.reference_embeddings = []

    def save_reference_embeddings(self):
        try:
            with open(self.db_path, 'wb') as f:
                pickle.dump(self.reference_embeddings, f)
            logging.info(f"Saved {len(self.reference_embeddings)} reference embeddings to {self.db_path}")
        except Exception as e:
            logging.error(f"Error saving reference database: {e}")


# --- Example Usage: Real-time Video (mostly unchanged) ---
def run_realtime_recognition(system: ModernFaceRecognitionSystem):
    # ... (same as before) ...
    cap = cv2.VideoCapture(0)
    if not cap.isOpened(): logging.error("Cannot open webcam."); return
    fps_list = []; last_fps_update_time = time.time(); avg_fps = 0
    while True:
        ret, frame = cap.read()
        if not ret: logging.error("Failed to grab frame."); break
        loop_start_time = time.time()
        processed_faces = system.recognize_faces(frame.copy())
        processing_time = time.time() - loop_start_time
        fps = 1.0 / (processing_time if processing_time > 0 else 0.00001)
        fps_list.append(fps)
        if time.time() - last_fps_update_time > 1: # Update FPS display every second
            avg_fps = sum(fps_list) / len(fps_list) if fps_list else 0
            fps_list = []
            last_fps_update_time = time.time()
        for face_info in processed_faces:
            x, y, w, h = face_info["bbox"]; name = face_info["name"]; distance = face_info["recognition_distance"]
            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            text = f"{name} ({distance:.2f})"
            cv2.putText(frame, text, (x, y - 10 if y > 10 else y + h + 15), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        optimized_str = "TRT" if system.use_trt_optimization and system.trt_engine else "DeepFace"
        cv2.putText(frame, f"FPS: {avg_fps:.1f} ({optimized_str})", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
        cv2.putText(frame, f"Model: {system.model_name}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
        cv2.imshow("Modern Face Recognition", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'): break
    cap.release(); cv2.destroyAllWindows()


if __name__ == "__main__":
    if tf is None or tf2onnx is None or ort is None or trt is None or cuda is None:
        logging.warning("One or more optimization libraries (TF, tf2onnx, ONNXRuntime, TensorRT, PyCUDA) are missing.")
        logging.warning("Optimization path will be disabled. The system will run with standard DeepFace.")
        # Force USE_TRT_OPTIMIZATION to False if critical libraries are missing,
        # overriding the global config for this run if necessary.
        # This is handled internally by the class now.

    recognition_system = ModernFaceRecognitionSystem()
    # ... (rest of __main__ for adding references and running video is the same) ...
    if not recognition_system.reference_embeddings:
        logging.info("Adding reference identities as database is empty...")
        ref_image_folder = "reference_images"
        # Ensure 'reference_images' directory exists and has subdirectories named after people,
        # or images named like 'PersonName_variant.jpg'.
        # E.g., reference_images/Alice/alice1.jpg or reference_images/Bob_office.jpg
        if not os.path.exists(ref_image_folder):
            logging.warning(f"Reference image folder '{ref_image_folder}' not found. Please create it and add images.")
        else:
            for item_name in os.listdir(ref_image_folder):
                item_path = os.path.join(ref_image_folder, item_name)
                if os.path.isfile(item_path) and item_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    person_name = os.path.splitext(item_name)[0].split('_')[0]
                    logging.info(f"Attempting to add {person_name} from file {item_path}")
                    recognition_system.add_identity_from_file(item_path, person_name)
                elif os.path.isdir(item_path):
                    person_name_from_folder = item_name
                    for img_file in os.listdir(item_path):
                        img_file_path = os.path.join(item_path, img_file)
                        if os.path.isfile(img_file_path) and img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                            logging.info(f"Attempting to add {person_name_from_folder} from folder-file {img_file_path}")
                            recognition_system.add_identity_from_file(img_file_path, person_name_from_folder)
                            # break # Add one image per person-folder for this example

    if not recognition_system.reference_embeddings:
        logging.warning("No reference identities loaded or added. Recognition will be limited.")
    else:
        logging.info(f"System initialized with {len(recognition_system.reference_embeddings)} reference identities.")

    run_realtime_recognition(recognition_system)