export default function NewScheduleModal({ onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Create New Drying Schedule</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <p className="muted">
          Set up a new mushroom drying cycle with specific parameters.
        </p>

        {/* Form */}
        <div className="form-group">
          <label>Schedule Title</label>
          <input type="text" placeholder="e.g., Shiitake Batch #13" />
        </div>

        <div className="form-group">
          <label>Mushroom Type</label>
          <select>
            <option>Select mushroom type</option>
            <option>Oyster</option>
            <option>Button</option>
            <option>Shiitake</option>
          </select>
        </div>

        <div className="form-row two">
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" />
          </div>

          <div className="form-group">
            <label>Start Time</label>
            <input type="time" />
          </div>
        </div>

        {/* ✅ FIXED SECTION */}
        <div className="form-row three">
          <div className="form-group">
            <label>Duration (hrs)</label>
            <input type="number" placeholder="24" />
          </div>

          <div className="form-group">
            <label>Temp (°F)</label>
            <input type="number" placeholder="65" />
          </div>

          <div className="form-group">
            <label>Humidity (%)</label>
            <input type="number" placeholder="45" />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn">Create Schedule</button>
        </div>
      </div>
    </div>
  );
}
