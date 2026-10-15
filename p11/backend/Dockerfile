# Use official lightweight Node.js 18 runtime
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies inside container
RUN npm install

# Copy application source code
COPY . .

# Document that the container listens on port 5000
EXPOSE 5000

# Run Express server
CMD ["node", "server.js"]
