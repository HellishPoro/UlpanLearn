export default function ResultsScreen({t,  score, setScreen}) {
    return (
        <div className="screen active">
          <div className="results-card">
            <i className="fa-solid fa-trophy" style={{ fontSize: '64px', color: '#ffd700', marginBottom: '15px' }}></i>
            <h2>{t.resultsTitle}</h2>
            <div className="results-stats">
              <div className="stat-box correct"><span className="stat-count">{score.correct}</span><span className="stat-label">{t.correct}</span></div>
              <div className="stat-box wrong"><span className="stat-count">{score.wrong}</span><span className="stat-label">{t.wrong}</span></div>
            </div>
            <button className="btn-primary-duo" style={{ marginTop: '25px', width: '100%' }} onClick={() => setScreen('menu')}>{t.backToMenu}</button>
          </div>
        </div>
    )
}