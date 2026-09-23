
/* =====================================================
   SMARTCHIP DEVICE CONFIGURATION
   =====================================================

   This file defines the shared device contract used by:

   React
      ↕
   Firestore
      ↕
   ESP32

   IMPORTANT:

   Keep this file synchronized with:

   - deviceService.js
   - dryingRunService.js
   - Firestore rules
   - ESP32 firmware

===================================================== */


/* =====================================================
   DEVICE ID
===================================================== */

export const DEVICE_ID = "SMARTCHIP-ESP32-01";


/* =====================================================
   DEVICE ONLINE SETTINGS
===================================================== */

/*

ESP32 updates lastSeen periodically.

If no heartbeat is received within this time,
the web application considers the device offline.

ESP32 telemetry will later be rate-limited to avoid
unnecessary Firestore writes.

*/

export const DEVICE_ONLINE_THRESHOLD = 60000;


/* =====================================================
   TEMPERATURE SETTINGS
===================================================== */

/*

IMPORTANT SAFETY ARCHITECTURE

MAX_TARGET_TEMPERATURE
=
Maximum temperature selectable by the operator.

HARD_SAFETY_TEMPERATURE
=
Emergency temperature where the ESP32 must immediately
turn the SSR OFF and enter FAULT state.

The web application must NEVER allow the operator to
select HARD_SAFETY_TEMPERATURE as a normal target.

*/

export const DEFAULT_TARGET_TEMPERATURE = 55;

export const MIN_TARGET_TEMPERATURE = 30;

export const MAX_TARGET_TEMPERATURE = 75;

export const HARD_SAFETY_TEMPERATURE = 80;

export const TEMPERATURE_HYSTERESIS = 1;


/* =====================================================
   DURATION SETTINGS
===================================================== */

export const MIN_DURATION_HOURS = 0.1;

export const MAX_DURATION_HOURS = 168;


/* =====================================================
   MACHINE STATUSES
===================================================== */

/*

Firestore values are lowercase.

Example:

machineStatus: "idle"

React can convert these values into display labels.

The ESP32 is the authoritative source for actual
physical machine status.

*/

export const MACHINE_STATUSES = Object.freeze({

  IDLE: "idle",

  STARTING: "starting",

  PREHEATING: "preheating",

  DRYING: "drying",

  COMPLETED: "completed",

  STOPPED: "stopped",

  FAULT: "fault",

  OFFLINE: "offline",

  WAITING: "waiting",

});


/* =====================================================
   DISPLAY MACHINE STATES
===================================================== */

/*

These are frontend display values.

Do NOT write these directly to Firestore.

Firestore uses MACHINE_STATUSES.

*/

export const MACHINE_STATES = Object.freeze({

  OFFLINE: "OFFLINE",

  WAITING: "WAITING",

  IDLE: "IDLE",

  STARTING: "STARTING",

  PREHEATING: "PREHEATING",

  DRYING: "DRYING",

  COMPLETED: "COMPLETED",

  STOPPED: "STOPPED",

  FAULT: "FAULT",

});


/* =====================================================
   DEVICE COMMANDS
===================================================== */

/*

Commands are requested by the web application.

The ESP32 receives and validates them.

The ESP32 must never blindly trust a command.

*/

export const DEVICE_COMMANDS = Object.freeze({

  START: "START",

  STOP: "STOP",

});


/* =====================================================
   HARDWARE STATES
===================================================== */

export const HARDWARE_STATES = Object.freeze({

  ON: "ON",

  OFF: "OFF",

});


/* =====================================================
   SENSOR IDs
===================================================== */

export const SENSOR_IDS = Object.freeze({

  SHT31_1: "sht31_1",

  SHT31_2: "sht31_2",

});


/* =====================================================
   FAULT CODES
===================================================== */

/*

These codes prepare the React application for future
ESP32 fault reporting.

ESP32 firmware will use these exact values.

*/

export const FAULT_CODES = Object.freeze({

  NONE: null,

  SENSOR_1_FAILURE: "SENSOR_1_FAILURE",

  SENSOR_2_FAILURE: "SENSOR_2_FAILURE",

  SENSOR_FAILURE: "SENSOR_FAILURE",

  OVER_TEMPERATURE: "OVER_TEMPERATURE",

  INVALID_COMMAND: "INVALID_COMMAND",

  INVALID_RUN: "INVALID_RUN",

  DEVICE_ERROR: "DEVICE_ERROR",

});


/* =====================================================
   INITIAL DEVICE STATE
===================================================== */

/*

Used when:

- ESP32 has never connected
- Device document does not exist
- Firestore connection fails

IMPORTANT:

No simulated sensor readings.

All sensor values remain null until actual ESP32
telemetry is received.

*/

