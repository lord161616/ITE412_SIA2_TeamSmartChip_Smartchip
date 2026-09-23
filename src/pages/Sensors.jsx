import useDeviceStatus from "../hooks/useDeviceStatus";
import "../styles/sensors.css";

export default function Sensors() {
  const { device } = useDeviceStatus();

  const getDeviceStatus = () => {
    if (!device.exists) {
      return {
        label: "Waiting for Device",
        className: "waiting",
      };
    }

    if (!device.online) {
      return {
        label: "Device Offline",
        className: "offline",
      };
    }

    return {
      label: "Device Online",
      className: "online",
    };
  };

  const deviceStatus = getDeviceStatus();

  const getLastSeenText = () => {
    if (!device.lastSeen) {
      return "Never";
    }

    const secondsAgo = Math.floor(
      (Date.now() - device.lastSeen.getTime()) / 1000
    );

    if (secondsAgo < 10) {
      return "Just now";
    }

    if (secondsAgo < 60) {
      return `${secondsAgo}s ago`;
    }

    const minutesAgo = Math.floor(secondsAgo / 60);

    if (minutesAgo < 60) {
      return `${minutesAgo}m ago`;
    }

    return device.lastSeen.toLocaleString();
  };

  const availableReadings = [
    device.sensor1.temperature,
    device.sensor1.humidity,
    device.sensor2.temperature,
    device.sensor2.humidity,
  ].filter(
    (value) =>
      value !== null &&
      value !== undefined
  ).length;

  const totalReadings = 4;

  return (
    <div className="dashboard-container">

      {/* =========================
          HEADER
      ========================= */}

      <div className="dashboard-header">

        <div>
          <h1>Sensor Data Monitoring</h1>

          <p className="subtitle">
            Real-time SmartChip environmental monitoring
          </p>
        </div>

        <div className="header-actions">

          <div
            className={`device-status ${deviceStatus.className}`}
          >
            <span className="status-dot"></span>

            {deviceStatus.label}
          </div>

        </div>

      </div>


      {/* =========================
          WAITING FOR DEVICE
      ========================= */}

      {!device.exists && (
        <div className="device-message waiting-message">

          <div className="waiting-icon">
            📡
          </div>

          <div>

            <h2>
              Waiting for SmartChip Device
            </h2>

            <p>
              The SmartChip ESP32 has not connected yet.
            </p>

            <span>
              Live sensor readings will automatically appear
              when the device comes online.
            </span>

          </div>

        </div>
      )}


      {/* =========================
          DEVICE OFFLINE
      ========================= */}

      {device.exists && !device.online && (
        <div className="device-message offline-message">

          <div className="waiting-icon">
            🔴
          </div>

          <div>

            <h2>
              SmartChip Device Offline
            </h2>

            <p>
              The ESP32 has not sent a recent update.
            </p>

            <span>
              Last seen: {getLastSeenText()}
            </span>

          </div>

        </div>
      )}


      {/* =========================
          DEVICE ONLINE MESSAGE
      ========================= */}

      {device.online && (
        <div className="device-message online-message">

          <div className="waiting-icon">
            🟢
          </div>

          <div>

            <h2>
              SmartChip Device Online
            </h2>

            <p>
              Live data is being received from the ESP32.
            </p>

            <span>
              Last update: {getLastSeenText()}
            </span>

          </div>

        </div>
      )}


      {/* =========================
          STATUS CARDS
      ========================= */}

      <div className="status-cards">

        {/* SYSTEM STATUS */}

        <div className="status-card">

          <h4>System Status</h4>

          <strong>
            {!device.exists
              ? "WAITING"
              : device.online
              ? "ONLINE"
              : "OFFLINE"}
          </strong>

          <span>
            {device.online
              ? `${availableReadings}/${totalReadings} sensor readings available`
              : "Waiting for device connection"}
          </span>

          <div className="progress">

            <div
              style={{
                width: device.online
                  ? `${(availableReadings / totalReadings) * 100}%`
                  : "0%",
              }}
            />

          </div>

        </div>


        {/* MACHINE STATUS */}

        <div className="status-card">

          <h4>Machine Status</h4>

          <strong>
            {device.state || "WAITING"}
          </strong>

          <span>
            {device.online
              ? "SmartChip machine connected"
              : "No active device connection"}
          </span>

        </div>


        {/* LAST UPDATE */}

        <div className="status-card">

          <h4>Last Update</h4>

          <strong>
            {device.online
              ? "LIVE"
              : "WAITING"}
          </strong>

          <span>
            {getLastSeenText()}
          </span>

        </div>

      </div>


      {/* =========================
          SHT31 SENSORS
      ========================= */}

      <div className="sensors-grid">

        <SensorCard
          name="SHT31 #1 Temperature"
          value={
            device.sensor1.temperature !== null
              ? `${Number(
                  device.sensor1.temperature
                ).toFixed(1)} °C`
              : "--"
          }
          location="Chamber Sensor #1"
          online={device.sensor1.online}
          lastUpdate={getLastSeenText()}
        />


        <SensorCard
          name="SHT31 #1 Humidity"
          value={
            device.sensor1.humidity !== null
              ? `${Number(
                  device.sensor1.humidity
                ).toFixed(1)} %`
              : "--"
          }
          location="Chamber Sensor #1"
          online={device.sensor1.online}
          lastUpdate={getLastSeenText()}
        />


        <SensorCard
          name="SHT31 #2 Temperature"
          value={
            device.sensor2.temperature !== null
              ? `${Number(
                  device.sensor2.temperature
                ).toFixed(1)} °C`
              : "--"
          }
          location="Chamber Sensor #2"
          online={device.sensor2.online}
          lastUpdate={getLastSeenText()}
        />


        <SensorCard
          name="SHT31 #2 Humidity"
          value={
            device.sensor2.humidity !== null
              ? `${Number(
                  device.sensor2.humidity
                ).toFixed(1)} %`
              : "--"
          }
          location="Chamber Sensor #2"
          online={device.sensor2.online}
          lastUpdate={getLastSeenText()}
        />

      </div>


      {/* =========================
          CHAMBER AVERAGES
      ========================= */}

      <h2 className="section-title">
        Chamber Conditions
      </h2>

      <div className="status-cards">

        <div className="status-card">

          <h4>Average Temperature</h4>

          <strong>
            {device.temperature !== null
              ? `${Number(
                  device.temperature
                ).toFixed(1)} °C`
              : "--"}
          </strong>

          <span>
            Average from SHT31 sensors
          </span>

        </div>


        <div className="status-card">

          <h4>Average Humidity</h4>

          <strong>
            {device.humidity !== null
              ? `${Number(
                  device.humidity
                ).toFixed(1)} %`
              : "--"}
          </strong>

          <span>
            Average from SHT31 sensors
          </span>

        </div>

      </div>


      {/* =========================
          HARDWARE STATUS
      ========================= */}

      <h2 className="section-title">
        Hardware Status
      </h2>

      <div className="sensors-grid">

        <ControlCard
          name="Heating Element"
          state={device.heater}
          online={device.online}
          description="Controlled by SSR"
        />


        <ControlCard
          name="Fan System"
          state={device.fan}
          online={device.online}
          description="Controlled by SSR"
        />


        <ControlCard
          name="SSR Controller"
          state={device.ssr}
          online={device.online}
          description="Main hardware relay"
        />

      </div>

    </div>
  );
}


