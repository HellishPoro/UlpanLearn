export default function GameScreen({
    setScreen, 
    score, 
    changeMode, 
    t, 
    mode, 
    category, 
    currentState, 
    lang, 
    playHebrewAudio, 
    toggleHint, 
    handleAnswer, 
    typeAnswer, 
    setTypeAnswer, 
    historyIndex,
    currentViewItem,
    gameHistory,
    navigateHistory,
    navigateView,
    viewIndex, 
    database
    }) {
    return (
        <>
        <div className="screen active">
          <div className="progress-container">
            <button className="btn-back" onClick={() => setScreen('menu')}><i className="fa-solid fa-house"></i></button>
            <div className="progress-bar-outer">
              <div className="progress-bar-inner" style={{ width: `${score.progress}%` }}></div>
            </div>
          </div>

          {category !== 'review' && (
            <div className="mode-selector">
              <button className={`mode-btn ${mode === 'game' ? 'active' : ''}`} onClick={() => changeMode('game')}>{t.gameMode}</button>
              <button className={`mode-btn ${mode === 'type' ? 'active' : ''}`} onClick={() => changeMode('type')}>{t.typeMode}</button>
              <button className={`mode-btn ${mode === 'view' ? 'active' : ''}`} onClick={() => changeMode('view')}>{t.viewMode}</button>
            </div>
          )}

          {(mode === 'game' || mode === 'type') && currentState && (
            <div>
              <div className="flashcard-wrapper">
                <div className={`flashcard ${currentState.wasRevealed ? 'revealed' : ''} ${currentState.taskType === 'type' ? 'mode-type' : ''}`} onClick={toggleHint}>
                  {currentState.taskType === 'conjugate' && <div className="task-label">{t.taskVerbForm}</div>}
                  <div className="hebrew-word" style={{ direction: currentState.taskType === 'type' ? 'ltr' : 'rtl', fontSize: currentState.taskType === 'type' ? '38px' : '48px' }}>
                    {currentState.taskType === 'type' ? currentState.item[lang] : currentState.item.plain}
                  </div>
                  
                  <div className="hint-container">
                    <div className="hebrew-plain-hint">{currentState.item.plain}</div>
                    <div className="nikud-row">
                      <div className="hebrew-nikud">{currentState.item.nikud}</div>
                      <button className="btn-audio" onClick={(e) => { e.stopPropagation(); playHebrewAudio(currentState.item.nikud); }}><i className="fa-solid fa-volume-high"></i></button>
                    </div>
                    <div className="transliteration">[{currentState.item.trans}]</div>
                    <button className="btn-reveal-hint" onClick={(e) => { e.stopPropagation(); toggleHint(); }}>{t.showHint}</button>
                  </div>
                </div>
              </div>

              {currentState.taskType === 'type' ? (
                <div className="typing-area" style={{ display: 'flex' }}>
                  <input type="text" dir="rtl" placeholder={t.typePlaceholder} value={typeAnswer} onChange={e => setTypeAnswer(e.target.value)} disabled={currentState.userSelected !== null} className={currentState.userSelected !== null ? (currentState.isCorrect ? 'correct-input' : 'wrong-input') : ''} onKeyPress={e => { if(e.key === 'Enter' && currentState.userSelected === null) handleAnswer(typeAnswer, typeAnswer.trim() === currentState.item.plain) }}/>
                  <button className="btn-primary-duo" disabled={currentState.userSelected !== null} onClick={() => handleAnswer(typeAnswer, typeAnswer.trim() === currentState.item.plain)}>{t.checkBtn}</button>
                </div>
              ) : (
                <div className="options-list">
                  {currentState.options.map((opt, i) => {
                    const isTarget = currentState.taskType === 'conjugate' ? opt.plain === currentState.item.correctFormTarget : opt.plain === currentState.item.plain;
                    const isSelected = currentState.userSelected === opt.plain;
                    let btnClass = 'option-btn ' + (opt.isVerbForm ? 'verb-form ' : '');
                    
                    if (currentState.userSelected !== null) {
                      if (isTarget) btnClass += 'correct ';
                      else if (isSelected && !isTarget) btnClass += 'wrong ';
                    }
                    
                    return (
                      <button key={i} className={btnClass} disabled={currentState.userSelected !== null} onClick={() => handleAnswer(opt.plain, isTarget)}>
                        {opt.isVerbForm ? opt.plain : opt[lang]} 
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="game-history-controls" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" disabled={historyIndex <= 0} onClick={() => navigateHistory(-1)}>
                  <i className="fa-solid fa-backward"></i> <span className="btn-back-text">{t.back}</span>
                </button>
                {historyIndex < gameHistory.length - 1 && (
                  <button className="btn-secondary" onClick={() => navigateHistory(1)}>
                    <span className="btn-forward-text">{t.forward}</span> <i className="fa-solid fa-forward"></i>
                  </button>
                )}
              </div>
            </div>
          )}

          {mode === 'view' && currentViewItem && (
             <div>
              <div className="flashcard" style={{ padding: '40px 20px' }}>
                <div className="hebrew-word" style={{ fontSize: '52px', color: 'var(--color-secondary)' }}>{currentViewItem.plain}</div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                  <div className="hebrew-nikud" style={{ fontSize: '32px', color: '#333', display: 'block', margin: 0 }}>{currentViewItem.nikud}</div>
                  <button className="view-mode-audio" onClick={(e) => { e.stopPropagation(); playHebrewAudio(currentViewItem.nikud); }}><i className="fa-solid fa-volume-high"></i></button>
                </div>
                <div className="transliteration" style={{ display: 'block', fontSize: '20px', color: '#666', marginTop: '5px' }}>[ {currentViewItem.trans} ]</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginTop: '20px', borderTop: '1px solid #eee', width: '100%', paddingTop: '15px' }}>
                  {currentViewItem[lang]}
                </div>
                
                {currentViewItem.forms && (
                  <div className="modal-verb-forms" style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {currentViewItem.forms.map((f, idx) => (
                      <div key={idx} className="verb-form-box" style={{ background: '#f9f9f9', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
                        <div className="verb-form-title" style={{ fontSize: '11px', color: '#888', marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>{f[lang]}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                          <span className="verb-form-hebrew" style={{ fontSize: '24px', fontWeight: 700, color: '#222', direction: 'rtl', margin: 0 }}>{f.nikud}</span>
                          <button className="view-mode-audio" style={{ fontSize: '18px', margin: 0 }} onClick={(e) => { e.stopPropagation(); playHebrewAudio(f.nikud); }}><i className="fa-solid fa-volume-high"></i></button>
                        </div>
                        <div className="verb-form-trans" style={{ fontSize: '12px', color: '#555', fontStyle: 'italic' }}>[ {f.trans} ]</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', marginTop: '5px' }}>
                {viewIndex + 1} / {database[category].length}
              </div>
              <div className="view-controls" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="btn-secondary" onClick={() => navigateView(-1)}><i className="fa-solid fa-chevron-left"></i> {t.back}</button>
                <button className="btn-secondary" onClick={() => navigateView(1)}>{t.forward} <i className="fa-solid fa-chevron-right"></i></button>
              </div>
            </div>
          )}
        </div>
        </>
    )
}