import React, {
useEffect,
useMemo,
useState,
} from "react";

import "../styles/scheduler.css";

import { useAuth } from "../context/AuthContext";

import {
startDryingRun,
subscribeToDryingRuns,
subscribeToDevice,
cancelDryingRun,
recoverStuckDryingRun,
} from "../services/dryingRunService";

import {
collection,
getDocs,
query,
where,
} from "firebase/firestore";

import { db } from "../firebase";

/* =====================================================
VALIDATION CONSTANTS
===================================================== */

const MIN_TARGET_TEMP = 30;

const MAX_TARGET_TEMP = 75;

const MIN_DURATION_HOURS = 0.1;

const MAX_DURATION_HOURS = 168;

/* =====================================================
DEVICE OFFLINE TIMEOUT
===================================================== */

const DEVICE_OFFLINE_TIMEOUT_MS =
60 * 1000;

/* =====================================================
ACTIVE RUN STATUSES

These are valid statuses for a dryingRuns document
while it is actively controlled by SmartChip.
===================================================== */

const ACTIVE_RUN_STATUSES = [

"starting",

"preheating",

"drying",

];

/* =====================================================
COMPONENT
===================================================== */

export default function Scheduler() {

const {
user,
isOperator,
isAdministrator,
} = useAuth();

/* =====================================================
STATE
===================================================== */

const [batches, setBatches] =
useState([]);

const [dryingRuns, setDryingRuns] =
useState([]);

const [device, setDevice] =
useState(null);

const [loading, setLoading] =
useState(true);

const [deviceLoading, setDeviceLoading] =
useState(true);

const [submitting, setSubmitting] =
useState(false);

const [recovering, setRecovering] =
useState(false);

const [error, setError] =
useState("");

const [success, setSuccess] =
useState("");

const [currentTime, setCurrentTime] =
useState(Date.now());

const [form, setForm] =
useState({
batchId: "",
durationHours: "",
targetTemp: "",
});

/* =====================================================
PERMISSION
===================================================== */

const canSchedule =
Boolean(
isOperator ||
isAdministrator
);

/* =====================================================
LOCAL CLOCK
===================================================== */

useEffect(() => {


const interval =
  setInterval(
    () => {

      setCurrentTime(
        Date.now()
      );

    },
    1000
  );


return () => {

  clearInterval(
    interval
  );

};


}, []);

/* =====================================================
LOAD FRESH INVENTORY
===================================================== */

const loadFreshBatches =
async () => {


  const batchesQuery =
    query(

      collection(
        db,
        "inventory"
      ),

      where(
        "status",
        "==",
        "Fresh"
      )

    );


  const snapshot =
    await getDocs(
      batchesQuery
    );


  return snapshot.docs.map(
    (batchDoc) => ({

      id:
        batchDoc.id,

      ...batchDoc.data(),

    })
  );

};


/* =====================================================
INITIAL LOAD
===================================================== */

useEffect(() => {


let cancelled = false;


async function loadBatches() {

  setLoading(
    true
  );


  try {

    const data =
      await loadFreshBatches();


    if (
      cancelled
    ) {

      return;

    }


    setBatches(
      data
    );

  } catch (err) {

    console.error(
      "Failed to load fresh inventory:",
      err
    );


    if (
      !cancelled
    ) {

      setError(
        err?.message ||
        "Unable to load fresh inventory batches."
      );

    }

  } finally {

    if (
      !cancelled
    ) {

      setLoading(
        false
      );

    }

  }

}


loadBatches();


return () => {

  cancelled = true;

};


}, []);

/* =====================================================
RELOAD FRESH BATCHES
===================================================== */

const reloadFreshBatches =
async () => {


  try {

    const data =
      await loadFreshBatches();


    setBatches(
      data
    );

  } catch (err) {

    console.error(
      "Failed to refresh batches:",
      err
    );

  }

};


/* =====================================================
REAL-TIME DEVICE
===================================================== */

useEffect(() => {


setDeviceLoading(
  true
);


const unsubscribe =
  subscribeToDevice(

    (deviceData) => {

      setDevice(
        deviceData || null
      );


      setDeviceLoading(
        false
      );

    },

    (err) => {

      console.error(
        "Device subscription error:",
        err
      );


      setDeviceLoading(
        false
      );


      setError(
        err?.message ||
        "Unable to load SmartChip device status."
      );

    }

  );


return () => {

  if (
    typeof unsubscribe ===
    "function"
  ) {

    unsubscribe();

  }

};


}, []);

/* =====================================================
REAL-TIME DRYING RUNS
===================================================== */

useEffect(() => {


const unsubscribe =
  subscribeToDryingRuns(

    (runs) => {

      setDryingRuns(
        Array.isArray(runs)
          ? runs
          : []
      );

    },

    (err) => {

      console.error(
        "Drying run subscription error:",
        err
      );


      setError(
        err?.message ||
        "Unable to load drying runs."
      );

    }

  );


return () => {

  if (
    typeof unsubscribe ===
    "function"
  ) {

    unsubscribe();

  }

};


}, []);

/* =====================================================
DEVICE ONLINE STATUS
===================================================== */

const deviceOnline =
useMemo(() => {

  if (
    !device
  ) {

    return false;

  }


  /*
    Explicit online field.
  */

  if (
    typeof device.online ===
    "boolean"
  ) {

    return device.online;

  }


  if (
    typeof device.isOnline ===
    "boolean"
  ) {

    return device.isOnline;

  }


  /*
    Fallback to heartbeat.
  */

  if (
    device.lastSeen
  ) {

    let lastSeenDate =
      null;


    if (
      typeof device.lastSeen?.toDate ===
      "function"
    ) {

      lastSeenDate =
        device.lastSeen.toDate();

    } else {

      const parsedDate =
        new Date(
          device.lastSeen
        );


      if (
        !Number.isNaN(
          parsedDate.getTime()
        )
      ) {

        lastSeenDate =
          parsedDate;

      }

    }


    if (
      lastSeenDate
    ) {

      const age =
        currentTime -
        lastSeenDate.getTime();


      return (

        age >= 0 &&

        age <=
        DEVICE_OFFLINE_TIMEOUT_MS

      );

    }

  }


  return false;

}, [

  device,

  currentTime,

]);

/* =====================================================
DEVICE STATUS TEXT
===================================================== */

const deviceStatusText =
useMemo(() => {


  if (
    deviceLoading
  ) {

    return "Checking device connection...";

  }


  if (
    !device
  ) {

    return "SmartChip device is unavailable.";

  }


  if (
    deviceOnline
  ) {

    return "SmartChip device is online.";

  }


  return "SmartChip device is offline.";

}, [

  device,

  deviceLoading,

  deviceOnline,

]);


/* =====================================================
ACTIVE RUN


 IMPORTANT:

 devices.activeRunId is the ONLY authoritative
 source for determining the currently active run.

 No fallback query is allowed here.

 If activeRunId is null, there is NO active run.

===================================================== */

const activeRun =
useMemo(() => {


  const activeRunId =
    device?.activeRunId;


  if (

    typeof activeRunId !==
    "string" ||

    activeRunId.trim().length ===
    0

  ) {

    return null;

  }


  const run =
    dryingRuns.find(
      (item) =>
        item.id ===
        activeRunId
    );


  if (
    !run
  ) {

    return null;

  }


  /*
    Safety validation.

    Device should never point to a terminal run.
  */

  if (

    !ACTIVE_RUN_STATUSES.includes(
      run.status
    )

  ) {

    return null;

  }


  return run;

}, [

  device?.activeRunId,

  dryingRuns,

]);


/* =====================================================
ORPHANED ACTIVE RUN REFERENCE


 Device has activeRunId but:

 - Run is not loaded yet
 OR
 - Run has invalid/terminal status.

 This prevents the Scheduler from pretending an
 old historical run is active.


===================================================== */

const activeRunReferenceExists =
Boolean(
device?.activeRunId
);

const hasOrphanedRunReference =
Boolean(


  activeRunReferenceExists &&

  !activeRun

);


/* =====================================================
DEVICE BUSY


 Device document is authoritative.


===================================================== */

const deviceBusy =
Boolean(


  device?.activeRunId ||

  device?.activeBatchId ||

  device?.command ||

  (

    device?.machineStatus &&

    device.machineStatus !==
    "idle"

  )

);


/* =====================================================
PENDING COMMAND
===================================================== */

const hasPendingCommand =
Boolean(
device?.command
);

/* =====================================================
RECOVERY MODE
===================================================== */

const recoveryMode =
Boolean(


  !deviceLoading &&

  !deviceOnline &&

  device &&

  (

    hasPendingCommand ||

    device?.activeRunId ||

    device?.activeBatchId ||

    (

      device?.machineStatus &&

      device.machineStatus !==
      "idle"

    )

  )

);

/* =====================================================
FORM HANDLER
===================================================== */

const handleChange =
(event) => {


  const {
    name,
    value,
  } = event.target;


  setForm(
    (previous) => ({

      ...previous,

      [name]:
        value,

    })
  );


  if (
    error
  ) {

    setError("");

  }


  if (
    success
  ) {

    setSuccess("");

  }

};


/* =====================================================
START DRYING RUN
===================================================== */

const handleStartDrying =
async (event) => {


  event.preventDefault();


  setError("");

  setSuccess("");


  if (
    !canSchedule
  ) {

    setError(
      "You do not have permission to start drying runs."
    );

    return;

  }


  if (
    !user?.uid
  ) {

    setError(
      "Your account session is unavailable."
    );

    return;

  }


  if (
    deviceLoading
  ) {

    setError(
      "SmartChip device status is still loading."
    );

    return;

  }


  if (
    !deviceOnline
  ) {

    setError(
      "SmartChip ESP32 is offline. Connect the device before starting a drying run."
    );

    return;

  }


  if (
    deviceBusy
  ) {

    setError(
      "SmartChip already has an active operation, machine lock, or pending command."
    );

    return;

  }


  if (
    !form.batchId
  ) {

    setError(
      "Please select a Fresh inventory batch."
    );

    return;

  }


  const selectedBatch =
    batches.find(
      (batch) =>
        batch.id ===
        form.batchId
    );


  if (
    !selectedBatch
  ) {

    setError(
      "Selected inventory batch was not found. Please refresh and try again."
    );

    return;

  }


  const durationHours =
    Number(
      form.durationHours
    );


  const targetTemp =
    Number(
      form.targetTemp
    );


  if (

    !Number.isFinite(
      durationHours
    ) ||

    durationHours <
    MIN_DURATION_HOURS ||

    durationHours >
    MAX_DURATION_HOURS

  ) {

    setError(
      `Drying duration must be between ${MIN_DURATION_HOURS} and ${MAX_DURATION_HOURS} hours.`
    );

    return;

  }


  if (

    !Number.isFinite(
      targetTemp
    ) ||

    targetTemp <
    MIN_TARGET_TEMP ||

    targetTemp >
    MAX_TARGET_TEMP

  ) {

    setError(
      `Target temperature must be between ${MIN_TARGET_TEMP}°C and ${MAX_TARGET_TEMP}°C.`
    );

    return;

  }


  const confirmed =
    window.confirm(

      `Start drying batch ${selectedBatch.batchNumber}?\n\n` +

      `Target Temperature: ${targetTemp}°C\n` +

      `Duration: ${durationHours} hours\n\n` +

      "A START command will be sent to the SmartChip ESP32."

    );


  if (
    !confirmed
  ) {

    return;

  }


  try {

    setSubmitting(
      true
    );


    const result =
      await startDryingRun({

        batchId:
          form.batchId,

        targetTemp,

        durationHours,

        createdBy:
          user.uid,

      });


    setSuccess(
      `START command sent for batch ${selectedBatch.batchNumber}. Waiting for ESP32 confirmation.`
    );


    setForm({

      batchId: "",

      durationHours: "",

      targetTemp: "",

    });


    await reloadFreshBatches();


    console.log(
      "Drying run started:",
      result
    );

  } catch (err) {

    console.error(
      "Failed to start drying:",
      err
    );


    setError(

      err?.message ||

      "Failed to start drying run."

    );

  } finally {

    setSubmitting(
      false
    );

  }

};


/* =====================================================
NORMAL STOP
===================================================== */

const handleCancel =
async () => {


  if (
    !activeRun
  ) {

    setError(
      "There is no active drying run assigned to the SmartChip device."
    );

    return;

  }


  if (
    !canSchedule
  ) {

    setError(
      "You do not have permission to stop drying runs."
    );

    return;

  }


  if (
    !deviceOnline
  ) {

    setError(
      "The ESP32 is offline. Use Recovery Mode instead of sending a normal STOP command."
    );

    return;

  }


  if (
    hasPendingCommand
  ) {

    setError(
      `A ${device.command} command is already pending. Wait for ESP32 confirmation.`
    );

    return;

  }


  const confirmed =
    window.confirm(

      `Stop drying batch ${activeRun.batchNumber}?\n\n` +

      "A STOP command will be sent to the ESP32.\n\n" +

      "The machine will remain locked until the ESP32 confirms that the hardware has stopped."

    );


  if (
    !confirmed
  ) {

    return;

  }


  setError("");

  setSuccess("");


  try {

    setSubmitting(
      true
    );


    const result =
      await cancelDryingRun(
        activeRun.id
      );


    setSuccess(
      `STOP command sent for batch ${activeRun.batchNumber}. Waiting for ESP32 confirmation.`
    );


    console.log(
      "Stop command sent:",
      result
    );

  } catch (err) {

    console.error(
      "Failed to stop drying:",
      err
    );


    setError(

      err?.message ||

      "Failed to send STOP command."

    );

  } finally {

    setSubmitting(
      false
    );

  }

};

/* =====================================================
RECOVERY MODE
===================================================== */

const handleRecovery =
async () => {


  if (
    !canSchedule
  ) {

    setError(
      "You do not have permission to recover the SmartChip device."
    );

    return;

  }


  if (
    deviceOnline
  ) {

    setError(
      "Recovery Mode is only available while the ESP32 is offline. Use normal Stop Drying while the device is online."
    );

    return;

  }


  const confirmed =
    window.confirm(

      "RECOVERY MODE\n\n" +

      "This will clear the stale SmartChip machine state from Firestore.\n\n" +

      "If an active drying run exists:\n" +

      "- The drying run will be cancelled\n" +

      "- The inventory batch will return to Fresh\n" +

      "- Pending commands will be cleared\n" +

      "- Machine locks will be removed\n\n" +

      "IMPORTANT:\n" +

      "Only continue after confirming that the physical heater and fan are safely stopped.\n\n" +

      "Continue with recovery?"

    );


  if (
    !confirmed
  ) {

    return;

  }


  setError("");

  setSuccess("");


  try {

    setRecovering(
      true
    );


    const result =
      await recoverStuckDryingRun();


    setSuccess(
      "SmartChip recovery completed successfully. The stale machine lock and command were cleared."
    );


    await reloadFreshBatches();


    console.log(
      "Recovery completed:",
      result
    );

  } catch (err) {

    console.error(
      "Recovery failed:",
      err
    );


    setError(

      err?.message ||

      "Failed to recover the SmartChip device."

    );

  } finally {

    setRecovering(
      false
    );

  }

};


/* =====================================================
GET START DATE
===================================================== */

const getStartDate =
(run) => {


  if (
    !run?.actualStartTime
  ) {

    return null;

  }


  if (
    typeof run.actualStartTime?.toDate ===
    "function"
  ) {

    return (
      run.actualStartTime.toDate()
    );

  }


  const date =
    new Date(
      run.actualStartTime
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null;

  }


  return date;

};


/* =====================================================
PROGRESS
===================================================== */

const getProgress =
() => {


  if (
    !activeRun
  ) {

    return 0;

  }


  const start =
    getStartDate(
      activeRun
    );


  if (
    !start
  ) {

    return 0;

  }


  const durationMs =
    Number(
      activeRun.durationHours
    ) *

    60 *
    60 *
    1000;


  if (

    !Number.isFinite(
      durationMs
    ) ||

    durationMs <= 0

  ) {

    return 0;

  }


  const elapsed =
    Math.max(

      currentTime -
      start.getTime(),

      0

    );


  return Math.min(

    Math.max(

      (
        elapsed /
        durationMs
      ) * 100,

      0

    ),

    100

  );

};


/* =====================================================
REMAINING TIME
===================================================== */

const getRemainingTime =
() => {


  if (
    !activeRun
  ) {

    return "--:--:--";

  }


  const start =
    getStartDate(
      activeRun
    );


  if (
    !start
  ) {

    return "Waiting";

  }


  const durationMs =
    Number(
      activeRun.durationHours
    ) *

    60 *
    60 *
    1000;


  if (

    !Number.isFinite(
      durationMs
    ) ||

    durationMs <= 0

  ) {

    return "--:--:--";

  }


  const endTime =
    start.getTime() +
    durationMs;


  const remainingMs =
    Math.max(

      endTime -
      currentTime,

      0

    );


  const totalSeconds =
    Math.floor(
      remainingMs / 1000
    );


  const hours =
    Math.floor(
      totalSeconds / 3600
    );


  const minutes =
    Math.floor(

      (
        totalSeconds % 3600
      ) / 60

    );


  const seconds =
    totalSeconds % 60;


  return [

    String(hours).padStart(
      2,
      "0"
    ),

    String(minutes).padStart(
      2,
      "0"
    ),

    String(seconds).padStart(
      2,
      "0"
    ),

  ].join(":");

};


/* =====================================================
FORMAT STATUS
===================================================== */

const formatStatus =
(status) => {


  switch (
    status
  ) {

    case "starting":
      return "Starting";

    case "preheating":
      return "Preheating";

    case "drying":
      return "Drying";

    case "completed":
      return "Completed";

    case "failed":
      return "Failed";

    case "cancelled":
      return "Cancelled";

    case "idle":
      return "Idle";

    case "stopped":
      return "Stopped";

    case "fault":
      return "Fault";

    default:
      return (
        status ||
        "Unknown"
      );

  }

};


/* =====================================================
FORMAT DATE
===================================================== */

const formatDate =
(value) => {


  if (
    !value
  ) {

    return "Not available";

  }


  try {

    const date =
      typeof value?.toDate ===
      "function"

        ? value.toDate()

        : new Date(
          value
        );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "Not available";

    }


    return (
      date.toLocaleString()
    );

  } catch {

    return "Not available";

  }

};


