# Sử dụng image Python chính thức
FROM python:3.12-slim-bookworm

# Làm việc trong thư mục /app
WORKDIR /app

# Copy requirements và cài đặt
COPY . .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# Lệnh chạy ứng dụng
CMD ["python", "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]