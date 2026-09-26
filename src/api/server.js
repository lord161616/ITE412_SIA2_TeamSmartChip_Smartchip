import express from "express";

import {
  getDryingRuns,
  getDryingRunById,
  createDryingRun,
  updateDryingRun,
  deleteDryingRun
} from "./dryingRuns.js";

import {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory
} from "./inventory.js";

const app = express();

const PORT = 3000;

app.use(express.json());

/* =========================================================
   BASIC API TEST
========================================================= */

app.get("/", (req, res) => {
  res.json({
    message: "SmartChip REST API is running"
  });
});


/* =========================================================
   DRYING RUNS
========================================================= */

// GET all drying runs
app.get("/drying-runs", (req, res) => {
  res.status(200).json(getDryingRuns());
});


// GET one drying run
app.get("/drying-runs/:id", (req, res) => {
  const dryingRun = getDryingRunById(req.params.id);

  if (!dryingRun) {
    return res.status(404).json({
      error: "Drying run not found"
    });
  }

  res.status(200).json(dryingRun);
});


// POST a drying run
app.post("/drying-runs", (req, res) => {
  const {
    batchId,
    targetTemperature,
    durationHours,
    status
  } = req.body;

  if (
    !batchId ||
    targetTemperature === undefined ||
    durationHours === undefined
  ) {
    return res.status(400).json({
      error:
        "batchId, targetTemperature, and durationHours are required"
    });
  }

  const newRun = createDryingRun({
    batchId,
    targetTemperature,
    durationHours,
    status
  });

  res.status(201).json(newRun);
});


// PUT a drying run
app.put("/drying-runs/:id", (req, res) => {
  const updatedRun = updateDryingRun(
    req.params.id,
    req.body
  );

  if (!updatedRun) {
    return res.status(404).json({
      error: "Drying run not found"
    });
  }

  res.status(200).json(updatedRun);
});


// DELETE a drying run
app.delete("/drying-runs/:id", (req, res) => {
  const deleted = deleteDryingRun(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      error: "Drying run not found"
    });
  }

  res.status(200).json({
    message: "Drying run deleted successfully"
  });
});


/* =========================================================
   INVENTORY
========================================================= */

// GET all inventory
app.get("/inventory", (req, res) => {
  res.status(200).json(getInventory());
});


// GET one inventory batch
app.get("/inventory/:id", (req, res) => {
  const item = getInventoryById(req.params.id);

  if (!item) {
    return res.status(404).json({
      error: "Inventory batch not found"
    });
  }

  res.status(200).json(item);
});


// POST inventory
app.post("/inventory", (req, res) => {
  const {
    product,
    weightKg,
    status
  } = req.body;

  if (
    !product ||
    weightKg === undefined
  ) {
    return res.status(400).json({
      error: "product and weightKg are required"
    });
  }

  const newItem = createInventory({
    product,
    weightKg,
    status
  });

  res.status(201).json(newItem);
});


// PUT inventory
app.put("/inventory/:id", (req, res) => {
  const updatedItem = updateInventory(
    req.params.id,
    req.body
  );

  if (!updatedItem) {
    return res.status(404).json({
      error: "Inventory batch not found"
    });
  }

  res.status(200).json(updatedItem);
});


// DELETE inventory
app.delete("/inventory/:id", (req, res) => {
  const deleted = deleteInventory(req.params.id);

  if (!deleted) {
    return res.status(404).json({
      error: "Inventory batch not found"
    });
  }

  res.status(200).json({
    message: "Inventory batch deleted successfully"
  });
});


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found"
  });
});


/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `SmartChip REST API running at http://localhost:${PORT}`
  );
});