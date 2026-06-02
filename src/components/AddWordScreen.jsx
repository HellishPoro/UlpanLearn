import { useState } from 'react';

export default function AddWordScreen({setFormData, formData, setScreen, editingIndex, t, handleSaveWord}) {
    const [isSaving, setIsSaving] = useState(false);

    const onSaveClick = async () => {
        if (isSaving) return; 
        
        setIsSaving(true);
        try {
            await handleSaveWord(); 
        } catch (error) {
            console.error("Ошибка при сохранении слова:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="screen active" style={{ position: 'relative' }}>
          
          {isSaving && (
            <div className="loading-overlay">
              <div className="ulpan-loader">
                <div className="loader-owl">🦉</div>
                <div className="loader-school">🏫</div>
                <div className="loader-road"></div>
              </div>
              <div className="loading-text">Идем в ульпан...</div>
            </div>
          )}

          <div className="progress-container">
            <button className="btn-back" onClick={() => setScreen('menu')} disabled={isSaving}>
              <i className="fa-solid fa-chevron-left"></i> {t.back}
            </button>
          </div>
          
          <h2>{editingIndex >= 0 ? t.editWordTitle : t.addWordTitle}</h2>
          
          <div className="form-container">
            <div className="form-group"><label>{t.formPlain}</label><input type="text" dir="rtl" placeholder={t.phPlain} value={formData.plain} onChange={e => setFormData({...formData, plain: e.target.value})} disabled={isSaving} /></div>
            <div className="form-group"><label>{t.formNikud}</label><input type="text" dir="rtl" placeholder={t.phNikud} value={formData.nikud} onChange={e => setFormData({...formData, nikud: e.target.value})} disabled={isSaving} /></div>
            <div className="form-group"><label>{t.formTrans}</label><input type="text" placeholder={t.phTrans} value={formData.trans} onChange={e => setFormData({...formData, trans: e.target.value})} disabled={isSaving} /></div>
            <div className="form-group"><label>{t.formRu}</label><input type="text" placeholder={t.phRu} value={formData.ru} onChange={e => setFormData({...formData, ru: e.target.value})} disabled={isSaving} /></div>
            <div className="form-group"><label>{t.formEn}</label><input type="text" placeholder={t.phEn} value={formData.en} onChange={e => setFormData({...formData, en: e.target.value})} disabled={isSaving} /></div>
            <div className="form-group"><label>{t.formFr}</label><input type="text" placeholder={t.phFr} value={formData.fr} onChange={e => setFormData({...formData, fr: e.target.value})} disabled={isSaving} /></div>
            
            <button 
              className={`btn-primary-duo ${isSaving ? 'btn-loading' : ''}`} 
              style={{width: '100%', marginTop: '10px'}} 
              onClick={onSaveClick}
              disabled={isSaving}
            >
              {isSaving ? '...' : t.saveBtn}
            </button>
          </div>
        </div>
    )
}