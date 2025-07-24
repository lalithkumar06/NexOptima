import './StatsCard.css';

const StatsCard = ({ title, value, color, icon }) => {
  return (
    <div className="stats-card" style={{ borderLeftColor: color }}>
      <div className="stats-card-content">
        <div className="stats-info">
          <h3 className="stats-title">{title}</h3>
          <p className="stats-value" style={{ color }}>{value}</p>
        </div>
        <div className="stats-icon" style={{ color }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;