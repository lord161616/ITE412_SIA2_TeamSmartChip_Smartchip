// integration/middleware/producer.js

import dryingQueue from "./queue.js";

function submitDryingRequest(
  batchId,
  batchName,
  targetTemperature,
  duration
) {
  const request = {
    batchId,
    batchName,
    targetTemperature,
    duration,
    status: "pending"
  };

  console.log("=================================");
  console.log("DRYING REQUEST SUBMITTED");
  console.log("=================================");
  console.log(request);

  dryingQueue.push(request);

  console.log("Message added to drying queue.");
  console.log("Queue size:", dryingQueue.length);
  console.log();
}

// Sample SmartChip drying requests

submitDryingRequest(
  "SC-BATCH-001",
  "Premium Oyster Mushroom",
  55,
  4
);

submitDryingRequest(
  "SC-BATCH-002",
  "Premium Oyster Mushroom",
  65,
  6
);

submitDryingRequest(
  "SC-BATCH-003",
  "Premium Oyster Mushroom",
  80,
  5
);