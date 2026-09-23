import "../styles/AnalyticsDashboard.css";

import useDeviceStatus from "../hooks/useDeviceStatus";


export default function Analytics() {

  const { device } =
    useDeviceStatus();


  /* =========================================
     DEVICE STATUS
  ========================================= */

  const getDeviceStatus = () => {

    /*
     * Device has never connected.
     */

    if (!device.exists) {

      return {

        label:
          "WAITING FOR DEVICE",

        title:
          "Waiting for SmartChip device",

        message:
          "The SmartChip ESP32 has not connected yet. Analytics will become available when the device starts sending telemetry.",

        status:
          "waiting",

      };

    }


    /*
     * Device document exists but
     * the heartbeat has expired.
     */

    if (!device.online) {

      return {

        label:
          "DEVICE OFFLINE",

        title:
          "SmartChip device is offline",

        message:
          "The device is currently not sending live telemetry. Historical analytics will be available after telemetry storage is implemented.",

        status:
          "offline",

      };

    }


    /*
     * Device is online.
     */

    return {

      label:
        "DEVICE ONLINE",

      title:
        "Analytics monitoring active",

      message:
        "SmartChip is online. Live sensor data is available. Historical analytics will appear as telemetry is collected.",

      status:
        "online",

    };

  };


  const deviceStatus =
    getDeviceStatus();


  /* =========================================
     SAFE VALUES

     Never call toFixed() on null.
  ========================================= */

  const formatTemperature =
    (value) => {

      if (
        value === null ||
        value === undefined ||
        !Number.isFinite(Number(value))
      ) {

        return "--";

      }

      return `${Number(value).toFixed(1)}°C`;

    };


  const formatHumidity =
    (value) => {

      if (
        value === null ||
        value === undefined ||
        !Number.isFinite(Number(value))
      ) {

        return "--";

      }

      return `${Number(value).toFixed(1)}%`;

    };


  /* =========================================
     CHART DATA

     Current architecture:
     chart is empty until real historical
     telemetry is implemented.

     This page automatically detects
     future chart data.
  ========================================= */

  const hasTemperatureHistory =
    Array.isArray(
      device.chart?.temperature
    ) &&
    device.chart.temperature.length > 0;


  const hasHumidityHistory =
    Array.isArray(
      device.chart?.humidity
    ) &&
    device.chart.humidity.length > 0;


  /* =========================================
     SENSOR COMPARISON DATA
  ========================================= */

  const sensor1 =
    device.sensor1 ?? {};


  const sensor2 =
    device.sensor2 ?? {};


  return (

    <div className="page-container analytics">


      {/* =====================================
          HEADER
      ===================================== */}

      <div className="analytics-header">

        <div>

          <span className="analytics-eyebrow">

            SMARTCHIP INSIGHTS

          </span>


          <h1>

            Analytics & Insights

          </h1>


          <p className="muted">

            Analyze drying performance,
            sensor readings, and system history.

          </p>

        </div>


        <div
          className={`analytics-status-badge ${

            deviceStatus.status

          }`}
        >

          <span className="status-dot" />

          {deviceStatus.label}

        </div>

      </div>



      {/* =====================================
          ANALYTICS STATUS
      ===================================== */}

      <div
        className={`card analytics-device-card ${

          deviceStatus.status

        }`}
      >

        <div className="analytics-device-content">


          <div className="analytics-device-icon">

            {device.online
              ? "●"
              : device.exists
              ? "!"
              : "○"}

          </div>


          <div>

            <h3>

              {deviceStatus.title}

            </h3>


            <p>

              {deviceStatus.message}

            </p>


            <div className="analytics-device-meta">

              <span>

                Device ID:
                {" "}
                <strong>

                  {device.deviceId}

                </strong>

              </span>


              <span>

                Live Telemetry:
                {" "}

                <strong>

                  {device.online
                    ? "Available"
                    : "Waiting"}

                </strong>

              </span>

            </div>

          </div>


        </div>

      </div>



      {/* =====================================
          SUMMARY CARDS
      ===================================== */}

      <div className="analytics-summary-grid">


        {/* AVERAGE TEMPERATURE */}

        <AnalyticsCard

          icon="🌡"

          title="Average Temperature"

          value="--"

          description={
            hasTemperatureHistory
              ? "Historical calculation pending"
              : "No telemetry history"
          }

          status={
            hasTemperatureHistory
              ? "available"
              : "waiting"
          }

        />


        {/* AVERAGE HUMIDITY */}

        <AnalyticsCard

          icon="💧"

          title="Average Humidity"

          value="--"

          description={
            hasHumidityHistory
              ? "Historical calculation pending"
              : "No telemetry history"
          }

          status={
            hasHumidityHistory
              ? "available"
              : "waiting"
          }

        />


        {/* TOTAL DRYING TIME */}

        <AnalyticsCard

          icon="⏱"

          title="Total Drying Time"

          value="--"

          description="No completed drying runs"

          status="waiting"

        />


        {/* COMPLETED BATCHES */}

        <AnalyticsCard

          icon="✓"

          title="Completed Batches"

          value="--"

          description="Drying history not loaded"

          status="waiting"

        />

      </div>



      {/* =====================================
          TEMPERATURE ANALYTICS
      ===================================== */}

      <div className="card analytics-chart-card">


        <div className="analytics-card-header">

          <div>

            <h3>

              Temperature Trend

            </h3>


            <p className="muted">

              Historical chamber temperature
              readings.

            </p>

          </div>


          <span className="chart-status">

            {hasTemperatureHistory
              ? "Data Available"
              : "No Data"}

          </span>

        </div>


        <AnalyticsChartPlaceholder

          type="temperature"

          device={device}

          hasData={
            hasTemperatureHistory
          }

        />

      </div>



      {/* =====================================
          HUMIDITY ANALYTICS
      ===================================== */}

      <div className="card analytics-chart-card">


        <div className="analytics-card-header">

          <div>

            <h3>

              Humidity Trend

            </h3>


            <p className="muted">

              Historical chamber humidity
              readings.

            </p>

          </div>


          <span className="chart-status">

            {hasHumidityHistory
              ? "Data Available"
              : "No Data"}

          </span>

        </div>


        <AnalyticsChartPlaceholder

          type="humidity"

          device={device}

          hasData={
            hasHumidityHistory
          }

        />

      </div>



      {/* =====================================
          SENSOR COMPARISON
      ===================================== */}

      <div className="card analytics-sensor-comparison">


        <div className="analytics-card-header">

          <div>

            <h3>

              SHT31 Sensor Comparison

            </h3>


            <p className="muted">

              Compare environmental readings
              from both chamber sensors.

            </p>

          </div>


          <span
            className={
              device.online
                ? "comparison-live"
                : "comparison-waiting"
            }
          >

            {device.online
              ? "Live"
              : "Waiting"}

          </span>

        </div>



        <div className="sensor-comparison-table">


          {/* TABLE HEADER */}

          <div className="comparison-row comparison-heading">

            <span>
              Metric
            </span>


            <span>
              SHT31 #1
            </span>


            <span>
              SHT31 #2
            </span>

          </div>



          {/* CURRENT TEMPERATURE */}

          <ComparisonRow

            metric="Current Temperature"

            sensor1={
              formatTemperature(
                sensor1.temperature
              )
            }

            sensor2={
              formatTemperature(
                sensor2.temperature
              )
            }

          />


          {/* CURRENT HUMIDITY */}

          <ComparisonRow

            metric="Current Humidity"

            sensor1={
              formatHumidity(
                sensor1.humidity
              )
            }

            sensor2={
              formatHumidity(
                sensor2.humidity
              )
            }

          />


          {/* AVERAGE TEMPERATURE */}

          <ComparisonRow

            metric="Average Temperature"

            sensor1="--"

            sensor2="--"

          />


          {/* AVERAGE HUMIDITY */}

          <ComparisonRow

            metric="Average Humidity"

            sensor1="--"

            sensor2="--"

          />


          {/* MINIMUM */}

          <ComparisonRow

            metric="Minimum Reading"

            sensor1="--"

            sensor2="--"

          />


          {/* MAXIMUM */}

          <ComparisonRow

            metric="Maximum Reading"

            sensor1="--"

            sensor2="--"

          />


          {/* STATUS */}

          <ComparisonRow

            metric="Status"

            sensor1={
              sensor1.online
                ? "Online"
                : "Waiting"
            }

            sensor2={
              sensor2.online
                ? "Online"
                : "Waiting"
            }

            statusRow

          />

        </div>


      </div>



      {/* =====================================
          DRYING RUN HISTORY
      ===================================== */}

      <div className="card analytics-history-card">


        <div className="analytics-card-header">

          <div>

            <h3>

              Drying Run History

            </h3>


            <p className="muted">

              Performance data from completed
              SmartChip drying cycles.

            </p>

          </div>


          <span className="history-count">

            No Data

          </span>

        </div>


        <div className="analytics-empty-state">


          <div className="analytics-empty-icon">

            ⏱

          </div>


          <h3>

            No drying run analytics yet

          </h3>


          <p>

            Completed drying runs will appear
            here after SmartChip begins storing
            telemetry and drying performance data.

          </p>

        </div>


      </div>



      {/* =====================================
          SYSTEM PERFORMANCE
      ===================================== */}

      <div className="analytics-performance-grid">


        {/* TEMPERATURE STABILITY */}

        <PerformanceCard

          title="Temperature Stability"

          value="--"

          description="Waiting for telemetry"

          icon="🌡"

        />


        {/* HUMIDITY REDUCTION */}

        <PerformanceCard

          title="Humidity Reduction"

          value="--"

          description="Waiting for drying cycle"

          icon="💧"

        />


        {/* TARGET ACCURACY */}

        <PerformanceCard

          title="Target Accuracy"

          value="--"

          description="No completed cycle"

          icon="◎"

        />


        {/* SSR RUNTIME */}

        <PerformanceCard

          title="SSR Runtime"

          value="--"

          description="No machine activity history"

          icon="⚡"

        />

      </div>



      {/* =====================================
          ALERTS & ANOMALIES
      ===================================== */}

      <div className="card analytics-anomalies">


        <div className="analytics-card-header">

          <div>

            <h3>

              Alerts & System Anomalies

            </h3>


            <p className="muted">

              Temperature, sensor, device,
              and drying cycle anomalies.

            </p>

          </div>

        </div>


        <div className="anomaly-grid">


          <AnomalyItem

            label="Critical"

            value="--"

          />


          <AnomalyItem

            label="Warnings"

            value="--"

          />


          <AnomalyItem

            label="Information"

            value="--"

          />

        </div>


        <div className="anomaly-empty-message">

          No alert history is currently loaded.
          Real SmartChip alerts will appear here
          when the alert system is connected.

        </div>

      </div>



      {/* =====================================
          ANALYTICS INFORMATION
      ===================================== */}

      <div className="card analytics-info-card">


        <h3>

          Analytics Data Status

        </h3>


        <div className="analytics-info-grid">


          <InfoItem

            title="Live Device Data"

            value={
              device.online
                ? "Connected"
                : device.exists
                ? "Offline"
                : "Waiting"
            }

          />


          <InfoItem

            title="Historical Telemetry"

            value="Not Available"

          />


          <InfoItem

            title="Drying Run Analytics"

            value="Not Available"

          />


          <InfoItem

            title="Alert Analytics"

            value="Not Available"

          />

        </div>


        <p className="analytics-info-message">

          SmartChip analytics will automatically
          expand as real ESP32 telemetry,
          drying run history, and alerts are
          stored in Firestore.

        </p>


      </div>


    </div>

  );

}



