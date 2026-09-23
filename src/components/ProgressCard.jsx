export default function ProgressCard() {
  return (
    <div className="card">
      <h4>Progress</h4>
      <p className="value">67%</p>
      <p>Drying cycle</p>
      <div className="progress">
        <div className="fill" />
      </div>
    </div>
  );
}
