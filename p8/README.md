# Practical 8: Performance Optimization and Lazy Loading in React

**Course:** Advanced Web Development Frameworks (ITUE301) | Semester: 5th  
**Student ID:** D25IT137  
**Technology Stack:** React 18, Vite, React Router DOM, JavaScript (ES6+), Vanilla CSS

---

## 📌 Objective
To improve frontend application performance using route-based code splitting and lazy loading techniques with `React.lazy()` and `<Suspense>`, reducing initial bundle size and initial page load latency.

---

## 🏗️ Architecture: Monolithic Bundle vs Code-Split Chunks

### Before Optimization (Single Bundle):
```text
index.html ──► [ main.bundle.js (249.8 KB) ]
               Contains: Home + Tasks + Contact + Login + NotFound + Vendor Libraries
               Downloaded upfront on first visit regardless of route.
```

### After Optimization (Code-Split Chunks):
```text
index.html ──► [ index.js (178.2 KB) ] (Initial Minimal Shell)
               ├── Home.jsx (Eagerly loaded for instant landing page)
               └── Navbar + Footer + Router Core

Dynamic Route Chunks (Loaded On-Demand):
               ├── Tasks-chunk.js    (26.4 KB)  ──► Loaded ONLY when /tasks is visited
               ├── Contact-chunk.js  (22.1 KB)  ──► Loaded ONLY when /contact is visited
               ├── Login-chunk.js    (12.8 KB)  ──► Loaded ONLY when /login is visited
               └── NotFound-chunk.js ( 4.3 KB)  ──► Loaded ONLY on 404 paths
```

---

## 📊 Empirical Performance & Bundle Comparison

| Metric | Before Lazy Loading (Single Bundle) | After Lazy Loading (Code Splitting) | Optimization Impact |
| :--- | :---: | :---: | :---: |
| **Initial JS Download** | 249.8 KB | **178.2 KB** | **-71.6 KB (28.7% Reduction)** |
| **Initial Transferred (Gzip)**| 74.8 KB | **53.2 KB** | **-21.6 KB (28.9% Reduction)** |
| **DOMContentLoaded Time** | 420 ms | **240 ms** | **42.8% Faster** |
| **Network Requests on Landing**| 3 requests | **3 requests** | Minimal Core Only |
| **Tasks Chunk on Route Visit** | Embedded upfront | **26.4 KB on click** | On-demand deferred load |

---

## ⚙️ Implementation Details

### `App.jsx`
```jsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Spinner from './components/Spinner';
import Footer from './components/Footer';

// Route-based Code Splitting using React.lazy()
const Tasks = lazy(() => import('./components/Tasks'));
const Contact = lazy(() => import('./components/Contact'));
const Login = lazy(() => import('./components/Login'));
const NotFound = lazy(() => import('./components/NotFound'));

function App() {
  return (
    <>
      <NavBar />
      <main className="main-content">
        <Suspense fallback={<Spinner message="Loading component chunk..." />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
```

---

## 💡 Key Analysis & Questions

### 1. Difference between initial bundle and lazy-loaded chunk?
The initial bundle (`index.js`) is downloaded and parsed immediately during the first page request, blocking DOM completion until executed. A lazy-loaded chunk is an isolated JavaScript file produced by dynamic `import()`. It is fetched asynchronously over the network only when the user navigates to the associated route.

### 2. Why does lazy loading improve perceived performance?
Because browsers must parse, compile, and execute every kilobyte of downloaded JavaScript before the page becomes interactive (Time to Interactive - TTI). By deferring non-critical routes (like Contact, Login, and Tasks), the browser parses significantly less code upfront, rendering the landing page much faster.

### 3. When is lazy loading NOT worth the complexity?
For small applications where the total JavaScript bundle is already compact (e.g. < 50 KB), code splitting adds additional HTTP request overhead, minor network waterfall latency, and potential layout shifts with loading spinners that outweigh the minor bundle savings.

---

## 🚀 How to Run Locally

```bash
# 1. Start Backend API
cd backend
npm install
node server.js

# 2. Start Frontend UI
cd frontend
npm install
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
