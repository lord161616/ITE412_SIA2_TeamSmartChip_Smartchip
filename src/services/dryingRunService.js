
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

import {
  DEVICE_ID,
  DEVICE_COMMANDS as DEVICE_COMMAND_VALUES,
  MACHINE_STATUSES as DEVICE_MACHINE_STATUSES,
  HARDWARE_STATES,
} from "./device";

import {
  getDevice as getDeviceFromService,
  subscribeToDevice as subscribeToDeviceFromService,
} from "./deviceService";


/* =====================================================
   COLLECTIONS
===================================================== */

const DRYING_RUNS_COLLECTION = "dryingRuns";

const INVENTORY_COLLECTION = "inventory";

const DEVICES_COLLECTION = "devices";


/* =====================================================
   DEVICE
===================================================== */

export const SMARTCHIP_DEVICE_ID = DEVICE_ID;


/* =====================================================
   DEVICE REFERENCE
===================================================== */

const deviceRef = doc(
  db,
  DEVICES_COLLECTION,
  SMARTCHIP_DEVICE_ID
);


/* =====================================================
   COLLECTION REFERENCES
===================================================== */

const dryingRunsRef = collection(
  db,
  DRYING_RUNS_COLLECTION
);


/* =====================================================
   DRYING RUN STATUSES
===================================================== */

export const DRYING_RUN_STATUSES = [
  "starting",
  "preheating",
  "drying",
  "completed",
  "cancelled",
  "failed",
];


/* =====================================================
   ACTIVE DRYING RUN STATUSES
===================================================== */

export const ACTIVE_DRYING_RUN_STATUSES = [
  "starting",
  "preheating",
  "drying",
];


/* =====================================================
   TERMINAL DRYING RUN STATUSES
===================================================== */

export const TERMINAL_DRYING_RUN_STATUSES = [
  "completed",
  "cancelled",
  "failed",
];


/* =====================================================
   MACHINE STATUSES
===================================================== */

export const MACHINE_STATUSES = [
  DEVICE_MACHINE_STATUSES.IDLE,
  DEVICE_MACHINE_STATUSES.STARTING,
  DEVICE_MACHINE_STATUSES.PREHEATING,
  DEVICE_MACHINE_STATUSES.DRYING,
  DEVICE_MACHINE_STATUSES.COMPLETED,
  DEVICE_MACHINE_STATUSES.STOPPED,
  DEVICE_MACHINE_STATUSES.FAULT,
];


/* =====================================================
   DEVICE COMMANDS
===================================================== */

export const DEVICE_COMMANDS = [
  DEVICE_COMMAND_VALUES.START,
  DEVICE_COMMAND_VALUES.STOP,
];


/* =====================================================
   HARDWARE STATES
===================================================== */

export const HEATER_STATES = [
  HARDWARE_STATES.OFF,
  HARDWARE_STATES.ON,
];


export const FAN_STATES = [
  HARDWARE_STATES.OFF,
  HARDWARE_STATES.ON,
];


export const SSR_STATES = [
  HARDWARE_STATES.OFF,
  HARDWARE_STATES.ON,
];


/* =====================================================
   PRODUCTION LIMITS

   These must match device.js and Firestore rules.
===================================================== */

export const MIN_TARGET_TEMP = 30;

export const MAX_TARGET_TEMP = 75;

export const MIN_DURATION_HOURS = 0.1;

export const MAX_DURATION_HOURS = 168;


/* =====================================================
   COMMAND ID GENERATOR

   Generated outside the transaction so that a retry
   uses the same command ID.
===================================================== */

function generateCommandId() {

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {

    return crypto.randomUUID();

  }


  return [
    "cmd",
    Date.now(),
    Math.random()
      .toString(36)
      .substring(2, 10),
  ].join("-");

}


/* =====================================================
   NORMALIZE NULLABLE VALUE
===================================================== */

function normalizeNullable(value) {

  if (value === undefined) {

    return null;

  }

  return value;

}


/* =====================================================
   HAS VALID STRING
===================================================== */

function hasValidString(value) {

  return (
    typeof value === "string" &&
    value.trim().length > 0
  );

}


/* =====================================================
   VALIDATION HELPERS
===================================================== */

function requireString(value, fieldName) {

  if (!hasValidString(value)) {

    throw new Error(
      `${fieldName} is required.`
    );

  }

}


