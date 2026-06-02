import { useState, useRef, useEffect } from 'react';

export default function Header({ lang, setLang, setScreen }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'ru', label: 'Русский', icon: '🇷🇺' },
    { code: 'en', label: 'English', icon: '🇬🇧' },
    { code: 'fr', label: 'Français', icon: '🇫🇷' }
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  const handleSelect = (code) => {
    setLang(code);
    setIsOpen(false); 
  };

  return (
    <header>
      <div className="logo" onClick={() => setScreen('menu')}>
        <i className="fa-solid fa-owl"></i> <span>UlpanLearn</span>
      </div>
      
      <div className="custom-dropdown" ref={dropdownRef}>
        <div 
          className={`dropdown-selected ${isOpen ? 'active' : ''}`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{currentLang.label} {currentLang.icon}</span>
          <i className="fa-solid fa-chevron-down" style={{ transition: '0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}></i>
        </div>
        
        {isOpen && (
          <div className="dropdown-options">
            {languages.map((l) => (
              <div 
                key={l.code} 
                className={`dropdown-option ${lang === l.code ? 'selected' : ''}`}
                onClick={() => handleSelect(l.code)}
              >
                {l.label} {l.icon}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}