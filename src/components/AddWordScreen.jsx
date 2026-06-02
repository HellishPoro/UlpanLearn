export default function AddWordScreen({setFormData, formData, setScreen, editingIndex, t, handleSaveWord}) {
    return (
        <div className="screen active">
          <div className="progress-container">
            <button className="btn-back" onClick={() => setScreen('menu')}><i className="fa-solid fa-chevron-left"></i> {t.back}</button>
          </div>
          <h2>{editingIndex >= 0 ? t.editWordTitle : t.addWordTitle}</h2>
          <div className="form-container">
            <div className="form-group"><label>{t.formPlain}</label><input type="text" dir="rtl" placeholder={t.phPlain} value={formData.plain} onChange={e => setFormData({...formData, plain: e.target.value})} /></div>
            <div className="form-group"><label>{t.formNikud}</label><input type="text" dir="rtl" placeholder={t.phNikud} value={formData.nikud} onChange={e => setFormData({...formData, nikud: e.target.value})} /></div>
            <div className="form-group"><label>{t.formTrans}</label><input type="text" placeholder={t.phTrans} value={formData.trans} onChange={e => setFormData({...formData, trans: e.target.value})} /></div>
            <div className="form-group"><label>{t.formRu}</label><input type="text" placeholder={t.phRu} value={formData.ru} onChange={e => setFormData({...formData, ru: e.target.value})} /></div>
            <div className="form-group"><label>{t.formEn}</label><input type="text" placeholder={t.phEn} value={formData.en} onChange={e => setFormData({...formData, en: e.target.value})} /></div>
            <div className="form-group"><label>{t.formFr}</label><input type="text" placeholder={t.phFr} value={formData.fr} onChange={e => setFormData({...formData, fr: e.target.value})} /></div>
            <button className="btn-primary-duo" style={{width: '100%', marginTop: '10px'}} onClick={handleSaveWord}>{t.saveBtn}</button>
          </div>
        </div>
    )
}