function requirePositiveNumber(
  value,
  fieldName
) {

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {

    throw new Error(
      `${fieldName} must be a positive number.`
    );

  }

}


/* =====================================================
   VALIDATE TEMPERATURE
===================================================== */

function validateTemperature(value) {

  requirePositiveNumber(
    value,
    "Target temperature"
  );


  if (value < MIN_TARGET_TEMP) {

    throw new Error(
      `Target temperature must be at least ${MIN_TARGET_TEMP}°C.`
    );

  }


  if (value > MAX_TARGET_TEMP) {

    throw new Error(
      `Target temperature cannot exceed ${MAX_TARGET_TEMP}°C.`
    );

  }

}


/* =====================================================
   VALIDATE DURATION
===================================================== */

function validateDuration(value) {

  requirePositiveNumber(
    value,
    "Duration"
  );


  if (value < MIN_DURATION_HOURS) {

    throw new Error(
      `Duration must be at least ${MIN_DURATION_HOURS} hours.`
    );

  }


  if (value > MAX_DURATION_HOURS) {

    throw new Error(
      `Duration cannot exceed ${MAX_DURATION_HOURS} hours.`
    );

  }

}


/* =====================================================
   GET DEVICE
===================================================== */

export async function getDevice() {

  return getDeviceFromService();

}


/* =====================================================
   SUBSCRIBE TO DEVICE
===================================================== */

export function subscribeToDevice(
  onData,
  onError
) {

  return subscribeToDeviceFromService(
    onData,
    onError
  );

}


/* =====================================================
   GET INVENTORY BATCH
===================================================== */

export async function getInventoryBatch(
  batchId
) {

  requireString(
    batchId,
    "Batch ID"
  );


  const batchRef = doc(
    db,
    INVENTORY_COLLECTION,
    batchId
  );


  const snapshot = await getDoc(
    batchRef
  );


  if (!snapshot.exists()) {

    throw new Error(
      "Inventory batch not found."
    );

  }


  return {
    id: snapshot.id,
    ...snapshot.data(),
  };

}


/* =====================================================
   GET ACTIVE DRYING RUN

   DEVICE DOCUMENT IS AUTHORITATIVE.
===================================================== */

export async function getActiveDryingRun() {

  const device =
    await getDeviceFromService();


  const activeRunId =
    normalizeNullable(
      device?.activeRunId
    );


  if (
    hasValidString(activeRunId)
  ) {

    try {

      return await getDryingRun(
        activeRunId
      );

    } catch (error) {

      console.warn(
        "Device has activeRunId but the drying run could not be loaded:",
        error
      );

      return null;

    }

  }


  return null;

}


/* =====================================================
   CHECK ACTIVE DRYING RUN

   DEVICE DOCUMENT IS AUTHORITATIVE.
===================================================== */

export async function hasActiveDryingRun() {

  const device =
    await getDeviceFromService();


  if (!device) {

    return false;

  }


  const activeRunId =
    normalizeNullable(
      device.activeRunId
    );


  const activeBatchId =
    normalizeNullable(
      device.activeBatchId
    );


  const command =
    normalizeNullable(
      device.command
    );


  const machineStatus =
    normalizeNullable(
      device.machineStatus
    );


  return Boolean(

    hasValidString(
      activeRunId
    )

    ||

    hasValidString(
      activeBatchId
    )

    ||

    hasValidString(
      command
    )

    ||

    (
      machineStatus &&
      machineStatus !==
      DEVICE_MACHINE_STATUSES.IDLE
    )

  );

}


/* =====================================================
   START DRYING RUN

   ATOMIC WORKFLOW

   DEVICE IDLE
        +
   NO DEVICE LOCK
        +
   NO PENDING COMMAND
        +
   INVENTORY FRESH
        +
   CREATE RUN
        +
   INVENTORY -> DRYING
        +
   DEVICE LOCK
        +
   START COMMAND

   IMPORTANT:

   actualStartTime is NOT set by the web application.

   ESP32 confirms physical machine start.

   IMPORTANT FIRESTORE SECURITY RULE CONTRACT:

   The WEB START operation may update only:

   - machineStatus
   - activeRunId
   - activeBatchId
   - command
   - commandId
   - commandRunId
   - commandCreatedAt
   - heaterState
   - fanState
   - updatedAt

   Therefore the web START operation MUST NOT update:

   - ssrState
   - ssr
   - heater
   - fan
   - durationSeconds
   - remainingSeconds
   - faultCode
   - faultMessage
   - faultAt

   Those fields are handled by the ESP32/device lifecycle.
===================================================== */

