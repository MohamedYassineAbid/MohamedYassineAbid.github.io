import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Terminal from '../components/Terminal';

const Index = () => {
  const [activeSection, setActiveSection] = useState('welcome');

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    
    // Simulate typing the command in terminal
    const terminalInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (terminalInput) {
      terminalInput.value = section;
      terminalInput.focus();
      
      // Trigger the command
      const form = terminalInput.closest('form');
      if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
      }
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        activeSection={activeSection} 
        onNavigate={handleNavigate}
      />
      <Terminal 
        onSectionChange={handleSectionChange}
      />
    </div>
  );
};

export default Index;
