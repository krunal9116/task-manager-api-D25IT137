import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Tasks from './components/Tasks';
import Contact from './components/Contact';
import Login from './components/Login';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    // Apply theme class to the root element (html)
    document.documentElement.className = `${theme}-mode`;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const studentData = {
    name: "krunal Vaghamshi",
    title: "Creative Frontend Architect",
    themeColor: "#6366f1", // Indigo primary accent color
    bio: "I am a passionate software engineering student specializing in React development, interaction design, and building accessible Web interfaces. With a strong foundation in modern web technologies, I love creating clean, efficient, and user-centric products that deliver amazing experiences.",
    skills: [
      { name: "React & React Native", level: 92 },
      { name: "JavaScript & TypeScript", level: 88 },
      { name: "HTML5 & CSS3 / SCSS", level: 95 },
      { name: "Node.js & Express", level: 75 },
      { name: "Git & Collaborative Workflows", level: 85 },
      { name: "UI/UX & Responsive Layouts", level: 90 }
    ],
    contactInfo: {
      email: "d25it137@charusat.edu.in",
      github: "https://github.com/krunal9116",
      linkedin: "https://linkedin.com"
    }
  };

  return (
    <>
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home studentData={studentData} />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact contactInfo={studentData.contactInfo} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer 
        name={studentData.name} 
        contactInfo={studentData.contactInfo} 
      />
    </>
  );
}

export default App;