export async function startDryingRun({

  batchId,

  targetTemp,

  durationHours,

  createdBy,

}) {

  /* =============================================
     VALIDATION
  ============================================= */

  requireString(
    batchId,
    "Batch ID"
  );


  requireString(
    createdBy,
    "Created by"
  );


  validateTemperature(
    targetTemp
  );


  validateDuration(
    durationHours
  );


  /* =============================================
     REFERENCES
  ============================================= */

  const inventoryRef = doc(
    db,
    INVENTORY_COLLECTION,
    batchId
  );


  const runRef = doc(
    dryingRunsRef
  );


  /*
    Stable command ID.

    Firestore transactions can retry.
    The command ID therefore remains unchanged
    across retries.
  */

  const commandId =
    generateCommandId();


  /* =============================================
     TRANSACTION
  ============================================= */

  const result = await runTransaction(

    db,

    async (transaction) => {

      /* =========================================
         READ DEVICE
      ========================================= */

      const deviceSnapshot =
        await transaction.get(
          deviceRef
        );


      if (!deviceSnapshot.exists()) {

        throw new Error(
          "SmartChip device is not configured."
        );

      }


      const device =
        deviceSnapshot.data();


      const machineStatus =
        normalizeNullable(
          device.machineStatus
        );


      const activeRunId =
        normalizeNullable(
          device.activeRunId
        );


      const activeBatchId =
        normalizeNullable(
          device.activeBatchId
        );


      const pendingCommand =
        normalizeNullable(
          device.command
        );


      /* =========================================
         DEVICE MUST BE IDLE
      ========================================= */

      if (
        machineStatus !==
        DEVICE_MACHINE_STATUSES.IDLE
      ) {

        throw new Error(

          `SmartChip machine is currently busy. Current status: ${
            machineStatus || "unknown"
          }.`

        );

      }


      /* =========================================
         DEVICE MUST NOT BE LOCKED
      ========================================= */

      if (

        hasValidString(
          activeRunId
        )

        ||

        hasValidString(
          activeBatchId
        )

      ) {

        throw new Error(
          "SmartChip already has an active drying run."
        );

      }


      /* =========================================
         NO COMMAND PENDING
      ========================================= */

      if (
        hasValidString(
          pendingCommand
        )
      ) {

        throw new Error(
          `SmartChip already has a pending ${pendingCommand} command.`
        );

      }


      /* =========================================
         READ INVENTORY
      ========================================= */

      const batchSnapshot =
        await transaction.get(
          inventoryRef
        );


      if (!batchSnapshot.exists()) {

        throw new Error(
          "Inventory batch not found."
        );

      }


      const batch = {

        id:
          batchSnapshot.id,

        ...batchSnapshot.data(),

      };


      /* =========================================
         BATCH MUST BE FRESH
      ========================================= */

      if (
        batch.status !== "Fresh"
      ) {

        throw new Error(
          "Only Fresh batches can be started."
        );

      }


      requireString(
        batch.batchNumber,
        "Batch number"
      );


      /* =========================================
         INITIAL WEIGHT
      ========================================= */

      const freshWeight =
        Number(
          batch.freshWeight
        );


      requirePositiveNumber(
        freshWeight,
        "Fresh weight"
      );


      /* =========================================
         DURATION
      ========================================= */

      const durationSeconds =
        Math.round(
          durationHours * 3600
        );


      /* =========================================
         DRYING RUN DATA

         Hardware/timer fields remain on the
         dryingRuns document.

         The CREATE rule allows these fields.
      ========================================= */

      const runData = {

        deviceId:
          SMARTCHIP_DEVICE_ID,

        batchId:
          batch.id,

        batchNumber:
          batch.batchNumber,

        status:
          "starting",


        /* =========================
           SETTINGS
        ========================= */

        targetTemp:
          targetTemp,

        durationHours:
          durationHours,

        durationSeconds:
          durationSeconds,

        remainingSeconds:
          durationSeconds,


        /* =========================
           PHYSICAL TIMES
        ========================= */

        actualStartTime:
          null,

        actualEndTime:
          null,


        /* =========================
           WEIGHT
        ========================= */

        initialWeight:
          freshWeight,

        finalWeight:
          null,


        /* =========================
           SENSOR TELEMETRY
        ========================= */

        currentTemp:
          null,

        currentHumidity:
          null,

        sensor1Temp:
          null,

        sensor1Humidity:
          null,

        sensor1Online:
          false,

        sensor2Temp:
          null,

        sensor2Humidity:
          null,

        sensor2Online:
          false,


        /* =========================
           HARDWARE

           Initial safe state.
        ========================= */

        ssrState:
          HARDWARE_STATES.OFF,

        heaterState:
          HARDWARE_STATES.OFF,

        fanState:
          HARDWARE_STATES.OFF,

        ssr:
          false,

        heater:
          false,

        fan:
          false,


        /* =========================
           FAULT
        ========================= */

        faultCode:
          null,

        faultMessage:
          null,

        faultAt:
          null,


        /* =========================
           AUDIT
        ========================= */

        createdBy:
          createdBy,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),

      };


      /* =========================================
         UPDATE INVENTORY

         Fresh -> Drying
      ========================================= */

      transaction.update(

        inventoryRef,

        {

          status:
            "Drying",

          targetTemp:
            targetTemp,

          durationHours:
            durationHours,

          actualStartTime:
            null,

          updatedAt:
            serverTimestamp(),

        }

      );


      /* =========================================
         CREATE DRYING RUN
      ========================================= */

      transaction.set(
        runRef,
        runData
      );


      /* =========================================
         DEVICE LOCK + START COMMAND

         THIS IS THE IMPORTANT FIX.

         ONLY SECURITY-RULE-APPROVED WEB START
         FIELDS ARE WRITTEN.
      ========================================= */

      transaction.update(

        deviceRef,

        {

          machineStatus:
            DEVICE_MACHINE_STATUSES.STARTING,

          activeRunId:
            runRef.id,

          activeBatchId:
            batch.id,


          /* =========================
             COMMAND
          ========================= */

          command:
            DEVICE_COMMAND_VALUES.START,

          commandId:
            commandId,

          commandRunId:
            runRef.id,

          commandCreatedAt:
            serverTimestamp(),


          /* =========================
             SAFE HARDWARE STATE

             These ARE explicitly allowed
             by the web START rule.
          ========================= */

          heaterState:
            HARDWARE_STATES.OFF,

          fanState:
            HARDWARE_STATES.OFF,


          /* =========================
             AUDIT
          ========================= */

          updatedAt:
            serverTimestamp(),

        }

      );


      /* =========================================
         RETURN
      ========================================= */

      return {

        runId:
          runRef.id,

        batchId:
          batch.id,

        batchNumber:
          batch.batchNumber,

        deviceId:
          SMARTCHIP_DEVICE_ID,

        command:
          DEVICE_COMMAND_VALUES.START,

        commandId:
          commandId,

      };

    }

  );


  return result;

}


