import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

/*
 * ============================================================
 * INVENTORY STATUS
 * ============================================================
 */

export const INVENTORY_STATUSES = [
  "Fresh",
  "Drying",
  "Dried",
  "Archived",
];

/*
 * ============================================================
 * STATUS TRANSITIONS
 * ============================================================
 */

export const INVENTORY_TRANSITIONS = {
  Fresh: [
    "Drying",
    "Archived",
  ],

  Drying: [
    "Dried",
    "Archived",
  ],

  Dried: [
    "Archived",
  ],

  Archived: [],
};

/*
 * ============================================================
 * VALIDATION
 * ============================================================
 */

function validateBatchData(data) {
  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "Invalid inventory data."
    );
  }

  const batchNumber =
    typeof data.batchNumber === "string"
      ? data.batchNumber.trim()
      : "";

  if (!batchNumber) {
    throw new Error(
      "Batch ID is required."
    );
  }

  if (
    batchNumber.length > 50
  ) {
    throw new Error(
      "Batch ID cannot exceed 50 characters."
    );
  }

  const freshWeight =
    Number(
      data.freshWeight
    );

  if (
    !Number.isFinite(
      freshWeight
    ) ||
    freshWeight <= 0
  ) {
    throw new Error(
      "Fresh weight must be greater than 0 kg."
    );
  }

  const harvestDate =
    typeof data.harvestDate === "string"
      ? data.harvestDate.trim()
      : "";

  if (!harvestDate) {
    throw new Error(
      "Harvest date is required."
    );
  }

  return {
    batchNumber,
    freshWeight,
    harvestDate,
  };
}

/*
 * ============================================================
 * SUBSCRIBE
 * ============================================================
 */

export function subscribeToInventory(
  callback,
  onError
) {
  if (
    typeof callback !== "function"
  ) {
    throw new Error(
      "Inventory callback is required."
    );
  }

  const inventoryQuery =
    query(
      collection(
        db,
        "inventory"
      ),
      orderBy(
        "createdAt",
        "desc"
      )
    );

  return onSnapshot(
    inventoryQuery,

    (snapshot) => {
      const inventory =
        snapshot.docs.map(
          (inventoryDoc) => ({
            id:
              inventoryDoc.id,

            ...inventoryDoc.data(),
          })
        );

      callback(
        inventory
      );
    },

    (error) => {
      console.error(
        "Failed to subscribe to inventory:",
        error
      );

      if (onError) {
        onError(error);
      }
    }
  );
}

/*
 * ============================================================
 * CREATE
 * ============================================================
 */

export async function createInventoryBatch(
  batchData
) {
  const validatedData =
    validateBatchData(
      batchData
    );

  return addDoc(
    collection(
      db,
      "inventory"
    ),
    {
      batchNumber:
        validatedData.batchNumber,

      freshWeight:
        validatedData.freshWeight,

      harvestDate:
        validatedData.harvestDate,

      driedWeight:
        null,

      status:
        "Fresh",

      actualStartTime:
        null,

      expectedEndTime:
        null,

      durationHours:
        null,

      targetTemp:
        null,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    }
  );
}

/*
 * ============================================================
 * UPDATE BATCH DETAILS
 * ============================================================
 */

export async function updateInventoryBatch(
  batchId,
  batchData
) {
  if (!batchId) {
    throw new Error(
      "Inventory batch ID is required."
    );
  }

  const validatedData =
    validateBatchData(
      batchData
    );

  return updateDoc(
    doc(
      db,
      "inventory",
      batchId
    ),
    {
      batchNumber:
        validatedData.batchNumber,

      freshWeight:
        validatedData.freshWeight,

      harvestDate:
        validatedData.harvestDate,

      updatedAt:
        serverTimestamp(),
    }
  );
}

/*
 * ============================================================
 * ARCHIVE
 * ============================================================
 */

export async function archiveInventoryBatch(
  batchId
) {
  if (!batchId) {
    throw new Error(
      "Inventory batch ID is required."
    );
  }

  return updateDoc(
    doc(
      db,
      "inventory",
      batchId
    ),
    {
      status:
        "Archived",

      updatedAt:
        serverTimestamp(),
    }
  );
}

/*
 * ============================================================
 * ERROR MESSAGE
 * ============================================================
 */

export function getInventoryErrorMessage(
  error
) {
  if (!error) {
    return (
      "An unknown inventory error occurred."
    );
  }

  if (
    error.code ===
    "permission-denied"
  ) {
    return (
      "Firestore denied this inventory operation. Check your account role and permissions."
    );
  }

  if (
    error.code ===
    "failed-precondition"
  ) {
    return (
      "Firestore requires an index for this inventory query."
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
    "Unable to complete the inventory operation."
  );
}