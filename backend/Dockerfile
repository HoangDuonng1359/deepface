# Sử dụng image Python chính thức
FROM python:3.12-slim-bookworm

# Làm việc trong thư mục /app
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
COPY . .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# Lệnh chạy ứng dụng
CMD ["python", "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]