/* =====================================================
   LEGACY COMPATIBILITY
===================================================== */

export async function scheduleDryingRun({

  batchId,

  targetTemp,

  durationHours,

  createdBy,

}) {

  return startDryingRun({

    batchId,

    targetTemp,

    durationHours,

    createdBy,

  });

}


export async function createDryingRun({

  batchId,

  targetTemp,

  durationHours,

  createdBy,

}) {

  return startDryingRun({

    batchId,

    targetTemp,

    durationHours,

    createdBy,

  });

}


/* =====================================================
   GET ONE DRYING RUN
===================================================== */

export async function getDryingRun(
  runId
) {

  requireString(
    runId,
    "Run ID"
  );


  const runRef = doc(
    db,
    DRYING_RUNS_COLLECTION,
    runId
  );


  const snapshot =
    await getDoc(
      runRef
    );


  if (!snapshot.exists()) {

    throw new Error(
      "Drying run not found."
    );

  }


  return {

    id:
      snapshot.id,

    ...snapshot.data(),

  };

}


/* =====================================================
   GET ALL DRYING RUNS
===================================================== */

export async function getDryingRuns() {

  const snapshot =
    await getDocs(
      dryingRunsRef
    );


  const runs =
    snapshot.docs.map(

      (runDoc) => ({

        id:
          runDoc.id,

        ...runDoc.data(),

      })

    );


  return sortDryingRuns(
    runs
  );

}


/* =====================================================
   GET TIMESTAMP VALUE
===================================================== */

