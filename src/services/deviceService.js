
import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

import {
  DEVICE_ID,
  DEVICE_COMMANDS,
  MACHINE_STATUSES,
} from "./device";


/* =====================================================
   DEVICE DOCUMENT
===================================================== */

const DEVICE_COLLECTION = "devices";


/* =====================================================
   GET DEVICE REFERENCE
===================================================== */

export function getDeviceRef() {

  return doc(
    db,
    DEVICE_COLLECTION,
    DEVICE_ID
  );

}


/* =====================================================
   GENERATE COMMAND ID
===================================================== */

/*

A command ID prevents duplicate command processing.

Example:

START
commandId: "cmd-172..."

If ESP32 reconnects and sees the same command again,
it can compare:

commandId

with:

lastProcessedCommandId

and ignore duplicate commands.

*/

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
   GET DEVICE
===================================================== */

/*

Reads the current SmartChip device document once.

Does not create or modify anything.

*/

export async function getDevice() {

  const deviceRef =
    getDeviceRef();

  const snapshot =
    await getDoc(deviceRef);

  if (!snapshot.exists()) {

    return null;

  }

  return {

    id: snapshot.id,

    ...snapshot.data(),

  };

}


/* =====================================================
   SUBSCRIBE TO DEVICE
===================================================== */

/*

Real-time listener.

Used by:

Dashboard
Sensors
Machine controls
Analytics

Firestore pushes updates automatically.

No manual polling required.

*/

export function subscribeToDevice(
  onData,
  onError
) {

  const deviceRef =
    getDeviceRef();

  return onSnapshot(

    deviceRef,

    (snapshot) => {

      if (!snapshot.exists()) {

        onData(null);

        return;

      }

      onData({

        id: snapshot.id,

        ...snapshot.data(),

      });

    },

    (error) => {

      console.error(
        "SmartChip device subscription error:",
        error
      );

      if (typeof onError === "function") {

        onError(error);

      }

    }

  );

}


/* =====================================================
   SEND START COMMAND
===================================================== */

/*

IMPORTANT:

This service only sends a command request.

It DOES NOT claim:

heater ON
fan ON
SSR ON
machine preheating

Those are physical machine states and must be confirmed
by the ESP32.

The ESP32 is the authority for actual hardware status.

Expected web → Firestore flow:

Device
   ↓
Verify idle
   ↓
Verify unlocked
   ↓
Write START command
   ↓
machineStatus = starting

ESP32
   ↓
Receive START
   ↓
Validate sensors
   ↓
Validate run
   ↓
Start machine
   ↓
machineStatus = preheating

*/

export async function sendStartCommand({

  runId,

  batchId,

}) {

  if (
    !runId ||
    typeof runId !== "string"
  ) {

    throw new Error(
      "A valid drying run ID is required."
    );

  }

  if (
    !batchId ||
    typeof batchId !== "string"
  ) {

    throw new Error(
      "A valid batch ID is required."
    );

  }

  const deviceRef =
    getDeviceRef();

  const commandId =
    generateCommandId();

  await runTransaction(
    db,

    async (transaction) => {

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


      /* =============================================
         VERIFY MACHINE STATUS
      ============================================= */

      if (
        device.machineStatus !==
        MACHINE_STATUSES.IDLE
      ) {

        throw new Error(
          `Machine is not ready. Current status: ${
            device.machineStatus || "unknown"
          }.`
        );

      }


      /* =============================================
         VERIFY DEVICE LOCK
      ============================================= */

      if (
        device.activeRunId ||
        device.activeBatchId
      ) {

        throw new Error(
          "The SmartChip machine is already locked by another drying run."
        );

      }


      /* =============================================
         VERIFY NO ACTIVE COMMAND
      ============================================= */

      if (device.command) {

        throw new Error(
          "The SmartChip device already has a pending command."
        );

      }


      /* =============================================
         WRITE START COMMAND
      ============================================= */

      transaction.update(
        deviceRef,

        {

          activeRunId:
            runId,

          activeBatchId:
            batchId,


          command:
            DEVICE_COMMANDS.START,

          commandId:
            commandId,

          commandRunId:
            runId,

          commandCreatedAt:
            serverTimestamp(),


          /* =============================
             WEB REQUEST STATE

             This means:

             "START command successfully
              requested"

             It does NOT mean the heater
             physically started.

          ============================= */

          machineStatus:
            MACHINE_STATUSES.STARTING,


          updatedAt:
            serverTimestamp(),

        }

      );

    }

  );

  return {

    success: true,

    command:
      DEVICE_COMMANDS.START,

    commandId,

    runId,

    batchId,

  };

}


/* =====================================================
   SEND STOP COMMAND
===================================================== */

/*

IMPORTANT:

The web application requests STOP.

The web application does NOT clear:

activeRunId
activeBatchId

The ESP32 must:

1. Receive STOP
2. Turn SSR OFF
3. Confirm hardware OFF
4. Report states OFF
5. Update machine status
6. Release device lock

This prevents the web application from claiming
the physical machine stopped before it actually did.

*/

export async function sendStopCommand({

  runId,

}) {

  if (
    !runId ||
    typeof runId !== "string"
  ) {

    throw new Error(
      "A valid drying run ID is required."
    );

  }

  const deviceRef =
    getDeviceRef();

  const commandId =
    generateCommandId();

  await runTransaction(
    db,

    async (transaction) => {

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


      /* =============================================
         VERIFY ACTIVE RUN
      ============================================= */

      if (
        !device.activeRunId
      ) {

        throw new Error(
          "There is no active drying run on the SmartChip device."
        );

      }


      /* =============================================
         VERIFY RUN MATCH
      ============================================= */

      if (
        device.activeRunId !== runId
      ) {

        throw new Error(
          "This drying run does not control the active SmartChip machine."
        );

      }


      /* =============================================
         VERIFY NO PENDING COMMAND
      ============================================= */

      if (device.command) {

        throw new Error(
          "The SmartChip device already has a pending command."
        );

      }


      /* =============================================
         WRITE STOP COMMAND
      ============================================= */

      transaction.update(
        deviceRef,

        {

          command:
            DEVICE_COMMANDS.STOP,

          commandId:
            commandId,

          commandRunId:
            runId,

          commandCreatedAt:
            serverTimestamp(),


          /* =============================
             Do NOT set machineStatus to
             idle here.

             ESP32 must physically stop
             the machine first.

          ============================= */

          updatedAt:
            serverTimestamp(),

        }

      );

    }

  );

  return {

    success: true,

    command:
      DEVICE_COMMANDS.STOP,

    commandId,

    runId,

  };

}


/* =====================================================
   CHECK IF DEVICE IS LOCKED
===================================================== */

/*

Utility function.

Useful for UI validation.

Authoritative validation must still happen inside
Firestore transactions.

Never rely only on this function for START safety.

*/

export function isDeviceLocked(
  device
) {

  if (!device) {

    return false;

  }

  return Boolean(

    device.activeRunId ||
    device.activeBatchId

  );

}


/* =====================================================
   CHECK IF DEVICE IS IDLE
===================================================== */

export function isDeviceIdle(
  device
) {

  if (!device) {

    return false;

  }

  return (
    device.machineStatus ===
    MACHINE_STATUSES.IDLE
  );

}


/* =====================================================
   CHECK IF DEVICE HAS PENDING COMMAND
===================================================== */

export function hasPendingCommand(
  device
) {

  if (!device) {

    return false;

  }

  return Boolean(
    device.command
  );

}

