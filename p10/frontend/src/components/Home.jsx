import Header from './Header';
import About from './About';
import Skills from './Skills';

export default function Home({ studentData }) {
  return (
    <>
      <Header 
        name={studentData.name} 
        title={studentData.title} 
        themeColor={studentData.themeColor} 
      />
      <About bio={studentData.bio} />
      <Skills skills={studentData.skills} />
    </>
  );
}