function getTimestampValue(
  value
) {

  if (!value) {

    return 0;

  }


  if (
    typeof value?.toDate ===
    "function"
  ) {

    return value
      .toDate()
      .getTime();

  }


  const date =
    new Date(value);


  const time =
    date.getTime();


  return Number.isNaN(time)
    ? 0
    : time;

}


/* =====================================================
   SORT DRYING RUNS

   Newest first.
===================================================== */

function sortDryingRuns(
  runs
) {

  return [
    ...runs,
  ].sort(

    (a, b) =>

      getTimestampValue(
        b.createdAt
      )

      -

      getTimestampValue(
        a.createdAt
      )

  );

}


/* =====================================================
   SUBSCRIBE TO ALL DRYING RUNS
===================================================== */

export function subscribeToDryingRuns(
  onData,
  onError
) {

  if (
    typeof onData !==
    "function"
  ) {

    throw new Error(
      "Drying run callback is required."
    );

  }


  return onSnapshot(

    dryingRunsRef,

    (snapshot) => {

      const runs =
        snapshot.docs.map(

          (runDoc) => ({

            id:
              runDoc.id,

            ...runDoc.data(),

          })

        );


      onData(
        sortDryingRuns(
          runs
        )
      );

    },

    (error) => {

      console.error(
        "Failed to subscribe to drying runs:",
        error
      );


      if (
        typeof onError ===
        "function"
      ) {

        onError(
          error
        );

      }

    }

  );

}


/* =====================================================
   SUBSCRIBE TO ONE DRYING RUN
===================================================== */

export function subscribeToDryingRun(

  runId,

  onData,

  onError

) {

  requireString(
    runId,
    "Run ID"
  );


  if (
    typeof onData !==
    "function"
  ) {

    throw new Error(
      "Drying run callback is required."
    );

  }


  const runRef =
    doc(
      db,
      DRYING_RUNS_COLLECTION,
      runId
    );


  return onSnapshot(

    runRef,

    (snapshot) => {

      if (!snapshot.exists()) {

        onData(null);

        return;

      }


      onData({

        id:
          snapshot.id,

        ...snapshot.data(),

      });

    },

    (error) => {

      console.error(
        "Failed to subscribe to drying run:",
        error
      );


      if (
        typeof onError ===
        "function"
      ) {

        onError(
          error
        );

      }

    }

  );

}


/* =====================================================
   CANCEL / STOP DRYING RUN

   WEB
     ↓
   STOP COMMAND
     ↓
   ESP32
     ↓
   HARDWARE OFF
     ↓
   ESP32 CONFIRMATION
     ↓
   STATE FINALIZATION

   IMPORTANT:

   The WEB does NOT immediately release the device
   lock. The ESP32 must process STOP first.
===================================================== */

export async function cancelDryingRun(
  runId
) {

  requireString(
    runId,
    "Run ID"
  );


  const runRef =
    doc(
      db,
      DRYING_RUNS_COLLECTION,
      runId
    );


  const commandId =
    generateCommandId();


  const result =
    await runTransaction(

      db,

      async (transaction) => {

        /* =========================================
           READ DEVICE
        ========================================= */

        const deviceSnapshot =
          await transaction.get(
            deviceRef
          );


        if (!deviceSnapshot.exists()) {

          throw new Error(
            "SmartChip device not found."
          );

        }


        const device =
          deviceSnapshot.data();


        const activeRunId =
          normalizeNullable(
            device.activeRunId
          );


        const pendingCommand =
          normalizeNullable(
            device.command
          );


        /* =========================================
           VERIFY ACTIVE RUN
        ========================================= */

        if (
          !hasValidString(
            activeRunId
          )
        ) {

          throw new Error(
            "There is no active drying run on the SmartChip device."
          );

        }


        if (
          activeRunId !== runId
        ) {

          throw new Error(
            "This drying run is not the active machine run."
          );

        }


        /* =========================================
           NO COMMAND PENDING
        ========================================= */

        if (
          hasValidString(
            pendingCommand
          )
        ) {

          throw new Error(
            `SmartChip already has a pending ${pendingCommand} command.`
          );

        }


        /* =========================================
           READ RUN
        ========================================= */

        const runSnapshot =
          await transaction.get(
            runRef
          );


        if (!runSnapshot.exists()) {

          throw new Error(
            "Drying run not found."
          );

        }


        const run =
          runSnapshot.data();


        /* =========================================
           RUN MUST BE ACTIVE
        ========================================= */

        if (
          !ACTIVE_DRYING_RUN_STATUSES.includes(
            run.status
          )
        ) {

          throw new Error(
            `Only an active drying run can be stopped. Current status: ${run.status}.`
          );

        }


        /* =========================================
           SEND STOP COMMAND

           IMPORTANT:

           These are the fields permitted by the
           web STOP Firestore rule.
        ========================================= */

        transaction.update(

          deviceRef,

          {

            command:
              DEVICE_COMMAND_VALUES.STOP,

            commandId:
              commandId,

            commandRunId:
              runId,

            commandCreatedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),

          }

        );


        return {

          runId:
            runId,

          deviceId:
            SMARTCHIP_DEVICE_ID,

          command:
            DEVICE_COMMAND_VALUES.STOP,

          commandId:
            commandId,

        };

      }

    );


  return result;

}


