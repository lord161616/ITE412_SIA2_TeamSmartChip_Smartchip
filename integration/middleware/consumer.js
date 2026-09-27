// integration/middleware/consumer.js

import dryingQueue from "./queue.js";

function processDryingRequest() {
  if (dryingQueue.length === 0) {
    console.log("No drying requests in queue.");
    return;
  }

  const request = dryingQueue.shift();

  console.log("=================================");
  console.log("PROCESSING DRYING REQUEST");
  console.log("=================================");

  console.log(`Batch ID: ${request.batchId}`);
  console.log(`Batch Name: ${request.batchName}`);
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

processDryingRequest();