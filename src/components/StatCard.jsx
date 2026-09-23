export default function StatCard({ title, value, target, subtitle, status }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <p className="value">{value}</p>
      {target && <p>Target: {target}</p>}
      {subtitle && <p>{subtitle}</p>}
      <span className="badge">{status}</span>
    </div>
  );
}
