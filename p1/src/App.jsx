import NavBar from './components/NavBar';
import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import Footer from './components/Footer';
import './App.css';

function App() {
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
      github: "https://github.com",
      linkedin: "https://linkedin.com"
    }
  };

  return (
    <>
      <NavBar />
      <main>
        <Header 
          name={studentData.name} 
          title={studentData.title} 
          themeColor={studentData.themeColor} 
        />
        <About bio={studentData.bio} />
        <Skills skills={studentData.skills} />
      </main>
      <Footer 
        name={studentData.name} 
        contactInfo={studentData.contactInfo} 
      />
    </>
  );
}

export default App;
