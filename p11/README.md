# Practical 11: Containerization with Docker and Docker Compose

**Course**: Advanced Web Development Frameworks (ITUE301)  
**Student ID**: D25IT137  
**Technology Stack**: Docker, Docker Compose, Node.js (Express), MongoDB 6.0, React (Vite)

---

## 📌 Objective
To containerize the full-stack Task Management application using Docker and orchestrate all three interdependent services (**React Frontend**, **Node/Express Backend**, and **MongoDB Database**) with a single command via **Docker Compose**.

---

## 🏗️ Architecture & Orchestration Diagram

```text
                     +---------------------------------------+
                     |           Host Web Browser            |
                     +-------------------+-------------------+
                                         |
                                         | http://localhost:5173
                                         v
                     +---------------------------------------+
                     |       task_manager_frontend           |
                     |         (Port 5173:5173)              |
                     +-------------------+-------------------+
                                         |
                                         | http://localhost:5000 (API calls)
                                         v
                     +---------------------------------------+
                     |        task_manager_backend           |
                     |          (Port 5000:5000)             |
                     +-------------------+-------------------+
                                         |
                                         | mongodb://mongodb:27017/task_manager_db
                                         | (Internal Docker DNS)
                                         v
                     +---------------------------------------+
                     |         task_manager_mongodb          |
                     |           (Port 27017:27017)          |
                     +-------------------+-------------------+
                                         |
                                         v
                               [Named Volume: mongo-data]
                                (Persistent Storage /data/db)
```

**Internal Bridge Network**: `task_manager_app_network`  
All three containers communicate securely over this private bridge network with automatic DNS resolution.

---

## ⚙️ Configuration & Artifacts

### 1. Backend Containerization (`backend/Dockerfile`)
```dockerfile
# Use lightweight Node 18 runtime
FROM node:18-alpine

WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Document container port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
```

### 2. Frontend Containerization (`frontend/Dockerfile`)
Uses a production build stage to compile optimized assets, served with Vite preview:
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5173

# Listen on all container interfaces (0.0.0.0)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
```

### 3. Build Optimization with `.dockerignore`
Both `backend/.dockerignore` and `frontend/.dockerignore` exclude:
```text
node_modules
dist
npm-debug.log
.env
.git
.DS_Store
```
* **Why**: Prevents bloated host dependencies, OS-specific compiled binaries, and secrets from polluting the container build context.

### 4. Orchestration (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: task_manager_mongodb
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: task_manager_backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/task_manager_db
      - JWT_SECRET=super_secret_jwt_key_practical_11
    depends_on:
      - mongodb
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: task_manager_frontend
    restart: always
    ports:
      - "5173:5173"
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  mongo-data:
    name: task_manager_mongo_data

networks:
  app-network:
    name: task_manager_app_network
    driver: bridge
```

---

## 🚀 How to Run with Docker Compose

### 1. Start the entire application stack:
```bash
docker compose up --build
```
*(or run detached in background: `docker compose up --build -d`)*

### 2. Verify running containers:
```bash
docker ps
```
Expected output:
```text
CONTAINER ID   IMAGE                 COMMAND                  PORTS                      NAMES
a1b2c3d4e5f6   p11-frontend          "npm run preview -- …"   0.0.0.0:5173->5173/tcp     task_manager_frontend
b2c3d4e5f6a1   p11-backend           "node server.js"         0.0.0.0:5000->5000/tcp     task_manager_backend
c3d4e5f6a1b2   mongo:6.0             "docker-entrypoint.s…"   0.0.0.0:27017->27017/tcp   task_manager_mongodb
```

### 3. Access the Application:
- **Frontend UI**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health / Notifications**: `http://localhost:5000/notifications`

### 4. Stop the stack:
```bash
docker compose down
```
*(To remove persistent data volume as well: `docker compose down -v`)*

---

## 💡 Key Analysis & Viva Questions

### 1. Why does the backend container need to reference MongoDB by its service name (`mongodb`) rather than `localhost`?
In Docker, each container runs in its own network namespace with an isolated network stack. Therefore, `localhost` (or `127.0.0.1`) inside the backend container refers strictly to the backend container itself. Docker Compose sets up an embedded DNS server on user-defined bridge networks (`app-network`), allowing containers to discover each other by their declared service names. Hence, the backend resolves the host `mongodb` to the MongoDB container's internal IP address.

### 2. What is the difference between `EXPOSE` in a Dockerfile and `ports` in `docker-compose.yml`?
- **`EXPOSE` (Documentation/Metadata)**: Informs Docker and image consumers which port the application inside the container is configured to listen on. It does **not** publish or expose the port to the host machine.
- **`ports` (Host Binding)**: Configures actual network address translation (NAT) between the host machine and the container (e.g., `"5000:5000"` binds host port 5000 to container port 5000), making the service reachable from a web browser on the host machine.

### 3. Why is copying `node_modules` into a Docker image considered a bad practice?
- **Host Architecture Incompatibility**: If your host is macOS (darwin-arm64) and the container image is Linux (linux-arm64 or linux-amd64), host-compiled native C++ bindings (e.g., `bcrypt`, native rollup bindings) will fail inside the Linux container.
- **Image Bloat & Slow Context Transfer**: `node_modules` contains thousands of files, slowing down the Docker build context transfer. Running `npm install` inside the container builds clean dependencies tailored to the container's OS and architecture.

### 4. How does the named volume (`mongo-data`) ensure data persistence?
Containers are ephemeral by default; any data written to container writable layers is deleted when a container is removed. By mounting a named volume (`mongo-data:/data/db`), MongoDB writes all BSON database files to storage managed by the Docker engine on the host filesystem. Even if `docker compose down` destroys and recreates the containers, the volume remains intact and is reattached upon next startup.
