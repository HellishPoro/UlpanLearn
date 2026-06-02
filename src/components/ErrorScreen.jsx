// src/components/ErrorScreen.jsx
export default function ErrorScreen({ setScreen }) {
    return (
      <div className="screen active error-screen">
        <div className="error-content">
          <div className="error-icon-wrapper">
            <i className="fa-solid fa-mug-hot error-icon"></i>
          </div>
          <h2>Ой, небольшая заминка!</h2>
          <p>Похоже, наши облачные сервера решили сделать небольшой перерыв на кофе. Не переживайте, ваши данные никуда не пропали.</p>
          <p className="error-subtext">Попробуйте вернуться на главную и повторить действие чуть позже.</p>
          
          <button className="btn-primary-duo" onClick={() => setScreen('menu')}>
            Вернуться в меню
          </button>
        </div>
      </div>
    );
  }