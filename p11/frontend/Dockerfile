# Stage 1: Build React Frontend
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies inside container
RUN npm install

# Copy source files
COPY . .

# Build production bundle
RUN npm run build

# Document exposed preview port
EXPOSE 5173

# Serve production preview bound to all interfaces
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
