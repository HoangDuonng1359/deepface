# Sử dụng image Python chính thức
FROM python:3.12-slim-bookworm
FROM continuumio/miniconda3

# Create and activate conda environment
RUN conda create -n tf-gpu python=3.9 -y

# Use conda env
SHELL ["conda", "run", "-n", "tf-gpu", "/bin/bash", "-c"]

# Install CUDA and cuDNN in Conda
RUN conda install -n tf-gpu -c conda-forge cudatoolkit=11.2 cudnn=8.1.0 -y

# Set work directory
WORKDIR /app

# RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 libsm6 libxrender1 libxext6

RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*


# Copy requirements và cài đặt
# Copy app and requirements
COPY . .

# Install Python dependencies
RUN conda run -n tf-gpu pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# Run the app inside conda environment
CMD ["conda", "run", "-n", "tf-gpu", "python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
