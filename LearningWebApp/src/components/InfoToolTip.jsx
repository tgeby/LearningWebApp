// InfoToolTip.jsx
import './InfoToolTip.css';

export default function InfoTooltip({ text }) {
  return (
    <div className="info-tooltip-container">
      <span className="info-icon">ℹ️</span>
      <div className="tooltip-text">{text}</div>
    </div>
  );
}