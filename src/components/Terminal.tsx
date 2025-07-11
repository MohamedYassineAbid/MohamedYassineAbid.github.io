import React, { useState, useEffect, useRef } from 'react';
import profilePhoto from '../assets/profile-photo.png';

interface TerminalProps {
  onSectionChange: (section: string) => void;
}

interface CommandOutput {
  command: string;
  output: string;
  timestamp: string;
}

const Terminal: React.FC<TerminalProps> = ({ onSectionChange }) => {
  const [history, setHistory] = useState<CommandOutput[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = {
    help: `Available commands:
about          - Learn about me  
skills         - View technical and soft skills  
experience     - My work experience  
projects       - Projects I worked on  
certifications - View my certifications  
education      - My educational background  
achievements   - Awards and competitions  
languages      - Languages I speak  
hobbies        - My personal interests  
contact        - How to reach me  
clear          - Clear the screen`,

    about: `I'm Mohamed Yassine Abid, currently studying Data Engineering at the Faculty of Sciences of Sfax. I enjoy building scalable systems, solving algorithmic problems, and working on DevOps pipelines.`,

    skills: `Technical Skills:
- Programming: Python, C/C++, Java, SQL/PLSQL, Web Development  
- Networking: Linux networking, virtualization  
- Tools: GitHub, Microsoft Office, SQL Server, Pentaho, Azure  

Soft Skills:
- Leadership, Communication, Time Management, Agile  
- Problem-Solving, Creativity, Critical Thinking`,

    experience: `Chairman – IEEE FSS Computer Society Chapter (Jan 2025 – Present)  
- Organized events, workshops, and competitions to engage members and foster professional growth.

Lead & Co-Founder – Competitive Programming Club, FSS (Oct 2023 – Sep 2024)  
- Founded and led the club with a core team, growing membership to 100+ students.
- Improved members' average problem-solving scores by 25%.`,

    projects: `Matrix Operations Website  
- Created an interactive Streamlit app to visualize matrix operations and solve linear systems using Cholesky's algorithm.  

Optimization and Linear Programming  
- Implemented graph algorithms (Ford-Fulkerson, Prim, Dijkstra) and compared them to linear programming models using LINGO.

Traffic Accident Data Warehouse  
- Built a data warehouse for traffic accidents using Pentaho and Python, with Tableau dashboards.  

Virtualization Project  
- Set up a virtualized environment with multiple VMs running PHP/Nginx/Apache2/MySQL/IPSec.`,

    certifications: `- EF SET English Certificate (C1) – EFSET  
- Azure AI Fundamentals – Microsoft  
- Programmation Orientée Objet en Java – Udemy  
- Microsoft Office Specialist (Office 2019) – Microsoft`,

    education: `- Faculty of Sciences of Sfax – Data Engineering  
- Abou Kacem Chebbi High School – Baccalaureate in Mathematics`,

    achievements: `1st Place – IEEE CIS ENIS "AIDOLS 2.0"  
- Developed FACTOFIRE: AI-powered factory fire detection system.

2nd Place – IEEE IAS & SIGHT FSS "EcoWave 1.0"  
- Built FarmSage: Salmonella prediction system in poultry farms using AI.  

2nd Place – IEEE ISIMS SB "TRC 2.0"  
- Developed an AI solution for crop recommendation based on data analysis.`,

    languages: `- Arabic – Native  
- English – C1  
- French – Intermediate`,

    hobbies: `- Sports  
- Chess  
- Reading  
- Classical Music`,

    contact: `Address: Sfax, Route Teniour Km7  
Phone: +216 28 592 003  
Email: abidmohamedyassine00@gmail.com`,

    welcome: `Hi, I'm Mohamed Yassine Abid — a Data Engineering student passionate about DevOps, data, networking, and competitive programming.
I'm seeking an internship to apply my technical skills and grow through real-world projects. Type 'help' to see available commands.`
  };

  const addToHistory = (command: string, output: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setHistory(prev => [...prev, { command, output, timestamp }]);
    
    // Update active section for navbar
    if (Object.keys(commands).includes(command)) {
      onSectionChange(command);
    }
  };

  const executeCommand = (cmd: string) => {
    const command = cmd.toLowerCase().trim();
    
    if (command === 'clear') {
      setHistory([]);
      return;
    }
    
    if (commands[command as keyof typeof commands]) {
      addToHistory(command, commands[command as keyof typeof commands]);
    } else if (command === '') {
      // Empty command, just add prompt
      addToHistory('', '');
    } else {
      addToHistory(command, `Command not found: ${command}. Type 'help' for available commands.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentInput);
    setCurrentInput('');
  };

  const typeCommand = async (command: string, delay: number = 100) => {
    setIsTyping(true);
    setCurrentInput('');
    
    for (let i = 0; i <= command.length; i++) {
      setCurrentInput(command.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setIsTyping(false);
    executeCommand(command);
  };

  // Auto-execute welcome and help commands
  useEffect(() => {
    const initializeTerminal = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await typeCommand('welcome', 50);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    };

    initializeTerminal();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input when clicking on terminal
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto p-4">
        {/* Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <img 
              src={profilePhoto} 
              alt="Mohamed Yassine Abid" 
              className="profile-photo"
            />
            <div 
              className="status-dot"
              title="Available for Internship"
            />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Mohamed Yassine Abid</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Data Engineering Student | DevOps Enthusiast | Competitive Programmer
          </p>
        </div>

        {/* Terminal Window */}
        <div className="bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
          {/* Terminal Header */}
          <div className="bg-secondary px-4 py-2 flex items-center gap-2 border-b border-border">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-4 text-sm text-muted-foreground font-mono">
              mohamed-yassine-abid@portfolio:~
            </div>
          </div>

          {/* Terminal Content */}
          <div 
            ref={terminalRef}
            className="h-[550px] overflow-y-auto p-4 cursor-text"
            onClick={handleTerminalClick}
          >
            {/* Command History */}
            {history.map((entry, index) => (
              <div key={index} className="mb-4">
                {entry.command && (
                  <div className="terminal-prompt text-sm mb-2">
                    <span className="terminal-cyan">{entry.command}</span>
                  </div>
                )}
                {entry.output && (
                  <div className="text-sm whitespace-pre-line text-foreground mb-2 pl-4">
                    {entry.output}
                  </div>
                )}
              </div>
            ))}

            {/* Current Input Line */}
            <form onSubmit={handleSubmit} className="flex items-center">
              <span className="terminal-prompt text-sm mr-2"></span>
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => !isTyping && setCurrentInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-foreground"
                placeholder={isTyping ? "" : "Type a command..."}
                disabled={isTyping}
                autoFocus
              />
              {isTyping && (
                <span className="animate-pulse text-primary">|</span>
              )}
            </form>
          </div>

          {/* Quick Commands */}
          <div className="bg-secondary px-4 py-3 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {Object.keys(commands).filter(cmd => cmd !== 'welcome').slice(0, 6).map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => executeCommand(cmd)}
                  className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors"
                  disabled={isTyping}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© 2025 Mohamed Yassine Abid. Built with React & TypeScript.</p>
          <p className="mt-1">
            <span className="terminal-green">●</span> Available for Internship Opportunities
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terminal;