export const createInitialDeviceState = () => ({

  /* =========================
     DEVICE
  ========================= */

  deviceId: DEVICE_ID,

  exists: false,

  online: false,


  /* =========================
     MACHINE STATUS
  ========================= */

  machineStatus:
    MACHINE_STATUSES.WAITING,

  state:
    MACHINE_STATES.WAITING,


  /* =========================
     ACTIVE MACHINE LOCK
  ========================= */

  activeRunId: null,

  activeBatchId: null,


  /* =========================
     COMMAND
  ========================= */

  command: null,

  commandId: null,

  commandRunId: null,

  commandCreatedAt: null,

  lastProcessedCommandId: null,


  /* =========================
     AVERAGE SENSOR VALUES
  ========================= */

  temperature: null,

  humidity: null,


  /* =========================
     FIRESTORE SENSOR VALUES
  ========================= */

  currentTemp: null,

  currentHumidity: null,


  /* =========================
     TARGET SETTINGS
  ========================= */

  targetTemperature:
    DEFAULT_TARGET_TEMPERATURE,

  targetTemp:
    DEFAULT_TARGET_TEMPERATURE,


  /* =========================
     HARDWARE STATUS

     Current SmartChip setup:

     1 SSR
     ├── Heating Element
     └── Fan

     Because Heater and Fan are connected
     to the same SSR:

     SSR ON
     =
     Heater ON
     Fan ON

     SSR OFF
     =
     Heater OFF
     Fan OFF

  ========================= */

  ssrState:
    HARDWARE_STATES.OFF,

  heaterState:
    HARDWARE_STATES.OFF,

  fanState:
    HARDWARE_STATES.OFF,


  /* =========================
     FRONTEND BOOLEAN VALUES
  ========================= */

  ssr: false,

  heater: false,

  fan: false,


  /* =========================
     DRYING TIMER
  ========================= */

  durationSeconds: 0,

  remainingSeconds: 0,


  /* =========================
     DEVICE HEARTBEAT
  ========================= */

  lastSeen: null,

  updatedAt: null,


  /* =========================
     SENSOR STATUS
  ========================= */

  sensorStatus: "Waiting",

  temperatureStatus: "Unknown",


  /* =========================
     SHT31 #1
  ========================= */

  sensor1: {

    temperature: null,

    humidity: null,

    online: false,

  },


  /* =========================
     SHT31 #2
  ========================= */

  sensor2: {

    temperature: null,

    humidity: null,

    online: false,

  },


  /* =========================
     FAULT STATUS
  ========================= */

  faultCode: null,

  faultMessage: null,

  faultAt: null,


  /* =========================
     ALERTS

     Ready for ESP32 integration.

     Example:

     {
       id: "sensor-1-fault",
       type: "error",
       title: "SHT31 #1 Failure",
       message: "Sensor is not responding"
     }

  ========================= */

  alerts: [],


  /* =========================
     CHART

     Empty until telemetry history
     is implemented.

  ========================= */

  chart: {

    labels: [],

    temperature: [],

    humidity: [],

  },

});


/* =====================================================
   VALIDATE TARGET TEMPERATURE
===================================================== */

export function clampTargetTemperature(value) {

  const numericValue =
    Number(value);

  if (!Number.isFinite(numericValue)) {

    return DEFAULT_TARGET_TEMPERATURE;

  }

  return Math.min(

    MAX_TARGET_TEMPERATURE,

    Math.max(
      MIN_TARGET_TEMPERATURE,
      numericValue
    )

  );

}


/* =====================================================
   VALIDATE DURATION
===================================================== */

export function clampDurationHours(value) {

  const numericValue =
    Number(value);

  if (!Number.isFinite(numericValue)) {

    return MIN_DURATION_HOURS;

  }

  return Math.min(

    MAX_DURATION_HOURS,

    Math.max(
      MIN_DURATION_HOURS,
      numericValue
    )

  );

}


/* =====================================================
   FORMAT DURATION
===================================================== */

export function formatDuration(seconds) {

  const safeSeconds = Math.max(
    0,
    Math.floor(Number(seconds) || 0)
  );

  const hours =
    Math.floor(
      safeSeconds / 3600
    );

  const minutes =
    Math.floor(
      (safeSeconds % 3600) / 60
    );

  const remainingSeconds =
    safeSeconds % 60;

  return [

    hours,

    minutes,

    remainingSeconds,

  ]
    .map((value) =>
      String(value).padStart(2, "0")
    )
    .join(":");

}


/* =====================================================
   FORMAT LAST UPDATE
===================================================== */

export function formatLastUpdate(date) {

  if (!(date instanceof Date)) {

    return "Never";

  }

  return date.toLocaleTimeString(
    [],
    {

      hour: "2-digit",

      minute: "2-digit",

      second: "2-digit",

    }
  );

}


/* =====================================================
   SAFE NUMBER HELPER
===================================================== */

export function toSafeNumber(value) {

  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : null;

}


/* =====================================================
   VALIDATE HARDWARE STATE
===================================================== */

export function isHardwareOn(value) {

  return value ===
    HARDWARE_STATES.ON;

}


/* =====================================================
   NORMALIZE MACHINE STATUS
===================================================== */

/*

Converts Firestore values into predictable
frontend display values.

Example:

"idle"
→
"IDLE"

*/

export function normalizeMachineStatus(value) {

  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {

    return MACHINE_STATES.WAITING;

  }

  return value
    .trim()
    .toUpperCase();

}



/* =====================================================
   HARDWARE STATE NORMALIZER

   SmartChip currently has ONE SSR controlling BOTH:

   - Heater
   - Fan

   The cloud contract must never represent impossible
   physical combinations such as Heater ON + Fan OFF.
===================================================== */

export function createSynchronizedHardwareState(isOn) {

  const state =
    isOn
      ? HARDWARE_STATES.ON
      : HARDWARE_STATES.OFF;

  return {

    ssrState: state,

    heaterState: state,

    fanState: state,

    ssr: Boolean(isOn),

    heater: Boolean(isOn),

    fan: Boolean(isOn),

  };

}


/* =====================================================
   FAULT VALIDATION
===================================================== */

export function isValidFaultCode(value) {

  return value == null

    || Object.values(FAULT_CODES)
      .includes(value);

}
