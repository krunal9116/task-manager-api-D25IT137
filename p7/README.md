# Task Manager - Full Stack Application

This repository contains the complete Full Stack Integration for Practical 6 (React + Node.js + Express + MongoDB).

## Repository Structure

- `/frontend` - The React application (Vite).
- `/backend` - The Node.js/Express API with MongoDB connection.

## Prerequisites

- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) running locally on `mongodb://localhost:27017/task_manager_db`

## How to Run Locally

You will need to run the backend and frontend simultaneously in separate terminals.

### 1. Start the Backend

Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
node server.js
```
The Express server will start on `http://localhost:5000`.

### 2. Start the Frontend

Open a second terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
The React development server will start on `http://localhost:5173`.

## Features Implemented

- **CORS Configuration:** Backend configured to accept requests from the React frontend.
- **Full CRUD Operations:** Create, Read, Update, and Delete tasks from the UI.
- **Optimistic UI Updates:** UI updates instantly when a task is created, before server confirmation.
- **Confirmation Dialogs:** Prevents accidental deletion by requiring user confirmation.
- **Toast Notifications:** Visual feedback for successful and failed API interactions.
- **Data Persistence:** All data is saved in MongoDB and persists across browser reloads.
