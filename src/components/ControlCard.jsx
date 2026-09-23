export default function ControlCard({ title, subtitle, value, min, max }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <p className="muted">{subtitle}</p>
      <p>{value}</p>
      <input type="range" />
      <div className="range">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