/* =========================================
   ANALYTICS SUMMARY CARD
========================================= */

function AnalyticsCard({

  icon,

  title,

  value,

  description,

  status,

}) {

  return (

    <div className="card analytics-summary-card">


      <div className="analytics-summary-top">

        <span className="analytics-summary-icon">

          {icon}

        </span>


        <span
          className={`analytics-summary-status ${

            status

          }`}
        >

          {status === "available"
            ? "Available"
            : "Waiting"}

        </span>

      </div>


      <h4>

        {title}

      </h4>


      <div className="analytics-summary-value">

        {value}

      </div>


      <p>

        {description}

      </p>


    </div>

  );

}



/* =========================================
   CHART PLACEHOLDER
========================================= */

function AnalyticsChartPlaceholder({

  type,

  device,

  hasData,

}) {

  /*
   * This is intentionally an empty
   * analytics state until real telemetry
   * history is implemented.
   */

  if (!hasData) {

    return (

      <div className="analytics-chart-empty">


        <div className="chart-empty-icon">

          {type === "temperature"
            ? "🌡"
            : "💧"}

        </div>


        <h3>

          No {type} history available

        </h3>


        <p>

          {device.online
            ? "SmartChip is online. Historical data will appear as telemetry is collected."
            : "Waiting for the SmartChip device to provide telemetry."}

        </p>


      </div>

    );

  }


  /*
   * Future telemetry data.
   *
   * A real Chart.js implementation
   * will be connected here.
   */

  return (

    <div className="analytics-chart-empty">

      <div className="chart-empty-icon">

        📊

      </div>


      <h3>

        Chart data detected

      </h3>


      <p>

        Historical telemetry is available.
        Chart rendering will be connected
        to the telemetry service.

      </p>

    </div>

  );

}



