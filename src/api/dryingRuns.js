let dryingRuns = [
  {
    id: 1,
    batchId: "BATCH-001",
    targetTemperature: 60,
    durationHours: 6,
    status: "scheduled"
  }
];

export function getDryingRuns() {
  return dryingRuns;
}

export function getDryingRunById(id) {
  return dryingRuns.find(run => run.id === Number(id));
}

export function createDryingRun(data) {
  const newRun = {
    id: dryingRuns.length > 0
      ? Math.max(...dryingRuns.map(run => run.id)) + 1
      : 1,
    batchId: data.batchId,
    targetTemperature: Number(data.targetTemperature),
    durationHours: Number(data.durationHours),
    status: data.status || "scheduled"
  };

  dryingRuns.push(newRun);

  return newRun;
}

export function updateDryingRun(id, data) {
  const index = dryingRuns.findIndex(
    run => run.id === Number(id)
  );

  if (index === -1) {
    return null;
  }

  dryingRuns[index] = {
    ...dryingRuns[index],
    ...data,
    id: dryingRuns[index].id
  };

  return dryingRuns[index];
}

export function deleteDryingRun(id) {
  const index = dryingRuns.findIndex(
    run => run.id === Number(id)
  );

  if (index === -1) {
    return false;
  }

  dryingRuns.splice(index, 1);

  return true;
}