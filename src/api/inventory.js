let inventory = [
  {
    id: "BATCH-001",
    product: "Premium Oyster Mushrooms",
    weightKg: 10,
    status: "Fresh"
  }
];

export function getInventory() {
  return inventory;
}

export function getInventoryById(id) {
  return inventory.find(item => item.id === id);
}

export function createInventory(data) {
  const newId = `BATCH-${String(inventory.length + 1).padStart(3, "0")}`;

  const newItem = {
    id: newId,
    product: data.product,
    weightKg: Number(data.weightKg),
    status: data.status || "Fresh"
  };

  inventory.push(newItem);

  return newItem;
}

export function updateInventory(id, data) {
  const index = inventory.findIndex(
    item => item.id === id
  );

  if (index === -1) {
    return null;
  }

  inventory[index] = {
    ...inventory[index],
    ...data,
    id: inventory[index].id
  };

  return inventory[index];
}

export function deleteInventory(id) {
  const index = inventory.findIndex(
    item => item.id === id
  );

  if (index === -1) {
    return false;
  }

  inventory.splice(index, 1);

  return true;
}