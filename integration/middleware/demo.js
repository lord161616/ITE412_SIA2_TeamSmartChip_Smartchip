// integration/middleware/demo.js

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
  console.log("PRODUCER - DRYING REQUEST");
  console.log("=================================");

  console.log(`Batch ID: ${batchId}`);
  console.log(`Batch Name: ${batchName}`);
  console.log(`Target Temperature: ${targetTemperature}°C`);
  console.log(`Duration: ${duration} hours`);

  dryingQueue.push(request);

  console.log("Message added to queue.");
  console.log("Queue size:", dryingQueue.length);
  console.log();
}

function processDryingRequest() {
  if (dryingQueue.length === 0) {
    console.log("=================================");
    console.log("QUEUE EMPTY");
    console.log("=================================");
    console.log("All drying requests have been processed.");
    return;
  }

  const request = dryingQueue.shift();

  console.log("=================================");
  console.log("CONSUMER - PROCESSING REQUEST");
  console.log("=================================");

  console.log(`Batch ID: ${request.batchId}`);
  console.log(`Target Temperature: ${request.targetTemperature}°C`);
  console.log(`Duration: ${request.duration} hours`);

  setTimeout(() => {
    if (
      request.targetTemperature >= 30 &&
      request.targetTemperature <= 75
    ) {
      console.log(
        `Drying request for ${request.batchId} → APPROVED`
      );
    } else {
      console.log(
        `Drying request for ${request.batchId} → REJECTED`
      );
    }

    console.log("Request processing completed.");
    console.log("Remaining queue:", dryingQueue.length);
    console.log();

    processDryingRequest();
  }, 1000);
}

// ==========================================
// SMARTCHIP MESSAGING MIDDLEWARE DEMO
// ==========================================

console.log("\n");
console.log("=========================================");
console.log("SMARTCHIP MESSAGING MIDDLEWARE DEMO");
console.log("=========================================\n");

// ==========================================
// PRODUCER
// ==========================================

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

// ==========================================
// CONSUMER
// ==========================================

console.log("Starting asynchronous consumer...\n");

processDryingRequest();