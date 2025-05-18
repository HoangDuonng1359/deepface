# Sử dụng image Python chính thức
FROM python:3.12-slim-bookworm

# Cài đặt thư viện hệ thống cần thiết
# RUN apt-get update && apt-get install -y \
#     build-essential \
#     libgl1-mesa-glx \
#     && rm -rf /var/lib/apt/lists/*

# Làm việc trong thư mục /app
WORKDIR /app

# ENV DATABASE_USERNAME=appuser
# ENV DATABASE_PASSWORD=123456
# ENV DATABASE=deepface_database
# ENV DATABASE_HOST=database
# ENV DATABASE_PORT=3307

# Copy requirements và cài đặt
COPY . .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code backend
# COPY . .

EXPOSE 8000

# Lệnh chạy ứng dụng
CMD ["python", "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]