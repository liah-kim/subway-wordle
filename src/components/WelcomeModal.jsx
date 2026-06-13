export default function WelcomeModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal welcome-modal" onClick={e => e.stopPropagation()}>
        <h2 className="welcome-title">Welcome to<br />Subway Wordle!</h2>
        <p className="welcome-body">
          Guess the NYC subway station from its route bullets. You have <strong>6 tries</strong>. After each guess you'll see shared lines, whether you're in the right borough, and the distance and direction to the answer.
        </p>
        <p className="welcome-tip">
          <span className="welcome-tip-icon">⚙️</span>
          <span>Tap <strong>Settings</strong> to switch to Practice mode or change the difficulty.</span>
        </p>
        <button className="btn welcome-btn" onClick={onClose}>Let's play!</button>
      </div>
    </div>
  );
}
