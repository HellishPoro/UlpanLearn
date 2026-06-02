import { useState, useEffect } from 'react';

export default function MenuScreen({
  t, 
  startGame, 
  openAddWord, 
  wrongWords, 
  setLibCategory, 
  setSearchQuery, 
  setScreen
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); 
      setDeferredPrompt(e); 
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('Пользователь установил приложение');
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="screen active">
      <h2>{t.title}</h2>
      
      <div className="grid-menu">
        
        <div className="menu-card" onClick={() => startGame('alphabet')}>
          <i className="fa-solid fa-font"></i>
          <h3>{t.abc}</h3>
        </div>

        <div className="menu-card pronouns" onClick={() => startGame('pronouns')}>
          <i className="fa-solid fa-users"></i>
          <h3>{t.pronouns}</h3>
        </div>

        <div className="menu-card verbs" onClick={() => startGame('verbs')}>
          <i className="fa-solid fa-person-running"></i>
          <h3>{t.verbs}</h3>
        </div>

        <div className="menu-card professions" onClick={() => startGame('professions')}>
          <i className="fa-solid fa-user-doctor"></i>
          <h3>{t.professions}</h3>
        </div>

        <div className="menu-card words" onClick={() => startGame('phrases')}>
          <i className="fa-solid fa-comments"></i>
          <h3>{t.phrases}</h3>
        </div>

        <div className="menu-card numbers" onClick={() => startGame('numbers')}>
          <i className="fa-solid fa-list-ol"></i>
          <h3>{t.numbers}</h3>
        </div>

        <div className="menu-card time" onClick={() => startGame('time')}>
          <i className="fa-solid fa-calendar-days"></i>
          <h3>{t.time}</h3>
        </div>

        <div className="menu-card objects" onClick={() => startGame('objects')}>
          <i className="fa-solid fa-house-chimney-window"></i>
          <h3>{t.objects}</h3>
        </div>

        <div className="menu-card colors" onClick={() => startGame('colors')}>
          <i className="fa-solid fa-palette"></i>
          <h3>{t.catColors}</h3>
        </div>

        <div className="menu-card custom-words" onClick={() => startGame('custom')}>
          <i className="fa-solid fa-star"></i>
          <h3>{t.custom}</h3>
        </div>

      </div>

      <div className="extra-sections">
        
        {deferredPrompt && (
          <div 
            className="wide-card action-btn" 
            style={{ background: 'var(--color-primary)', color: 'white' }} 
            onClick={handleInstallClick}
          >
            <i className="fa-solid fa-download"></i> 
            <span>Скачать приложение</span>
          </div>
        )}

        <div className="wide-card action-btn" onClick={openAddWord}>
          <i className="fa-solid fa-plus-circle"></i> 
          <span>{t.addWordBtn}</span>
        </div>

        <div 
          className={`wide-card ${wrongWords.length === 0 ? 'folder-disabled' : 'folder-active'}`} 
          onClick={() => startGame('review')}
        >
          <i className="fa-solid fa-folder-open"></i> 
          <span>
            {wrongWords.length === 0 ? t.emptyFolder : `${t.folder} (${wrongWords.length})`}
          </span>
        </div>
        
        <div 
          className="wide-card library-btn" 
          onClick={() => { 
            setLibCategory('alphabet'); 
            setSearchQuery(''); 
            setScreen('library'); 
          }}
        >
          <i className="fa-solid fa-book-open"></i> 
          <span>{t.library}</span>
        </div>
        
      </div>
    </div>
  );
}