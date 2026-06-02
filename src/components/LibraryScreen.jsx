export default function LibraryScreen({
    setScreen,
    t, 
    libCategory, 
    setLibCategory, 
    setSearchQuery, 
    searchQuery, 
    filteredLibrary, 
    setActiveLibIndex, 
    lang, 
    activeLibIndex, 
    playHebrewAudio, 
    openEditWord, 
    handleDeleteWord,
    }) {
    return (
        <>
        <div className="screen active">
           <div className="progress-container">
             <button className="btn-back" onClick={() => setScreen('menu')}><i className="fa-solid fa-chevron-left"></i></button>
           </div>
           <h2>{t.libraryTitle}</h2>
           
           <div className="lib-tabs" style={{ flexWrap: 'wrap' }}>
             {['alphabet','pronouns','verbs','professions','phrases','numbers','time','objects', 'colors','custom'].map((cat, i) => (
                <button key={i} className={`lib-tab-btn ${libCategory === cat ? 'active' : ''}`} onClick={() => { setLibCategory(cat); setSearchQuery(''); }}>
                  {t['lib' + cat.charAt(0).toUpperCase() + cat.slice(1)] || t[cat] || cat}
                </button>
             ))}
           </div>
       
           <div>
             <input type="text" id="libSearchInput" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
           </div>
       
           <div className="lib-items-grid">
             {filteredLibrary.map((item, index) => (
               <div key={index} className="lib-item-thumb" onClick={() => setActiveLibIndex(index)}>
                 <div className="thumb-plain">{item.plain}</div>
                 <div className="thumb-transl">{item[lang]}</div>
               </div>
             ))}
           </div>
         </div>

{activeLibIndex !== null && filteredLibrary[activeLibIndex] && (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setActiveLibIndex(null)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setActiveLibIndex(null)}>&times;</button>
        <div className="modal-plain" style={{ marginTop: '15px' }}>{filteredLibrary[activeLibIndex].plain}</div>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
          <div className="modal-nikud" style={{ margin: 0 }}>{filteredLibrary[activeLibIndex].nikud}</div>
          <button className="view-mode-audio" onClick={() => playHebrewAudio(filteredLibrary[activeLibIndex].nikud)}><i className="fa-solid fa-volume-high"></i></button>
        </div>
        
        <div className="modal-trans">[{filteredLibrary[activeLibIndex].trans}]</div>
        <div className="modal-translation">{filteredLibrary[activeLibIndex][lang]}</div>
        
        {filteredLibrary[activeLibIndex].forms && (
          <div className="modal-verb-forms" style={{ display: 'grid' }}>
            {filteredLibrary[activeLibIndex].forms.map((f, idx) => (
               <div key={idx} className="verb-form-box">
                 <div className="verb-form-title">{f[lang]}</div>
                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                   <span className="verb-form-hebrew" style={{ margin: 0 }}>{f.nikud}</span>
                   <button className="view-mode-audio" style={{ fontSize: '16px', margin: 0 }} onClick={() => playHebrewAudio(f.nikud)}><i className="fa-solid fa-volume-high"></i></button>
                 </div>
                 <div className="verb-form-trans">[{f.trans}]</div>
               </div>
            ))}
          </div>
        )}

        {libCategory === 'custom' && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button className="btn-secondary" style={{ flex: 1, borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }} onClick={openEditWord}>{t.editWordBtn}</button>
            <button className="btn-secondary" style={{ flex: 1, borderColor: 'var(--wrong-color)', color: 'var(--wrong-color)' }} onClick={() => handleDeleteWord(filteredLibrary[activeLibIndex].id)}>{t.deleteBtn}</button>
          </div>
        )}
        
        <div className="modal-nav">
          <button className="btn-secondary" onClick={() => setActiveLibIndex((activeLibIndex - 1 + filteredLibrary.length) % filteredLibrary.length)}><i className="fa-solid fa-chevron-left"></i> {t.back}</button>
          <button className="btn-secondary" onClick={() => setActiveLibIndex((activeLibIndex + 1) % filteredLibrary.length)}>{t.forward} <i className="fa-solid fa-chevron-right"></i></button>
        </div>
      </div>
    </div>
  )}
  </>
    )
}