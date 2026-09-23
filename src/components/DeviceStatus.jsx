import {
  MACHINE_STATES,
  formatLastUpdate,
} from "../services/device";


export default function DeviceStatus({ device }) {

  const getStatus = () => {

    if (!device.exists) {
      return {
        label: "WAITING FOR DEVICE",
        description:
          "Waiting for SMARTCHIP-ESP32-01 to connect.",
        className: "waiting",
      };
    }


    if (!device.online) {
      return {
        label: "DEVICE OFFLINE",
        description:
          "The device is not sending a recent heartbeat.",
        className: "offline",
      };
    }


    if (
      device.state === MACHINE_STATES.FAULT
    ) {
      return {
        label: "SYSTEM FAULT",
        description:
          "The device reported a system fault.",
        className: "fault",
      };
    }


    return {
      label: "DEVICE ONLINE",
      description:
        "Receiving live data from the SmartChip device.",
      className: "online",
    };

  };


  const status = getStatus();


  const lastSeen = device.lastSeen
    ? formatLastUpdate(device.lastSeen)
    : "Never";


  return (

    <section
      className={`device-status-card ${status.className}`}
    >

      {/* ================= LEFT ================= */}

      <div className="device-status-main">

        <div className="device-status-label">

          SMARTCHIP CONTROL SYSTEM

        </div>


        <div className="device-status-content">

          <span
            className={`device-status-dot ${status.className}`}
          />

          <div>

            <h2>
              {status.label}
            </h2>

            <p>
              {status.description}
            </p>

          </div>

        </div>

      </div>


      {/* ================= RIGHT ================= */}

      <div className="device-status-details">


        {/* DEVICE */}

        <div className="device-detail">

          <span className="device-detail-label">
            DEVICE
          </span>

          <strong>
            {device.deviceId}
          </strong>

        </div>


        {/* MACHINE STATE */}

        <div className="device-detail">

          <span className="device-detail-label">
            MACHINE STATE
          </span>

          <strong>
            {device.state ?? "WAITING"}
          </strong>

        </div>


        {/* LAST SEEN */}

        <div className="device-detail">

          <span className="device-detail-label">
            LAST SEEN
          </span>

          <strong>
            {lastSeen}
          </strong>

        </div>


      </div>

    </section>

  );

}