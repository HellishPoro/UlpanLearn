import { useState, useEffect, useRef } from 'react';
import { database, locales } from './data.js'; 
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

import Header from './components/Header.jsx';
import MenuScreen from './components/MenuScreen.jsx';
import ResultsScreen from './components/ResultsScreen.jsx';
import AddWordScreen from './components/AddWordScreen.jsx';
import LibraryScreen from './components/LibraryScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import ErrorScreen from './components/ErrorScreen.jsx';

import '../src/index.css'; 

export default function App() {
  const [lang, setLang] = useState('ru');
  const [screen, setScreen] = useState('menu'); 
  const [category, setCategory] = useState('alphabet');
  const [mode, setMode] = useState('game');
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true); 

  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'alert', 
    message: '',
    onConfirm: null
  });

  const [sessionWords, setSessionWords] = useState([]);
  
  const [customWords, setCustomWords] = useState(() => JSON.parse(localStorage.getItem('ulpan_custom_words')) || []);
  const [weights, setWeights] = useState(() => JSON.parse(localStorage.getItem('ulpan_weights')) || {});
  const [wrongWords, setWrongWords] = useState(() => JSON.parse(localStorage.getItem('ulpan_wrong_items')) || []);
  
  const [gameHistory, setGameHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [viewIndex, setViewIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, wrong: 0, progress: 0 });
  const [typeAnswer, setTypeAnswer] = useState('');
  
  const [libCategory, setLibCategory] = useState('alphabet');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLibIndex, setActiveLibIndex] = useState(null); 
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({ plain: '', nikud: '', trans: '', ru: '', en: '', fr: '' });

  const showAlert = (message) => setDialog({ isOpen: true, type: 'alert', message, onConfirm: null });
  const showConfirm = (message, action) => setDialog({ isOpen: true, type: 'confirm', message, onConfirm: action });
  const showLock = (message) => setDialog({ isOpen: true, type: 'lock', message, onConfirm: null });
  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  useEffect(()=>{
    localStorage.setItem('ulpan_wrong_items', JSON.stringify(wrongWords))
  },[wrongWords])
  
  useEffect(() => {
    const initApp = async () => {
      try {
        const fetchPromise = getDocs(collection(db, "customWords"));
        const timerPromise = new Promise(resolve => setTimeout(resolve, 2000));
        
        const [querySnapshot] = await Promise.all([fetchPromise, timerPromise]);
        
        const wordsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (wordsArray.length > 0) setCustomWords(wordsArray);
      } catch (error) {
        console.error("Ошибка при скачивании слов из Firebase:", error);
      } finally {
        setIsAppLoading(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    for (let cat in weights) {
      if (database[cat]) {
        database[cat].forEach(item => {
          if (weights[cat][item.plain]) item.weight = weights[cat][item.plain];
        });
      }
    }
  }, [weights]);

  useEffect(() => {
    database.custom = customWords;
    localStorage.setItem('ulpan_custom_words', JSON.stringify(customWords));
  }, [customWords]);

  const saveWeightsToLocal = () => {
    const newWeights = {};
    for (let cat in database) {
      newWeights[cat] = {};
      database[cat].forEach(item => { newWeights[cat][item.plain] = item.weight || 1; });
    }
    setWeights(newWeights);
    localStorage.setItem('ulpan_weights', JSON.stringify(newWeights));
  };

  const getWeightedRandomBatch = (wordsArray, batchSize = 10) => {
    if (wordsArray.length <= batchSize) return [...wordsArray].sort(() => Math.random() - 0.5);
  
    let pool = [...wordsArray]; 
    let selectedWords = [];
  
    while (selectedWords.length < batchSize && pool.length > 0) {
      const totalWeight = pool.reduce((sum, word) => sum + (word.weight || 1), 0);
      let randomNum = Math.random() * totalWeight;
      let currentWeightSum = 0;
      
      for (let i = 0; i < pool.length; i++) {
        currentWeightSum += (pool[i].weight || 1);
        if (randomNum <= currentWeightSum) {
          selectedWords.push(pool[i]);
          pool.splice(i, 1); 
          break;
        }
      }
    }
    return selectedWords;
  };
  
  const androidAudioRef = useRef(new Audio());
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const unlockAudio = () => {
    if (!audioUnlocked) {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
      const audio = androidAudioRef.current;
      audio.volume = 0;
      audio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"; 
      audio.play().then(() => {
          audio.pause();
          audio.volume = 1;
      }).catch(() => {});
      setAudioUnlocked(true);
    }
  };

  const playHebrewAudio = (text) => {
    let cleanText = text.trim();
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
      let url = "https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=he&q=" + encodeURIComponent(cleanText);
      const audio = androidAudioRef.current;
      audio.src = url;
      audio.play().catch(err => console.error("Android Audio Error:", err));
    } else {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(cleanText);
      u.lang = 'he-IL';
      u.rate = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const heVoice = voices.find(v => v.lang.includes('he') || v.lang.includes('iw'));
      if (heVoice) u.voice = heVoice;
      window.speechSynthesis.speak(u);
    }
  };

  const startGame = (cat) => {
    if (cat === 'custom' && customWords.length < 10) { 
      showLock(`Режим "Мои слова" откроется, как только вы добавите 10 слов! Сейчас в вашем словаре: ${customWords.length} из 10.`); 
      return; 
    }
    if (cat === 'review' && wrongWords.length === 0) return;
    
    setCategory(cat);
    setScore({ correct: 0, wrong: 0, progress: 0 });
    setGameHistory([]);
    setHistoryIndex(-1);
    setViewIndex(0);
    
    let sourcePool = cat === 'review' ? wrongWords : database[cat];
    const batchForGame = getWeightedRandomBatch(sourcePool, 10);
    setSessionWords(batchForGame); 

    setScreen('game');
    
    let nextMode = mode;
    if (mode === 'view') {
      setMode('game');
      nextMode = 'game';
    }
    
    generateNextCard(cat, [], nextMode, batchForGame); 
  };

  const generateNextCard = (currentCat, currentHistory, forcedMode = mode, currentSessionWords = sessionWords) => {
    if(currentHistory.length >= currentSessionWords.length) { setScreen('results'); return; }
    
    let currentItem = { ...currentSessionWords[currentHistory.length] };
    
    let taskType = forcedMode === 'type' ? 'type' : 'translate';
    let options = [];

    if (forcedMode === 'game' && currentCat === 'verbs' && currentItem.forms && currentCat !== 'review') {
      // eslint-disable-next-line react-hooks/purity
      taskType = Math.random() > 0.5 ? 'translate' : 'conjugate';
    }

    if (taskType === 'translate') {
      let realCategory = currentCat === 'review' ? getCategoryOfItem(currentItem) : currentCat;
      let dbPool = database[realCategory] || database.phrases; 
      
      let wrongOptions = dbPool.filter(item => item.plain !== currentItem.plain).sort(() => 0.5 - Math.random()).slice(0, 3);
      
      if (wrongOptions.length < 3) {
        const extraWords = database.phrases.filter(item => item.plain !== currentItem.plain).sort(() => 0.5 - Math.random()).slice(0, 3 - wrongOptions.length);
        wrongOptions = [...wrongOptions, ...extraWords];
      }

      options = [...wrongOptions, currentItem].sort(() => 0.5 - Math.random());
    } else if (taskType === 'conjugate') {
      let targetForm = currentItem.forms[0]; 
      let otherWords = database[currentCat].filter(v => v.plain !== currentItem.plain && v.forms).sort(() => 0.5 - Math.random()).slice(0, 3);
      let wrongOptions = otherWords.map(v => v.forms[0]);
      options = [...wrongOptions, targetForm].sort(() => 0.5 - Math.random());
      options = options.map(opt => ({ ...opt, isVerbForm: true, plain: opt.plain, nikud: opt.nikud, trans: opt.trans }));
      currentItem.correctFormTarget = targetForm.plain;
    }

    const newState = { item: currentItem, options, taskType, userSelected: null, isCorrect: false, wasRevealed: false };
    setGameHistory([...currentHistory, newState]);
    setHistoryIndex(currentHistory.length);
    setTypeAnswer('');
  };

  const handleAnswer = (selectedPlain, isCorrect) => {
    if(currentState.userSelected !== null) return; 

    let updatedHistory = [...gameHistory];
    let stateToUpdate = { ...updatedHistory[historyIndex] };
    
    stateToUpdate.userSelected = selectedPlain;
    stateToUpdate.wasRevealed = true; 
    stateToUpdate.isCorrect = isCorrect;
    updatedHistory[historyIndex] = stateToUpdate;
    
    setGameHistory(updatedHistory);

    let updatedItemWeight = stateToUpdate.item.weight || 5; 

    if (isCorrect) {
      updatedItemWeight = Math.max(1, updatedItemWeight - 2);
      const progressStep = 100 / sessionWords.length;
      setScore(prev => ({ ...prev, correct: prev.correct + 1, progress: Math.min(100, prev.progress + progressStep) }));
      setWrongWords(prev => prev.filter(w => w.plain !== stateToUpdate.item.plain));
    } else {
      updatedItemWeight += 5;
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      setWrongWords(prev => {
        if (!prev.find(w => w.plain === stateToUpdate.item.plain)) return [...prev, stateToUpdate.item];
        return prev;
      });
    }

    const itemInDb = database[category === 'review' ? getCategoryOfItem(stateToUpdate.item) : category].find(i => i.plain === stateToUpdate.item.plain);
    if(itemInDb) itemInDb.weight = updatedItemWeight;
    saveWeightsToLocal();

    setTimeout(() => {
      if (historyIndex === updatedHistory.length - 1) {
        generateNextCard(category, updatedHistory, mode, sessionWords);
      } else {
        setHistoryIndex(historyIndex + 1);
        setTypeAnswer('');
      }
    }, 1600);
  };

  const getCategoryOfItem = (item) => {
    for(let cat in database) { if(database[cat].find(i => i.plain === item.plain)) return cat; }
    return 'custom';
  }

  const changeMode = (newMode) => {
    if (newMode !== mode && (newMode === 'game' || newMode === 'type')) {
      setGameHistory([]);
      setHistoryIndex(-1);
      setScore({ correct: 0, wrong: 0, progress: 0 });
      generateNextCard(category, [], newMode, sessionWords); 
    }
    setMode(newMode);
  };

  const toggleHint = () => {
    let updatedHistory = [...gameHistory];
    updatedHistory[historyIndex].wasRevealed = !updatedHistory[historyIndex].wasRevealed;
    setGameHistory(updatedHistory);
  };

  const handleSaveWord = async () => {
    let plain = formData.plain.trim();
    let ru = formData.ru.trim();
  
    if(!plain || !ru) { 
      showAlert(`${t.formPlain} и ${t.formRu} обязательны для заполнения!`); 
      return; 
    }
  
    if (editingIndex < 0 && customWords.some(w => w.plain === plain)) { 
      showAlert("Такое слово уже существует в вашем словаре!"); 
      return; 
    }
  
    const newWord = {
      plain: plain,
      nikud: formData.nikud.trim() || plain,
      trans: formData.trans.trim() || "...",
      ru: ru,
      en: formData.en.trim() || ru,
      fr: formData.fr.trim() || ru,
      weight: 10 
    };
  
    try {
      let updatedCustom = [...customWords];
  
      if (editingIndex >= 0) {
        const idToEdit = customWords[editingIndex].id; 
        await updateDoc(doc(db, 'customWords', idToEdit), newWord);
        newWord.id = idToEdit; 
        updatedCustom[editingIndex] = newWord;
      } else {
        const docRef = await addDoc(collection(db, 'customWords'), newWord);
        newWord.id = docRef.id; 
        updatedCustom.push(newWord);
      }
  
      setCustomWords(updatedCustom);
      setScreen('menu');
  
    } catch (error) {
      console.error("Ошибка при работе с Firebase: ", error);
      setScreen('error'); 
    }
  };

  const handleDeleteWord = (idToDelete) => {
    showConfirm("Вы точно хотите удалить это слово из своего словаря?", async () => {
      setIsDeleting(true); 
      try {
        await deleteDoc(doc(db, 'customWords', idToDelete));
        setCustomWords(prevWords => prevWords.filter(w => w.id !== idToDelete));
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        closeDialog();
        setScreen('menu'); 
      } catch (error) {
        console.error("Ошибка при удалении: ", error);
        closeDialog(); 
        setScreen('error');
      } finally {
        setIsDeleting(false);
      }
    });
  };

  const openEditWord = () => {
    const itemToEdit = filteredLibrary[activeLibIndex];
    const indexInCustom = customWords.findIndex(w => w.plain === itemToEdit.plain);
    if(indexInCustom === -1) return;
    
    setEditingIndex(indexInCustom);
    setFormData({ 
      plain: itemToEdit.plain, 
      nikud: itemToEdit.nikud, 
      trans: itemToEdit.trans !== "..." ? itemToEdit.trans : "", 
      ru: itemToEdit.ru, 
      en: itemToEdit.en !== itemToEdit.ru ? itemToEdit.en : "", 
      fr: itemToEdit.fr !== itemToEdit.ru ? itemToEdit.fr : "" 
    });
    
    setActiveLibIndex(null);
    setScreen('add');
  };

  const openAddWord = () => {
    setEditingIndex(-1);
    setFormData({ plain: '', nikud: '', trans: '', ru: '', en: '', fr: '' });
    setScreen('add');
  };

  const navigateHistory = (dir) => {
    const newIndex = historyIndex + dir;
    if (newIndex >= 0 && newIndex < gameHistory.length) {
      setHistoryIndex(newIndex);
      setTypeAnswer('');
    }
  };

  const navigateView = (dir) => {
    let list = database[category];
    setViewIndex((prev) => (prev + dir + list.length) % list.length);
  };

  const t = locales[lang]; 
  const currentState = gameHistory[historyIndex];
  const currentViewItem = database[category === 'review' ? 'verbs' : category] ? database[category === 'review' ? 'verbs' : category][viewIndex] : null; 
  
  const filteredLibrary = (database[libCategory] || []).filter(item => {
    const q = searchQuery.toLowerCase();
    return item.plain.toLowerCase().includes(q) || item.nikud.toLowerCase().includes(q) || item.ru.toLowerCase().includes(q) || item.en.toLowerCase().includes(q) || item.fr.toLowerCase().includes(q);
  });

  if (isAppLoading) {
    return (
      <div className="loading-overlay" style={{ position: 'fixed', zIndex: 9999, background: '#f8fafc', opacity: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <div className="ulpan-loader" style={{ transform: 'scale(1.5)', marginBottom: '40px' }}>
          <div className="loader-owl">🦉</div>
          <div className="loader-school">🏫</div>
          <div className="loader-road"></div>
        </div>
        <h1 style={{ color: 'var(--color-primary)', fontSize: '32px', margin: '0 0 10px 0' }}>UlpanLearn</h1>
        <div className="loading-text" style={{ color: '#64748b' }}>Загружаем твои слова...</div>
      </div>
    );
  }

  return (
    <div className="container" onClick={unlockAudio}>
      
      {isDeleting && (
        <div className="loading-overlay" style={{ zIndex: 10000 }}>
          <div className="ulpan-loader">
            <div className="loader-owl">🦉</div>
            <div className="loader-school">🏫</div>
            <div className="loader-road"></div>
          </div>
          <div className="loading-text">Удаляем слово...</div>
        </div>
      )}

      <Header lang={lang} setLang={setLang} setScreen={setScreen} />

      {screen === 'menu' && (
        <MenuScreen t={t} startGame={startGame} openAddWord={openAddWord} wrongWords={wrongWords} setLibCategory={setLibCategory} setSearchQuery={setSearchQuery} setScreen={setScreen} />
      )}

      {screen === 'add' && (
        <AddWordScreen setFormData={setFormData} formData={formData} setScreen={setScreen} editingIndex={editingIndex} t={t} handleSaveWord={handleSaveWord} />
      )}

      {screen === 'game' && (
        <GameScreen
          score={score}
          changeMode={changeMode}
          setScreen={setScreen}
          t={t}
          mode={mode}
          category={category}
          currentState={currentState}
          lang={lang}
          playHebrewAudio={playHebrewAudio}
          toggleHint={toggleHint}
          handleAnswer={handleAnswer}
          typeAnswer={typeAnswer}
          setTypeAnswer={setTypeAnswer}
          historyIndex={historyIndex}
          currentViewItem={currentViewItem}
          gameHistory={gameHistory}
          navigateHistory={navigateHistory}
          navigateView={navigateView}
          viewIndex={viewIndex}
          database={database}
        />
      )}

      {screen === 'results' && (
        <ResultsScreen t={t} score={score} setScreen={setScreen} />
      )}

      {screen === 'library' && (
        <LibraryScreen 
          t={t}
          lang={lang}
          setScreen={setScreen}
          libCategory={libCategory}
          setLibCategory={setLibCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredLibrary={filteredLibrary}
          activeLibIndex={activeLibIndex}
          setActiveLibIndex={setActiveLibIndex}
          playHebrewAudio={playHebrewAudio}
          openEditWord={openEditWord}
          handleDeleteWord={handleDeleteWord}
        />
      )}

      {screen === 'error' && (
        <ErrorScreen setScreen={setScreen} />
      )}

      {dialog.isOpen && (
        <div 
          className="modal-overlay custom-dialog-overlay" 
          style={{ display: 'flex' }}
          onClick={closeDialog}
        >
          <div className="custom-dialog" onClick={e => e.stopPropagation()}>
            
            <div className={`dialog-icon ${dialog.type}`}>
              {dialog.type === 'alert' && <i className="fa-solid fa-circle-exclamation"></i>}
              {dialog.type === 'confirm' && <i className="fa-solid fa-triangle-exclamation"></i>}
              {dialog.type === 'lock' && <i className="fa-solid fa-lock"></i>}
            </div>
            
            <p className="dialog-message">{dialog.message}</p>
            
            <div className="dialog-buttons">
              {dialog.type === 'confirm' && (
                <button className="btn-dialog-cancel" onClick={closeDialog}>
                  Отмена
                </button>
              )}
              <button 
                className="btn-dialog-confirm" 
                onClick={() => {
                  if (dialog.type === 'confirm' && dialog.onConfirm) {
                    dialog.onConfirm();
                  }
                  closeDialog();
                }}
              >
                {dialog.type === 'confirm' ? 'Удалить' : 'Понятно'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}