import React, { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-navbar border-b border-navbar-border backdrop-blur-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Name */}
          <div className="flex items-center">
            <span className="text-xl font-bold font-sans text-primary">
              Mohamed Yassine Abid
            </span>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center space-x-6 text-foreground text-lg">
            <a
              href="https://github.com/MohamedYassineAbid"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              title="GitHub"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/mohamed-yassine-abid/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              title="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://twitter.com/your_handle" // Update this
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              title="Twitter / X"
            >
              <FaXTwitter />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