/* =====================================================
LIVE DEVICE VALUES
===================================================== */

const currentTemperature =
device?.currentTemp ??
activeRun?.currentTemp ??
"--";

const currentHumidity =
device?.currentHumidity ??
activeRun?.currentHumidity ??
"--";

const heaterState =
device?.heaterState ??
activeRun?.heaterState ??
"OFF";

const fanState =
device?.fanState ??
activeRun?.fanState ??
"OFF";

/* =====================================================
RENDER
===================================================== */

return (


<div className="page-container">

  <h2 className="page-title">
    Drying Control
  </h2>


  {/* ===============================================
      DEVICE STATUS
  =============================================== */}

  <div className="card">

    <div className="section-header">

      <h3>
        SmartChip Device Status
      </h3>

    </div>


    <div className="info-grid">

      <div>

        <span className="label">
          Connection
        </span>

        <span className="value">

          {deviceLoading
            ? "Checking..."
            : deviceOnline
              ? "Online"
              : "Offline"}

        </span>

      </div>


      <div>

        <span className="label">
          Machine Status
        </span>

        <span className="value">

          {formatStatus(
            device?.machineStatus
          )}

        </span>

      </div>


      <div>

        <span className="label">
          Pending Command
        </span>

        <span className="value">

          {device?.command ||
            "None"}

        </span>

      </div>


      <div>

        <span className="label">
          Heater
        </span>

        <span className="value">

          {heaterState}

        </span>

      </div>


      <div>

        <span className="label">
          Fan
        </span>

        <span className="value">

          {fanState}

        </span>

      </div>


      {device?.activeRunId && (

        <div>

          <span className="label">
            Active Run ID
          </span>

          <span className="value">

            {device.activeRunId}

          </span>

        </div>

      )}


      {device?.lastSeen && (

        <div>

          <span className="label">
            Last Seen
          </span>

          <span className="value">

            {formatDate(
              device.lastSeen
            )}

          </span>

        </div>

      )}

    </div>


    <p className="muted">

      {deviceStatusText}

    </p>

  </div>


  {error && (

    <div
      className="error-message"
      role="alert"
    >

      {error}

    </div>

  )}


  {success && (

    <div
      className="success-message"
      role="status"
    >

      {success}

    </div>

  )}


  {/* ===============================================
      RECOVERY MODE
  =============================================== */}

  {recoveryMode && (

    <div className="card active-card">

      <div className="section-header">

        <h3>
          Recovery Mode
        </h3>

      </div>


      <p>

        SmartChip has stale machine state in
        Firestore, but the ESP32 is currently
        offline.

      </p>


      <div
        className="error-message"
        role="alert"
      >

        Only use recovery after confirming
        that the physical heater and fan are
        safely stopped.

      </div>


      <button
        type="button"
        className="cancel-btn"
        onClick={
          handleRecovery
        }
        disabled={
          recovering ||
          submitting
        }
      >

        {recovering
          ? "Recovering..."
          : "Cancel and Recover"}

      </button>

    </div>

  )}


  {/* ===============================================
      ACTIVE DRYING RUN

      Only displayed when devices.activeRunId
      points to a valid active run.
  =============================================== */}

  {!recoveryMode &&
    activeRun && (

      <div className="card active-card">

        <div className="section-header">

          <h3>
            Active Drying Run
          </h3>

        </div>


        <div className="info-grid">

          <div>

            <span className="label">
              Batch
            </span>

            <span className="value">

              {activeRun.batchNumber}

            </span>

          </div>


          <div>

            <span className="label">
              Status
            </span>

            <span className="value">

              {formatStatus(
                activeRun.status
              )}

            </span>

          </div>


          <div>

            <span className="label">
              Target Temperature
            </span>

            <span className="value">

              {activeRun.targetTemp} °C

            </span>

          </div>


          <div>

            <span className="label">
              Duration
            </span>

            <span className="value">

              {activeRun.durationHours} hours

            </span>

          </div>


          <div>

            <span className="label">
              Remaining Time
            </span>

            <span className="value">

              {getRemainingTime()}

            </span>

          </div>


          <div>

            <span className="label">
              Heater
            </span>

            <span className="value">

              {heaterState}

            </span>

          </div>


          <div>

            <span className="label">
              Fan
            </span>

            <span className="value">

              {fanState}

            </span>

          </div>


          <div>

            <span className="label">
              Started
            </span>

            <span className="value">

              {formatDate(
                activeRun.actualStartTime
              )}

            </span>

          </div>

        </div>


        <div className="progress-container">

          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{

                width:
                  `${getProgress()}%`,

              }}
            />

          </div>


          <div className="progress-text">

            {getProgress().toFixed(1)}

            %

            {" "}

            Complete

          </div>

        </div>


        <div className="info-grid">

          <div>

            <span className="label">
              Current Temperature
            </span>

            <span className="value">

              {currentTemperature}

              °C

            </span>

          </div>


          <div>

            <span className="label">
              Current Humidity
            </span>

            <span className="value">

              {currentHumidity}

              %

            </span>

          </div>

        </div>


        <button
          type="button"
          className="cancel-btn"
          onClick={
            handleCancel
          }
          disabled={

            submitting ||

            !deviceOnline ||

            hasPendingCommand

          }
        >

          {submitting
            ? "Processing..."
            : hasPendingCommand
              ? `${device.command} Pending`
              : !deviceOnline
                ? "Device Offline"
                : "Stop Drying"}

        </button>

      </div>

    )}


  {/* ===============================================
      ORPHANED RUN REFERENCE
  =============================================== */}

  {!recoveryMode &&
    hasOrphanedRunReference && (

      <div className="card active-card">

        <h3>
          Active Machine Run
        </h3>

        <p className="muted">

          SmartChip has an active run reference,
          but the referenced drying run is not
          currently valid as an active run.

        </p>

        <p className="muted">

          Run ID:

          {" "}

          {device.activeRunId}

        </p>

      </div>

    )}


  {/* ===============================================
      LOCKED RUN LOADING
  =============================================== */}

  {!recoveryMode &&
    !activeRun &&
    !hasOrphanedRunReference &&
    deviceBusy && (

      <div className="card active-card">

        <h3>
          Active Machine Run
        </h3>


        <p className="muted">

          SmartChip has an active machine lock.

        </p>

      </div>

    )}


  {/* ===============================================
      START FORM
  =============================================== */}

  {!recoveryMode &&
    !activeRun &&
    !deviceBusy && (

      <div className="card schedule-card">

        <h3>
          Start New Drying Run
        </h3>


        {!deviceLoading &&
          !deviceOnline && (

            <div
              className="error-message"
              role="alert"
            >

              SmartChip ESP32 is offline.

              <br />

              Connect the device before
              starting a drying run.

            </div>

          )}


        {!canSchedule ? (

          <p className="muted">

            You do not have permission
            to start drying runs.

          </p>

        ) : loading ? (

          <p>
            Loading fresh inventory...
          </p>

        ) : (

          <form
            onSubmit={
              handleStartDrying
            }
            className="schedule-form"
          >

            <div className="form-group">

              <label>
                Select Fresh Batch
              </label>

              <select
                name="batchId"
                value={
                  form.batchId
                }
                required
                onChange={
                  handleChange
                }
                disabled={
                  submitting ||
                  !deviceOnline
                }
              >

                <option value="">
                  Choose Batch
                </option>


                {batches.map(
                  (batch) => (

                    <option
                      key={batch.id}
                      value={batch.id}
                    >

                      {batch.batchNumber}

                      {" "}

                      (

                      {batch.freshWeight}

                      {" "}

                      kg)

                    </option>

                  )
                )}

              </select>

            </div>


            <div className="form-group">

              <label>
                Target Temperature (°C)
              </label>

              <input
                type="number"
                name="targetTemp"
                value={
                  form.targetTemp
                }
                min={
                  MIN_TARGET_TEMP
                }
                max={
                  MAX_TARGET_TEMP
                }
                step="0.1"
                required
                disabled={
                  submitting ||
                  !deviceOnline
                }
                onChange={
                  handleChange
                }
                placeholder="Example: 50"
              />

            </div>


            <div className="form-group">

              <label>
                Drying Duration (Hours)
              </label>

              <input
                type="number"
                name="durationHours"
                value={
                  form.durationHours
                }
                min={
                  MIN_DURATION_HOURS
                }
                max={
                  MAX_DURATION_HOURS
                }
                step="0.1"
                required
                disabled={
                  submitting ||
                  !deviceOnline
                }
                onChange={
                  handleChange
                }
                placeholder="Example: 8"
              />

            </div>


            <button
              type="submit"
              className="primary-btn"
              disabled={

                submitting ||

                deviceLoading ||

                !deviceOnline ||

                batches.length === 0

              }
            >

              {submitting
                ? "Starting..."
                : deviceLoading
                  ? "Checking Device..."
                  : !deviceOnline
                    ? "Device Offline"
                    : "Start Drying"}

            </button>


            {batches.length === 0 && (

              <p className="muted">

                No Fresh inventory batches
                are currently available
                for drying.

              </p>

            )}

          </form>

        )}

      </div>

    )}


  {/* ===============================================
      RUN HISTORY
  =============================================== */}

  <div className="card">

    <div className="section-header">

      <h3>
        Drying Run History
      </h3>

    </div>


    {dryingRuns.length === 0 ? (

      <p className="muted">

        No drying runs have been
        created yet.

      </p>

    ) : (

      <div className="drying-run-list">

        {dryingRuns.map(
          (run) => (

            <div
              className="drying-run-item"
              key={run.id}
            >

              <div>

                <strong>

                  {run.batchNumber}

                </strong>

                <div className="muted">

                  {formatStatus(
                    run.status
                  )}

                </div>

              </div>


              <div>

                {run.targetTemp}

                {" °C • "}

                {run.durationHours}

                {" h"}

              </div>

            </div>

          )
        )}

      </div>

    )}

  </div>

</div>


);

}