/* =========================
   SENSOR CARD
========================= */

function SensorCard({
  name,
  value,
  location,
  online,
  lastUpdate,
}) {

  return (
    <div className="sensor-card">

      <div className="sensor-header">

        <h4>{name}</h4>

        <span
          className={`badge ${
            online
              ? "online"
              : "offline"
          }`}
        >
          {online
            ? "online"
            : "waiting"}
        </span>

      </div>


      <div className="sensor-value">
        {value}
      </div>


      <div className="progress">

        <div
          style={{
            width: online
              ? "100%"
              : "0%",
          }}
        />

      </div>


      <div className="sensor-meta">

        <span>
          {location}
        </span>

        <span>
          Updated: {lastUpdate}
        </span>

      </div>

    </div>
  );
}


/* =========================
   CONTROL CARD
========================= */

function ControlCard({
  name,
  state,
  online,
  description,
}) {

  const isOn = state === true;

  let statusText = "WAITING";

  if (online) {
    statusText = isOn
      ? "ON"
      : "OFF";
  }

  return (
    <div className="sensor-card">

      <div className="sensor-header">

        <h4>{name}</h4>

        <span
          className={`badge ${
            online && isOn
              ? "online"
              : "offline"
          }`}
        >
          {statusText}
        </span>

      </div>


      <div className="sensor-value">

        {online
          ? isOn
            ? "ON"
            : "OFF"
          : "--"}

      </div>


      <div className="progress">

        <div
          style={{
            width:
              online && isOn
                ? "100%"
                : "0%",
          }}
        />

      </div>


      <div className="sensor-meta">

        <span>
          {description}
        </span>

        <span>
          {online
            ? "Device connected"
            : "Waiting for device"}
        </span>

      </div>

    </div>
  );
}