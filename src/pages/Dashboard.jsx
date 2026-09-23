import "../styles/dashboard.css";

import {
  useEffect,
  useRef,
} from "react";

import {
  Chart,
  registerables,
} from "chart.js";

import useDeviceStatus from "../hooks/useDeviceStatus";

import DeviceStatus from "../components/DeviceStatus";

import MachineControls from "../components/MachineControls";

import SensorStatus from "../components/SensorStatus";


Chart.register(...registerables);


export default function Dashboard() {

  const {

    device,

    startDrying,

    stopDrying,

    setTargetTemperature,

    remainingTime,

  } = useDeviceStatus();


  const sensorChartRef =
    useRef(null);


  const chartInstance =
    useRef(null);


  /* =========================================
     SAFE DISPLAY VALUES
  ========================================= */

  const temperatureText =
    Number.isFinite(
      Number(device.temperature)
    )
      ? `${Number(
          device.temperature
        ).toFixed(1)}°C`
      : "--";


  const humidityText =
    Number.isFinite(
      Number(device.humidity)
    )
      ? `${Number(
          device.humidity
        ).toFixed(1)}%`
      : "--";


  const targetTemperatureText =
    Number.isFinite(
      Number(device.targetTemperature)
    )
      ? `${Number(
          device.targetTemperature
        ).toFixed(0)}°C`
      : "--";


  /* =========================================
     CHART
  ========================================= */

  useEffect(() => {

    if (!sensorChartRef.current) {
      return undefined;
    }


    if (chartInstance.current) {

      chartInstance.current.destroy();

      chartInstance.current = null;

    }


    const hasChartData =
      device.chart &&
      Array.isArray(
        device.chart.labels
      ) &&
      device.chart.labels.length > 0;


    chartInstance.current =
      new Chart(
        sensorChartRef.current,
        {

          type: "line",


          data: {

            labels:
              hasChartData
                ? device.chart.labels
                : [],


            datasets: [

              {

                label:
                  "Temperature (°C)",


                data:
                  hasChartData
                    ? device.chart.temperature
                    : [],


                borderColor:
                  "#0f172a",


                backgroundColor:
                  "rgba(15,23,42,0.08)",


                tension: 0.4,


                fill: true,


                yAxisID:
                  "temperature",

              },


              {

                label:
                  "Humidity (%)",


                data:
                  hasChartData
                    ? device.chart.humidity
                    : [],


                borderColor:
                  "#3b82f6",


                backgroundColor:
                  "rgba(59,130,246,0.08)",


                tension: 0.4,


                fill: true,


                yAxisID:
                  "humidity",

              },

            ],

          },


          options: {

            responsive: true,


            maintainAspectRatio: false,


            interaction: {

              mode: "index",

              intersect: false,

            },


            plugins: {

              legend: {

                position: "top",

              },

            },


            scales: {

              x: {

                grid: {

                  display: false,

                },

              },


              temperature: {

                type: "linear",

                position: "left",


                title: {

                  display: true,

                  text:
                    "Temperature (°C)",

                },

              },


              humidity: {

                type: "linear",

                position: "right",


                grid: {

                  drawOnChartArea: false,

                },


                title: {

                  display: true,

                  text:
                    "Humidity (%)",

                },

              },

            },

          },

        }
      );


    return () => {

      if (chartInstance.current) {

        chartInstance.current.destroy();

        chartInstance.current = null;

      }

    };

  }, [device.chart]);


  /* =========================================
     RENDER
  ========================================= */

  return (

    <div
      className="page-container dashboard"
    >


      {/* ================= HEADER ================= */}

      <div className="dashboard-header">

        <div>

          <div className="dashboard-label">

            SMARTCHIP MONITORING

          </div>


          <h1>

            SmartChip Dehydrator

          </h1>


          <p className="muted">

            Monitor and control your
            mushroom drying system

          </p>

        </div>

      </div>


      {/* ================= DEVICE STATUS ================= */}

      <DeviceStatus
        device={device}
      />


      {/* ================= TOP STATS ================= */}

      <div
        className="grid dashboard-top"
      >


        {/* TEMPERATURE */}

        <div className="card stat-card">

          <h3>

            🌡 Temperature

          </h3>


          <div className="value">

            {temperatureText}

          </div>


          <div className="muted">

            Target:{" "}

            {targetTemperatureText}

          </div>


          <span
            className={`badge ${
              device.online
                ? "success"
                : "info"
            }`}
          >

            {device.online
              ? device.temperatureStatus
              : "Waiting"}

          </span>

        </div>


        {/* HUMIDITY */}

        <div className="card stat-card">

          <h3>

            💧 Humidity

          </h3>


          <div className="value">

            {humidityText}

          </div>


          <div className="muted">

            Relative humidity

          </div>


          <span
            className={`badge ${
              device.online
                ? "success"
                : "info"
            }`}
          >

            {device.online
              ? device.sensorStatus
              : "Waiting"}

          </span>

        </div>


        {/* SSR */}

        <div className="card stat-card">

          <h3>

            ⚡ SSR

          </h3>


          <div className="value">

            {device.online
              ? device.ssr
                ? "ON"
                : "OFF"
              : "--"}

          </div>


          <div className="muted">

            Main output control

          </div>


          <span
            className={`badge ${
              device.ssr &&
              device.online
                ? "success"
                : "info"
            }`}
          >

            {device.online
              ? device.ssr
                ? "Active"
                : "Inactive"
              : "Waiting"}

          </span>

        </div>


        {/* HEATER + FAN */}

        <div className="card stat-card">

          <h3>

            🔥 Heater & 🌀 Fan

          </h3>


          <div className="value">

            {device.online
              ? device.ssr
                ? "ON"
                : "OFF"
              : "--"}

          </div>


          <div className="muted">

            Controlled by main SSR

          </div>


          <span
            className={`badge ${
              device.ssr &&
              device.online
                ? "success"
                : "info"
            }`}
          >

            {device.online
              ? device.ssr
                ? "Running"
                : "Stopped"
              : "Waiting"}

          </span>

        </div>


      </div>


      {/* ================= SENSOR CHART ================= */}

      <div
        className="card dashboard-chart"
      >

        <div className="chart-header">

          <div>

            <h3>

              Temperature & Humidity Trend

            </h3>


            <p className="muted">

              SmartChip telemetry history

            </p>

          </div>

        </div>


        {device.online ? (

          <div className="chart-container">

            <canvas
              ref={sensorChartRef}
            />

          </div>

        ) : (

          <div className="chart-waiting">

            <div className="chart-waiting-icon">

              📡

            </div>


            <h3>

              Waiting for device data

            </h3>


            <p>

              The chart will automatically
              display telemetry when
              SMARTCHIP-ESP32-01 connects.

            </p>

          </div>

        )}

      </div>


      {/* ================= MACHINE CONTROLS ================= */}

      <MachineControls

        device={device}

        remainingTime={remainingTime}

        startDrying={startDrying}

        stopDrying={stopDrying}

        setTargetTemperature={
          setTargetTemperature
        }

      />


      {/* ================= SENSOR STATUS ================= */}

      <SensorStatus
        device={device}
      />


      {/* ================= SYSTEM INFORMATION ================= */}

      <div
        className="card dashboard-alerts"
      >

        <h3>

          System Information

        </h3>


        {!device.exists && (

          <div className="alert info-alert">

            <div className="alert-title">

              Waiting for Device

            </div>


            <div className="alert-desc">

              SMARTCHIP-ESP32-01 has not
              connected to Firestore yet.
              Dashboard controls and live
              telemetry will become
              available automatically when
              the device connects.

            </div>

          </div>

        )}


        {device.exists &&
          !device.online && (

          <div className="alert">

            <div className="alert-title">

              Device Offline

            </div>


            <div className="alert-desc">

              The device exists but has not
              sent a recent heartbeat.

            </div>

          </div>

        )}


        {device.online && (

          <div className="alert info-alert">

            <div className="alert-title">

              Device Connected

            </div>


            <div className="alert-desc">

              SmartChip is receiving live
              telemetry from the ESP32.

            </div>

          </div>

        )}


        {/* MACHINE STATE */}

        <div className="alert">

          <div className="alert-title">

            Machine State

          </div>


          <div className="alert-desc">

            Current state:{" "}

            <strong>

              {device.state}

            </strong>

          </div>

        </div>


        {/* ALERT PLACEHOLDER */}

        <div className="alert">

          <div className="alert-title">

            System Alerts

          </div>


          <div className="alert-desc">

            No active alerts.

          </div>

        </div>


      </div>


    </div>

  );

}