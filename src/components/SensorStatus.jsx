export default function SensorStatus({ device }) {


  /* =========================================
     SAFE SENSOR VALUE
  ========================================= */

  const formatTemperature =
    (value) => {

      const number =
        Number(value);

      return Number.isFinite(number)
        ? `${number.toFixed(1)}°C`
        : "--";

    };


  const formatHumidity =
    (value) => {

      const number =
        Number(value);

      return Number.isFinite(number)
        ? `${number.toFixed(1)}% RH`
        : "--";

    };


  return (

    <div
      className="card dashboard-alerts"
    >

      <h3>

        SHT31 Sensor Status

      </h3>


      <p className="muted">

        Live temperature and humidity
        readings from the drying chamber.

      </p>


      <div className="sensor-status-grid">


        {/* ================= SHT31 #1 ================= */}

        <div className="alert sensor-card">

          <div className="sensor-card-header">

            <div>

              <div className="alert-title">

                SHT31 #1

              </div>


              <div className="sensor-location">

                Chamber Sensor 1

              </div>

            </div>


            <span
              className={
                device.sensor1.online
                  ? "sensor-online"
                  : "sensor-offline"
              }
            >

              {device.sensor1.online
                ? "● Online"
                : "● Waiting"}

            </span>

          </div>


          <div className="sensor-reading">

            <div>

              <span className="sensor-label">

                Temperature

              </span>


              <strong>

                {formatTemperature(
                  device.sensor1.temperature
                )}

              </strong>

            </div>


            <div>

              <span className="sensor-label">

                Humidity

              </span>


              <strong>

                {formatHumidity(
                  device.sensor1.humidity
                )}

              </strong>

            </div>

          </div>

        </div>


        {/* ================= SHT31 #2 ================= */}

        <div className="alert sensor-card">

          <div className="sensor-card-header">

            <div>

              <div className="alert-title">

                SHT31 #2

              </div>


              <div className="sensor-location">

                Chamber Sensor 2

              </div>

            </div>


            <span
              className={
                device.sensor2.online
                  ? "sensor-online"
                  : "sensor-offline"
              }
            >

              {device.sensor2.online
                ? "● Online"
                : "● Waiting"}

            </span>

          </div>


          <div className="sensor-reading">

            <div>

              <span className="sensor-label">

                Temperature

              </span>


              <strong>

                {formatTemperature(
                  device.sensor2.temperature
                )}

              </strong>

            </div>


            <div>

              <span className="sensor-label">

                Humidity

              </span>


              <strong>

                {formatHumidity(
                  device.sensor2.humidity
                )}

              </strong>

            </div>

          </div>

        </div>


      </div>


    </div>

  );

}