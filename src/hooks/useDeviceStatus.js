import {
useEffect,
useState,
useCallback,
} from "react";

import {
doc,
onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

import {
DEVICE_ID,

DEVICE_ONLINE_THRESHOLD,

MACHINE_STATES,

clampTargetTemperature,

createInitialDeviceState,

toSafeNumber,
} from "../services/device";

/* =========================================
NORMALIZE MACHINE STATE
========================================= */

function normalizeMachineState(
value,
online
) {

if (!online) {
return MACHINE_STATES.OFFLINE;
}

const state =
String(value ?? "")
.trim()
.toUpperCase();

const validStates =
Object.values(MACHINE_STATES);

if (
validStates.includes(state) &&
state !== MACHINE_STATES.OFFLINE &&
state !== MACHINE_STATES.WAITING
) {
return state;
}

return MACHINE_STATES.IDLE;
}

/* =========================================
NORMALIZE ALERTS
========================================= */

function normalizeAlerts(value) {

if (!Array.isArray(value)) {
return [];
}

return value
.filter(
(alert) =>
alert &&
typeof alert === "object"
)
.map((alert, index) => ({


  id:
    String(
      alert.id ??
      `alert-${index}`
    ),

  type:
    String(
      alert.type ??
      "warning"
    ).toLowerCase(),

  title:
    String(
      alert.title ??
      "System Alert"
    ),

  message:
    String(
      alert.message ??
      ""
    ),

}));


}

/* =========================================
DEVICE STATUS HOOK
========================================= */

export default function useDeviceStatus() {

const [device, setDevice] =
useState(
() =>
createInitialDeviceState()
);

/* =========================================
FIRESTORE DEVICE LISTENER
========================================= */

useEffect(() => {


const deviceRef =
  doc(
    db,
    "devices",
    DEVICE_ID
  );


const unsubscribe =
  onSnapshot(

    deviceRef,


    (snapshot) => {

      /* =========================
         DEVICE HAS NEVER CONNECTED
      ========================= */

      if (!snapshot.exists()) {

        setDevice(
          createInitialDeviceState()
        );

        return;
      }


      const data =
        snapshot.data();


      /* =========================
         FIRESTORE TIMESTAMP
      ========================= */

      const lastSeen =
        data.lastSeen?.toDate
          ? data.lastSeen.toDate()
          : null;


      /* =========================
         DEVICE ONLINE CHECK
      ========================= */

      const online =
        Boolean(lastSeen) &&
        (
          Date.now() -
            lastSeen.getTime()
          <
          DEVICE_ONLINE_THRESHOLD
        );


      /* =========================
         SHT31 SENSOR DATA
      ========================= */

      const rawSensor1 =
        data.sensors?.sht31_1 ?? {};


      const rawSensor2 =
        data.sensors?.sht31_2 ?? {};


      const sensor1Temperature =
        toSafeNumber(
          rawSensor1.temperature
        );


      const sensor1Humidity =
        toSafeNumber(
          rawSensor1.humidity
        );


      const sensor2Temperature =
        toSafeNumber(
          rawSensor2.temperature
        );


      const sensor2Humidity =
        toSafeNumber(
          rawSensor2.humidity
        );


      /* =========================
         SENSOR ONLINE STATUS
      ========================= */

      const sensor1Online =
        online &&
        sensor1Temperature !== null &&
        sensor1Humidity !== null;


      const sensor2Online =
        online &&
        sensor2Temperature !== null &&
        sensor2Humidity !== null;


      /* =========================
         SSR STATE

         Physical source of truth.
      ========================= */

      const ssrState =
        String(
          data.ssrState ?? "OFF"
        )
          .trim()
          .toUpperCase();


      const ssr =
        online &&
        ssrState === "ON";


      /* =========================
         MACHINE STATE
      ========================= */

      const state =
        normalizeMachineState(
          data.machineStatus,
          online
        );


      /* =========================
         SENSOR HEALTH
      ========================= */

      let sensorStatus =
        "Offline";


      if (online) {

        if (
          sensor1Online &&
          sensor2Online
        ) {
          sensorStatus =
            "Healthy";

        } else if (
          sensor1Online ||
          sensor2Online
        ) {
          sensorStatus =
            "Attention";

        } else {
          sensorStatus =
            "Fault";
        }

      }


      /* =========================
         AVERAGE READINGS

         Prefer ESP32-calculated values.

         If unavailable, calculate
         average from available sensors.
      ========================= */

      let temperature =
        toSafeNumber(
          data.currentTemp
        );


      let humidity =
        toSafeNumber(
          data.currentHumidity
        );


      if (
        temperature === null
      ) {

        const temperatures =
          [
            sensor1Temperature,
            sensor2Temperature,
          ].filter(
            (value) =>
              value !== null
          );


        if (
          temperatures.length > 0
        ) {

          temperature =
            temperatures.reduce(
              (total, value) =>
                total + value,
              0
            ) /
            temperatures.length;

        }

      }


      if (
        humidity === null
      ) {

        const humidities =
          [
            sensor1Humidity,
            sensor2Humidity,
          ].filter(
            (value) =>
              value !== null
          );


        if (
          humidities.length > 0
        ) {

          humidity =
            humidities.reduce(
              (total, value) =>
                total + value,
              0
            ) /
            humidities.length;

        }

      }


      /* =========================
         ALERTS
      ========================= */

      const alerts =
        normalizeAlerts(
          data.alerts
        );


      /* =========================
         ADD LOCAL DEVICE ALERTS
      ========================= */

      if (
        online &&
        !sensor1Online
      ) {

        alerts.push({
          id:
            "sensor-1-offline",

          type:
            "error",

          title:
            "SHT31 #1 Offline",

          message:
            "Sensor #1 is not providing valid readings.",
        });

      }


      if (
        online &&
        !sensor2Online
      ) {

        alerts.push({
          id:
            "sensor-2-offline",

          type:
            "error",

          title:
            "SHT31 #2 Offline",

          message:
            "Sensor #2 is not providing valid readings.",
        });

      }


      if (
        state ===
        MACHINE_STATES.FAULT
      ) {

        alerts.push({
          id:
            "machine-fault",

          type:
            "error",

          title:
            "Machine Fault",

          message:
            "The SmartChip controller reported a fault.",
        });

      }


      /* =========================
         UPDATE DEVICE STATE
      ========================= */

      setDevice({

        deviceId:
          String(
            data.deviceId ??
            DEVICE_ID
          ),


        exists: true,


        online,


        state,


        /* =====================
           AVERAGE READINGS
        ===================== */

        temperature,

        humidity,


        /* =====================
           TARGET SETTINGS
        ===================== */

        targetTemperature:
          toSafeNumber(
            data.targetTemperature
          ) ??
          clampTargetTemperature(
            undefined
          ),


        /* =====================
           SSR / HARDWARE

           Current hardware:

           1 SSR
           ├── Heater
           └── Fan
        ===================== */

        ssr,


        heater:
          ssr,


        fan:
          ssr,


        /* =====================
           TIMER
        ===================== */

        durationSeconds:
          Math.max(
            0,
            Number(
              data.durationSeconds
            ) || 0
          ),


        remainingSeconds:
          Math.max(
            0,
            Number(
              data.remainingSeconds
            ) || 0
          ),


        /* =====================
           HEARTBEAT
        ===================== */

        lastSeen,


        /* =====================
           SENSOR STATUS
        ===================== */

        sensorStatus,


        temperatureStatus:
          String(
            data.temperatureStatus ??
            "Unknown"
          ),


        /* =====================
           SHT31 #1
        ===================== */

        sensor1: {

          temperature:
            sensor1Temperature,

          humidity:
            sensor1Humidity,

          online:
            sensor1Online,

        },


        /* =====================
           SHT31 #2
        ===================== */

        sensor2: {

          temperature:
            sensor2Temperature,

          humidity:
            sensor2Humidity,

          online:
            sensor2Online,

        },


        /* =====================
           ALERTS
        ===================== */

        alerts,


        /* =====================
           CHART

           History will be
           connected later.
        ===================== */

        chart: {

          labels: [],

          temperature: [],

          humidity: [],

        },

      });

    },


    /* =========================
       FIRESTORE ERROR
    ========================= */

    (error) => {

      console.error(
        "Device listener error:",
        error
      );


      setDevice({

        ...createInitialDeviceState(),

        state:
          MACHINE_STATES.OFFLINE,

        sensorStatus:
          "Unavailable",

        alerts: [
          {
            id:
              "firestore-error",

            type:
              "error",

            title:
              "Connection Error",

            message:
              "Unable to read device status from Firestore.",
          },
        ],

      });

    }

  );


return () => {

  unsubscribe();

};


}, []);

/* =========================================
ONLINE STATUS TIMER


 Firestore only pushes updates when the
 document changes.

 This timer detects when the ESP32 stops
 sending heartbeat updates.


========================================= */

useEffect(() => {


const timer =
  setInterval(() => {

    setDevice(
      (current) => {

        if (
          !current.exists
        ) {
          return current;
        }


        if (
          !current.lastSeen
        ) {

          if (
            !current.online
          ) {
            return current;
          }


          return {

            ...current,

            online: false,

            state:
              MACHINE_STATES.OFFLINE,

            ssr: false,

            heater: false,

            fan: false,

          };

        }


        const online =
          (
            Date.now() -
            current.lastSeen.getTime()
          )
          <
          DEVICE_ONLINE_THRESHOLD;


        if (
          current.online ===
          online
        ) {
          return current;
        }


        return {

          ...current,

          online,


          state:
            online
              ? current.state
              : MACHINE_STATES.OFFLINE,


          ssr:
            online
              ? current.ssr
              : false,


          heater:
            online
              ? current.heater
              : false,


          fan:
            online
              ? current.fan
              : false,

        };

      }
    );

  }, 5000);


return () => {

  clearInterval(
    timer
  );

};


}, []);

/* =========================================
PLACEHOLDER ACTIONS


 IMPORTANT:

 These functions DO NOT control the ESP32.

 They exist temporarily so the Dashboard
 and MachineControls component continue
 working without simulation.

 Later:

 START
   ↓
 Firestore command
   ↓
 ESP32 validates
   ↓
 ESP32 controls SSR
   ↓
 ESP32 writes actual state
   ↓
 Dashboard updates


========================================= */

const startDrying =
useCallback(() => {


  console.warn(
    "START command is not connected to the ESP32 yet."
  );

}, []);


const stopDrying =
useCallback(() => {


  console.warn(
    "STOP command is not connected to the ESP32 yet."
  );

}, []);


const setTargetTemperature =
useCallback(
(value) => {


    const safeTemperature =
      clampTargetTemperature(
        value
      );


    console.warn(
      "Target temperature command is not connected yet:",
      safeTemperature
    );

  },
  []
);


/* =========================================
FORMAT REMAINING TIME
========================================= */

const seconds =
Math.max(
0,
Number(
device.remainingSeconds
) || 0
);

const hours =
Math.floor(
seconds / 3600
);

const minutes =
Math.floor(
(seconds % 3600) / 60
);

const remainingSeconds =
seconds % 60;

const remainingTime =
[
hours,
minutes,
remainingSeconds,
]
.map(
(value) =>
String(value).padStart(
2,
"0"
)
)
.join(":");

/* =========================================
RETURN
========================================= */

return {


device,

startDrying,

stopDrying,

setTargetTemperature,

remainingTime,


};

}