/* =====================================================
   COMPLETE DRYING RUN

   CALLED AFTER ESP32 HAS ALREADY:

   1. Completed physical drying
   2. Turned SSR OFF locally
   3. Confirmed local hardware state

   NOTE:

   This function uses the existing application
   completion workflow.

   Device security rules must permit the corresponding
   ESP32/application completion transition.
===================================================== */

export async function completeDryingRun(
  runId
) {

  requireString(
    runId,
    "Run ID"
  );


  const runRef =
    doc(
      db,
      DRYING_RUNS_COLLECTION,
      runId
    );


  return runTransaction(

    db,

    async (transaction) => {

      /* =========================================
         READ DEVICE
      ========================================= */

      const deviceSnapshot =
        await transaction.get(
          deviceRef
        );


      if (!deviceSnapshot.exists()) {

        throw new Error(
          "SmartChip device not found."
        );

      }


      const device =
        deviceSnapshot.data();


      const activeRunId =
        normalizeNullable(
          device.activeRunId
        );


      const activeBatchId =
        normalizeNullable(
          device.activeBatchId
        );


      if (
        !hasValidString(
          activeRunId
        )
      ) {

        throw new Error(
          "There is no active drying run on the SmartChip device."
        );

      }


      if (
        activeRunId !== runId
      ) {

        throw new Error(
          "This drying run is not the active SmartChip machine run."
        );

      }


      /* =========================================
         READ RUN
      ========================================= */

      const runSnapshot =
        await transaction.get(
          runRef
        );


      if (!runSnapshot.exists()) {

        throw new Error(
          "Drying run not found."
        );

      }


      const run = {

        id:
          runSnapshot.id,

        ...runSnapshot.data(),

      };


      /* =========================================
         PREVENT DUPLICATE COMPLETION
      ========================================= */

      if (
        TERMINAL_DRYING_RUN_STATUSES.includes(
          run.status
        )
      ) {

        throw new Error(
          `Drying run is already terminal. Current status: ${run.status}.`
        );

      }


      if (
        !ACTIVE_DRYING_RUN_STATUSES.includes(
          run.status
        )
      ) {

        throw new Error(
          `Drying run cannot be completed from status: ${run.status}.`
        );

      }


      if (
        run.deviceId !==
        SMARTCHIP_DEVICE_ID
      ) {

        throw new Error(
          "Drying run belongs to a different device."
        );

      }


      requireString(
        run.batchId,
        "Run batch ID"
      );


      if (

        hasValidString(
          activeBatchId
        )

        &&

        activeBatchId !==
        run.batchId

      ) {

        throw new Error(
          "Device active batch does not match the drying run batch."
        );

      }


      /* =========================================
         READ INVENTORY
      ========================================= */

      const inventoryRef =
        doc(
          db,
          INVENTORY_COLLECTION,
          run.batchId
        );


      const inventorySnapshot =
        await transaction.get(
          inventoryRef
        );


      if (!inventorySnapshot.exists()) {

        throw new Error(
          "Inventory batch not found."
        );

      }


      const inventory =
        inventorySnapshot.data();


      if (
        inventory.status !==
        "Drying"
      ) {

        throw new Error(
          `Inventory batch cannot be completed because its current status is: ${inventory.status}.`
        );

      }


      /* =========================================
         COMPLETE RUN
      ========================================= */

      transaction.update(

        runRef,

        {

          status:
            "completed",

          actualEndTime:
            serverTimestamp(),

          remainingSeconds:
            0,

          updatedAt:
            serverTimestamp(),

        }

      );


      /* =========================================
         INVENTORY

         No estimated dried weight.
      ========================================= */

      transaction.update(

        inventoryRef,

        {

          status:
            "Dried",

          updatedAt:
            serverTimestamp(),

        }

      );


      /* =========================================
         DEVICE

         Existing completion behavior.
      ========================================= */

      transaction.update(

        deviceRef,

        {

          machineStatus:
            DEVICE_MACHINE_STATUSES.COMPLETED,

          activeRunId:
            null,

          activeBatchId:
            null,

          command:
            null,

          commandId:
            null,

          commandRunId:
            null,

          commandCreatedAt:
            null,

          remainingSeconds:
            0,

          faultCode:
            null,

          faultMessage:
            null,

          faultAt:
            null,

          updatedAt:
            serverTimestamp(),

        }

      );


      return {

        success:
          true,

        runId:
          runId,

        batchId:
          run.batchId,

        deviceId:
          SMARTCHIP_DEVICE_ID,

        status:
          "completed",

        message:
          "Drying run completed successfully.",

      };

    }

  );

}


