import {
  doc,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase";


/* =====================================================
   COLLECTIONS
   ===================================================== */

const INVENTORY_COLLECTION =
  "inventory";

const DRYING_RUNS_COLLECTION =
  "dryingRuns";


/* =====================================================
   VALIDATION
   ===================================================== */

function requireString(
  value,
  fieldName
) {

  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {

    throw new Error(
      `${fieldName} is required.`
    );

  }

}


function validateTemperature(value) {

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0 ||
    value > 100
  ) {

    throw new Error(
      "Target temperature must be between 0 and 100 °C."
    );

  }

}


function validateHumidity(value) {

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {

    throw new Error(
      "Target humidity must be between 0 and 100 %."
    );

  }

}


function validateDuration(value) {

  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0 ||
    value > 168
  ) {

    throw new Error(
      "Drying duration must be between 0 and 168 hours."
    );

  }

}


function validateDate(value) {

  if (
    !(value instanceof Date) ||
    Number.isNaN(
      value.getTime()
    )
  ) {

    throw new Error(
      "A valid scheduled start time is required."
    );

  }

}


/* =====================================================
   SCHEDULE DRYING RUN
   ===================================================== */

/**
 * Atomically performs:
 *
 * inventory:
 *   Fresh → Scheduled
 *
 * dryingRuns:
 *   creates → scheduled
 *
 * If either write fails, the transaction fails.
 */

export async function scheduleDryingRun({
  batchId,
  targetTemp,
  targetHumidity,
  durationHours,
  scheduledStartTime,
  createdBy,
}) {

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


  validateHumidity(
    targetHumidity
  );


  validateDuration(
    durationHours
  );


  validateDate(
    scheduledStartTime
  );


  const inventoryRef =
    doc(
      db,
      INVENTORY_COLLECTION,
      batchId
    );


  /*
   * Generate the Drying Run ID before the
   * transaction so both operations belong to
   * one atomic transaction.
   */

  const dryingRunRef =
    doc(
      db,
      DRYING_RUNS_COLLECTION
    );


  const scheduledTimestamp =
    Timestamp.fromDate(
      scheduledStartTime
    );


  let scheduledBatchNumber =
    null;


  await runTransaction(
    db,
    async (transaction) => {

      /* =============================================
         READ INVENTORY
         ============================================= */

      const inventorySnapshot =
        await transaction.get(
          inventoryRef
        );


      if (
        !inventorySnapshot.exists()
      ) {

        throw new Error(
          "The selected inventory batch does not exist."
        );

      }


      const batch =
        inventorySnapshot.data();


      scheduledBatchNumber =
        batch.batchNumber;


      /* =============================================
         VALIDATE INVENTORY STATE
         ============================================= */

      if (
        batch.status !== "Fresh"
      ) {

        throw new Error(
          "Only Fresh inventory batches can be scheduled."
        );

      }


      if (
        typeof batch.batchNumber !== "string" ||
        batch.batchNumber.trim() === ""
      ) {

        throw new Error(
          "The inventory batch has an invalid batch number."
        );

      }


      if (
        typeof batch.freshWeight !== "number" ||
        !Number.isFinite(
          batch.freshWeight
        ) ||
        batch.freshWeight <= 0
      ) {

        throw new Error(
          "The inventory batch has an invalid fresh weight."
        );

      }


      /* =============================================
         CREATE DRYING RUN
         ============================================= */

      transaction.set(
        dryingRunRef,
        {
          batchId:

            batchId,


          batchNumber:

            batch.batchNumber,


          status:

            "scheduled",


          targetTemp:

            targetTemp,


          targetHumidity:

            targetHumidity,


          durationHours:

            durationHours,


          scheduledStartTime:

            scheduledTimestamp,


          actualStartTime:

            null,


          actualEndTime:

            null,


          initialWeight:

            batch.freshWeight,


          finalWeight:

            null,


          currentTemp:

            null,


          currentHumidity:

            null,


          /*
           * Heater and fan are physically controlled
           * together by one SSR.
           */

          heaterFanState:

            "OFF",


          createdBy:

            createdBy,


          createdAt:

            serverTimestamp(),


          updatedAt:

            serverTimestamp(),
        }
      );


      /* =============================================
         UPDATE INVENTORY
         ============================================= */

      transaction.update(
        inventoryRef,
        {
          status:
            "Scheduled",

          scheduledStartTime:
            scheduledTimestamp,

          targetTemp:
            targetTemp,

          targetHumidity:
            targetHumidity,

          updatedAt:
            serverTimestamp(),
        }
      );

    }
  );


  return {
    runId:
      dryingRunRef.id,

    batchId,

    batchNumber:
      scheduledBatchNumber,
  };

}


/* =====================================================
   ERROR HANDLING
   ===================================================== */

export function getDryingWorkflowErrorMessage(
  error
) {

  if (!error) {

    return (
      "An unknown drying workflow error occurred."
    );

  }


  if (
    error.code ===
    "permission-denied"
  ) {

    return (
      "Firestore denied this drying operation. Check your account role and permissions."
    );

  }


  if (
    error.code ===
    "aborted"
  ) {

    return (
      "The drying operation conflicted with another operation. Please try again."
    );

  }


  if (
    error.code ===
    "failed-precondition"
  ) {

    return (
      "The drying operation could not be completed because the database state is not ready."
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


  return (
    error.message ||
    "Unable to schedule the drying run."
  );

}