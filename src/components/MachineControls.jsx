import {
  MACHINE_STATES,
} from "../services/device";


export default function MachineControls({

  device,

  remainingTime,

  startDrying,

  stopDrying,

  setTargetTemperature,

}) {


  const isRunning =

    device.state ===
      MACHINE_STATES.PREHEATING ||

    device.state ===
      MACHINE_STATES.DRYING;


  const controlsDisabled =
    !device.online;


  const progress =

    device.durationSeconds > 0

      ? Math.min(

          100,

          Math.max(

            0,

            (

              (

                device.durationSeconds -

                device.remainingSeconds

              ) /

              device.durationSeconds

            ) * 100

          )

        )

      : 0;


  return (

    <>


      {/* ================= MACHINE CONTROL ================= */}

      <div
        className={`grid two dashboard-controls ${
          controlsDisabled
            ? "controls-disabled"
            : ""
        }`}
      >


        {/* DRYING CONTROL */}

        <div className="card control-card">

          <h3>

            Drying Control

          </h3>


          <p className="muted">

            {!device.online

              ? "Controls will become available when the device is online."

              : "Start or stop the SmartChip drying cycle."

            }

          </p>


          <div className="machine-state">

            {device.online
              ? device.state
              : "WAITING FOR DEVICE"}

          </div>


          <div className="control-buttons">


            <button

              type="button"

              className="control-button start-button"

              onClick={startDrying}

              disabled={
                controlsDisabled ||
                isRunning
              }

            >

              START

            </button>


            <button

              type="button"

              className="control-button stop-button"

              onClick={stopDrying}

              disabled={
                controlsDisabled ||
                !isRunning
              }

            >

              STOP

            </button>


          </div>


        </div>


        {/* ================= TARGET TEMPERATURE ================= */}

        <div className="card control-card">

          <h3>

            Target Temperature

          </h3>


          <p className="muted">

            Set the desired drying temperature.

          </p>


          <div className="value">

            {Number.isFinite(
              Number(device.targetTemperature)
            )
              ? `${device.targetTemperature}°C`
              : "--"
            }

          </div>


          <input

            type="range"

            min="30"

            max="80"

            step="1"

            value={
              Number.isFinite(
                Number(device.targetTemperature)
              )
                ? device.targetTemperature
                : 55
            }

            disabled={controlsDisabled}

            onChange={(event) =>

              setTargetTemperature(
                event.target.value
              )

            }

          />


          <div className="range">

            <span>

              30°C

            </span>


            <span>

              80°C

            </span>

          </div>


        </div>


      </div>


      {/* ================= PROGRESS ================= */}

      <div
        className={`card control-card ${
          controlsDisabled
            ? "controls-disabled"
            : ""
        }`}
      >

        <h3>

          Drying Progress

        </h3>


        <p className="muted">

          {device.online

            ? "Current drying cycle"

            : "Waiting for device"

          }

        </p>


        <div className="value">

          {device.online
            ? remainingTime
            : "--:--:--"}

        </div>


        <div className="progress">

          <div

            className="fill"

            style={{
              width:
                `${progress}%`,
            }}

          />

        </div>


        <p className="muted progress-text">

          {device.online

            ? `${Math.round(
                progress
              )}% complete`

            : "No active device cycle"

          }

        </p>


      </div>


    </>

  );

}