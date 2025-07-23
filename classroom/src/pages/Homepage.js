
import React from 'react'
import './Homepage.css'; // Assuming you have a CSS file for styling

import Image from './professor.jpg';
import Image2 from './istockphoto-1165150980-1024x1024.jpg';

const Homepage = () => {
  return (
    <div className="forum-container">
    <header className="forum-header fade-in-down">
      <h1>ProfConnect - Building Bridges</h1>
      <p>Fostering better relationships between Professors & Students through meaningful conversations & mentorship.</p>
    </header>
  
    <section className="forum-section">
      <div className="forum-content fade-in-left">
        <h2>Breaking the Barrier</h2>
        <p>
          We believe that an open line of communication helps create an inspiring learning environment where professors guide, and students feel free to share their ideas, thoughts, and doubts without hesitation.
          <br /><br />
          Let’s bridge the communication gap and build trust, respect, and lifelong mentorship.
        </p>
      </div>
      <img src={Image} alt="discussion" />
    </section>
  
    <section className="forum-section reverse">
      <img src={Image2} alt="education" />
      <div className="forum-content fade-in-right">
        <h2>Knowledge Beyond Classrooms</h2>
        <p>
          Professors aren't just educators — they are mentors, advisors, and industry experts. Informal discussions, doubt-solving sessions, real-world experiences, and career guidance help students grow holistically.
          <br /><br />
          Let's move beyond textbooks and make learning memorable.
        </p>
      </div>
    </section>
  
    <div className="forum-extra fade-in-up">
      <h3>Connect • Share • Grow Together</h3>
      <p>Because the best learning happens when we collaborate, communicate, and care beyond academics.</p>
    </div>
  
    <footer className="forum-footer glow">
      Made with 💙 to strengthen bonds beyond academics.
    </footer>
  </div>
  
  );
}

export default Homepage