/* =====================================================
   ACKNOWLEDGE COMPLETED DEVICE

   COMPLETED -> IDLE

   Does not modify:

   - inventory
   - drying run
   - history
===================================================== */

export async function acknowledgeCompletedDevice() {

  return runTransaction(

    db,

    async (transaction) => {

      const deviceSnapshot =
        await transaction.get(
          deviceRef
        );


      if (!deviceSnapshot.exists()) {

        throw new Error(
          "SmartChip device not found."
        );

      }


      const device =
        deviceSnapshot.data();


      if (
        device.machineStatus !==
        DEVICE_MACHINE_STATUSES.COMPLETED
      ) {

        throw new Error(
          `Device cannot be acknowledged from status: ${
            device.machineStatus ||
            "unknown"
          }.`
        );

      }


      if (

        hasValidString(
          normalizeNullable(
            device.activeRunId
          )
        )

        ||

        hasValidString(
          normalizeNullable(
            device.activeBatchId
          )
        )

      ) {

        throw new Error(
          "Device still has an active machine lock."
        );

      }


      transaction.update(

        deviceRef,

        {

          machineStatus:
            DEVICE_MACHINE_STATUSES.IDLE,

          command:
            null,

          commandId:
            null,

          commandRunId:
            null,

          commandCreatedAt:
            null,

          faultCode:
            null,

          faultMessage:
            null,

          faultAt:
            null,

          updatedAt:
            serverTimestamp(),

        }

      );


      return {

        success:
          true,

        deviceId:
          SMARTCHIP_DEVICE_ID,

        status:
          DEVICE_MACHINE_STATUSES.IDLE,

      };

    }

  );

}


/* =====================================================
   RECOVER DRYING RUN BY RUN ID

   COMPATIBILITY FUNCTION
===================================================== */

export async function recoverDryingRun(
  runId
) {

  requireString(
    runId,
    "Run ID"
  );


  return recoverStuckDryingRun(
    runId
  );

}


/* =====================================================
   RECOVER STUCK DRYING RUN

   OFFLINE RECOVERY

   IMPORTANT:

   This is Firestore state recovery only.

   It does NOT:

   - communicate with ESP32
   - physically turn SSR OFF
   - verify heater state
   - verify fan state

   Physical safety must be confirmed before
   recovery is used.
===================================================== */

