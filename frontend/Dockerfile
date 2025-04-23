# Chọn image node để build app
FROM node:18-slim as build

# Đặt working directory
WORKDIR /app

# Copy package file và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code và build app
COPY . .
RUN npm run build

# Giai đoạn production - sử dụng nginx để serve app
FROM nginx:alpine

# Copy file build từ stage trước
COPY --from=build /app/build /usr/share/nginx/html

# Copy cấu hình nginx tùy chỉnh (nếu có)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