/* =========================================
   SENSOR COMPARISON ROW
========================================= */

function ComparisonRow({

  metric,

  sensor1,

  sensor2,

  statusRow = false,

}) {

  return (

    <div
      className={`comparison-row ${

        statusRow
          ? "comparison-status-row"
          : ""

      }`}
    >

      <span>

        {metric}

      </span>


      <span>

        {sensor1}

      </span>


      <span>

        {sensor2}

      </span>

    </div>

  );

}



/* =========================================
   PERFORMANCE CARD
========================================= */

function PerformanceCard({

  title,

  value,

  description,

  icon,

}) {

  return (

    <div className="card performance-card">


      <div className="performance-icon">

        {icon}

      </div>


      <h4>

        {title}

      </h4>


      <div className="performance-value">

        {value}

      </div>


      <p>

        {description}

      </p>


    </div>

  );

}



/* =========================================
   ANOMALY ITEM
========================================= */

function AnomalyItem({

  label,

  value,

}) {

  return (

    <div className="anomaly-item">


      <span>

        {label}

      </span>


      <strong>

        {value}

      </strong>


    </div>

  );

}



/* =========================================
   INFO ITEM
========================================= */

function InfoItem({

  title,

  value,

}) {

  return (

    <div className="analytics-info-item">


      <span>

        {title}

      </span>


      <strong>

        {value}

      </strong>


    </div>

  );

}