export async function recoverStuckDryingRun(
  requestedRunId = null
) {

  if (
    requestedRunId !== null
  ) {

    requireString(
      requestedRunId,
      "Run ID"
    );

  }


  const result =
    await runTransaction(

      db,

      async (transaction) => {

        /* =========================================
           READ DEVICE
        ========================================= */

        const deviceSnapshot =
          await transaction.get(
            deviceRef
          );


        if (!deviceSnapshot.exists()) {

          throw new Error(
            "SmartChip device not found."
          );

        }


        const device =
          deviceSnapshot.data();


        const deviceActiveRunId =
          normalizeNullable(
            device.activeRunId
          );


        const activeBatchId =
          normalizeNullable(
            device.activeBatchId
          );


        /* =========================================
           VERIFY REQUESTED RUN
        ========================================= */

        if (

          requestedRunId

          &&

          hasValidString(
            deviceActiveRunId
          )

          &&

          requestedRunId !==
          deviceActiveRunId

        ) {

          throw new Error(
            "Requested drying run does not match the active SmartChip machine run."
          );

        }


        const activeRunId =

          requestedRunId

          ||

          deviceActiveRunId

          ||

          null;


        let run = null;

        let runRef = null;


        /* =========================================
           READ ACTIVE RUN
        ========================================= */

        if (
          hasValidString(
            activeRunId
          )
        ) {

          runRef =
            doc(
              db,
              DRYING_RUNS_COLLECTION,
              activeRunId
            );


          const runSnapshot =
            await transaction.get(
              runRef
            );


          if (runSnapshot.exists()) {

            run = {

              id:
                runSnapshot.id,

              ...runSnapshot.data(),

            };

          }

        }


        /* =========================================
           DETERMINE BATCH
        ========================================= */

        const batchId =

          run?.batchId

          ||

          activeBatchId

          ||

          null;


        let inventoryRef = null;

        let inventory = null;


        /* =========================================
           READ INVENTORY
        ========================================= */

        if (
          hasValidString(
            batchId
          )
        ) {

          inventoryRef =
            doc(
              db,
              INVENTORY_COLLECTION,
              batchId
            );


          const inventorySnapshot =
            await transaction.get(
              inventoryRef
            );


          if (
            inventorySnapshot.exists()
          ) {

            inventory =
              inventorySnapshot.data();

          }

        }


        /* =========================================
           CANCEL RUN

           Never overwrite terminal history.
        ========================================= */

        if (
          run &&
          runRef
        ) {

          if (
            !TERMINAL_DRYING_RUN_STATUSES.includes(
              run.status
            )
          ) {

            transaction.update(

              runRef,

              {

                status:
                  "cancelled",

                actualEndTime:
                  serverTimestamp(),

                remainingSeconds:
                  null,

                updatedAt:
                  serverTimestamp(),

              }

            );

          }

        }


        /* =========================================
           INVENTORY

           Drying -> Fresh

           Only when currently Drying.
        ========================================= */

        if (

          inventory &&

          inventoryRef &&

          inventory.status ===
          "Drying"

        ) {

          transaction.update(

            inventoryRef,

            {

              status:
                "Fresh",

              targetTemp:
                null,

              durationHours:
                null,

              actualStartTime:
                null,

              updatedAt:
                serverTimestamp(),

            }

          );

        }


        /* =========================================
           CLEAR DEVICE STATE
        ========================================= */

        transaction.update(

          deviceRef,

          {

            machineStatus:
              DEVICE_MACHINE_STATUSES.IDLE,

            activeRunId:
              null,

            activeBatchId:
              null,

            command:
              null,

            commandId:
              null,

            commandRunId:
              null,

            commandCreatedAt:
              null,

            durationSeconds:
              0,

            remainingSeconds:
              0,

            faultCode:
              null,

            faultMessage:
              null,

            faultAt:
              null,

            updatedAt:
              serverTimestamp(),

          }

        );


        return {

          success:
            true,

          runId:
            activeRunId,

          batchId:
            batchId,

          deviceId:
            SMARTCHIP_DEVICE_ID,

          message:
            "SmartChip stale machine state was recovered successfully.",

        };

      }

    );


  return result;

}


/* =====================================================
   ERROR MESSAGE HELPER
===================================================== */

export function getDryingRunErrorMessage(
  error
) {

  if (!error) {

    return (
      "An unknown drying run error occurred."
    );

  }


  if (
    error.code ===
    "permission-denied"
  ) {

    return (
      "Firestore denied this operation. Check your account role and permissions."
    );

  }


  if (
    error.code ===
    "failed-precondition"
  ) {

    return (
      "Firestore requires an index or a required Firestore condition is missing."
    );

  }


  if (
    error.code ===
    "unavailable"
  ) {

    return (
      "SmartChip could not connect to Firestore. Check your internet connection."
    );

  }


  if (
    error.code ===
    "aborted"
  ) {

    return (
      "The operation was interrupted because data changed. Please try again."
    );

  }


  if (
    error.code ===
    "not-found"
  ) {

    return (
      "The required SmartChip record could not be found."
    );

  }


  return (

    error.message

    ||

    "Unable to complete the drying run operation."

  );

}

