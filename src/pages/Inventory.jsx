
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import "../styles/inventory.css";

import {
  FaArchive,
  FaEdit,
  FaPlus,
  FaSearch,
} from "react-icons/fa";

import {
  useAuth,
} from "../context/AuthContext";

import {
  archiveInventoryBatch,
  createInventoryBatch,
  getInventoryErrorMessage,
  subscribeToInventory,
  updateInventoryBatch,
} from "../services/inventoryService";


export default function Inventory() {

  const {
    user,
    role,
    isActive,
  } = useAuth();


  const [inventoryData, setInventoryData] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");


  const [formData, setFormData] = useState({
    batchNumber: "",
    freshWeight: "",
    harvestDate: "",
  });


  /* ==========================================================
     PERMISSIONS
     ========================================================== */

  const isAdministrator =
    role === "administrator";


  const isOperator =
    role === "operator";


  const canManageInventory =
    isActive &&
    (
      isAdministrator ||
      isOperator
    );


  /* ==========================================================
     REAL-TIME INVENTORY
     ========================================================== */

  useEffect(() => {

    setLoading(true);
    setError("");


    const unsubscribe =
      subscribeToInventory(

        (inventory) => {

          setInventoryData(
            Array.isArray(inventory)
              ? inventory
              : []
          );

          setLoading(false);

        },

        (firebaseError) => {

          console.error(
            "Inventory subscription error:",
            firebaseError
          );


          setError(
            getInventoryErrorMessage(
              firebaseError
            )
          );


          setLoading(false);

        }

      );


    return () => {

      if (
        typeof unsubscribe ===
        "function"
      ) {

        unsubscribe();

      }

    };

  }, []);


  /* ==========================================================
     FILTERED INVENTORY
     ========================================================== */

  const filteredInventory =
    useMemo(() => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      return inventoryData.filter(
        (item) => {

          const matchesSearch =
            !search ||
            String(
              item.batchNumber ?? ""
            )
              .toLowerCase()
              .includes(search);


          const matchesStatus =
            statusFilter === "All" ||
            item.status === statusFilter;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      inventoryData,
      searchTerm,
      statusFilter,
    ]);


  /* ==========================================================
     SUMMARY
     ========================================================== */

  const summary =
    useMemo(() => {

      const activeItems =
        inventoryData.filter(
          (item) =>
            item.status !==
            "Archived"
        );


      const totalFreshWeight =
        activeItems.reduce(
          (total, item) =>
            total +
            Number(
              item.freshWeight || 0
            ),
          0
        );


      const freshCount =
        inventoryData.filter(
          (item) =>
            item.status ===
            "Fresh"
        ).length;


      const dryingCount =
        inventoryData.filter(
          (item) =>
            item.status ===
            "Drying"
        ).length;


      const driedCount =
        inventoryData.filter(
          (item) =>
            item.status ===
            "Dried"
        ).length;


      return {

        totalBatches:
          activeItems.length,

        totalFreshWeight,

        freshCount,

        dryingCount,

        driedCount,

      };

    }, [
      inventoryData,
    ]);


  /* ==========================================================
     FORM HANDLING
     ========================================================== */

  const handleChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setFormData(
        (previous) => ({

          ...previous,

          [name]:
            value,

        })
      );

    };


  /* ==========================================================
     SAVE BATCH
     ========================================================== */

  const handleSaveBatch =
    async (event) => {

      event.preventDefault();


      if (!canManageInventory) {

        setError(
          "You do not have permission to manage inventory."
        );

        return;

      }


      const batchNumber =
        String(
          formData.batchNumber ?? ""
        ).trim();


      const freshWeight =
        Number(
          formData.freshWeight
        );


      const harvestDate =
        String(
          formData.harvestDate ?? ""
        ).trim();


      if (
        !batchNumber ||
        batchNumber.length > 50
      ) {

        setError(
          "Batch ID is required and must be 50 characters or fewer."
        );

        return;

      }


      if (
        !Number.isFinite(
          freshWeight
        ) ||
        freshWeight <= 0
      ) {

        setError(
          "Fresh weight must be greater than 0 kg."
        );

        return;

      }


      if (!harvestDate) {

        setError(
          "Harvest date is required."
        );

        return;

      }


      setSaving(true);
      setError("");


      try {

        const cleanedFormData = {

          batchNumber,

          freshWeight,

          harvestDate,

        };


        if (editingId) {

          await updateInventoryBatch(
            editingId,
            cleanedFormData
          );

        } else {

          await createInventoryBatch(
            cleanedFormData
          );

        }


        resetForm();

      } catch (operationError) {

        console.error(
          "Failed to save inventory batch:",
          operationError
        );


        setError(
          getInventoryErrorMessage(
            operationError
          )
        );

      } finally {

        setSaving(false);

      }

    };


  /* ==========================================================
     EDIT BATCH
     ========================================================== */

  const handleEdit =
    (item) => {

      if (!canManageInventory) {

        setError(
          "You do not have permission to edit inventory."
        );

        return;

      }


      if (
        item.status !==
        "Fresh"
      ) {

        setError(
          "Only Fresh batches can be edited."
        );

        return;

      }


      setFormData({

        batchNumber:
          item.batchNumber ?? "",

        freshWeight:
          item.freshWeight ?? "",

        harvestDate:
          item.harvestDate ?? "",

      });


      setEditingId(
        item.id
      );


      setShowForm(
        true
      );


      setError("");

    };


  /* ==========================================================
     ARCHIVE
     ========================================================== */

  const handleArchive =
    async (item) => {

      if (!isAdministrator) {

        setError(
          "Only administrators can archive inventory batches."
        );

        return;

      }


      if (
        item.status ===
        "Archived"
      ) {

        return;

      }


      if (
        item.status ===
        "Drying"
      ) {

        setError(
          "A batch currently being dried cannot be archived."
        );

        return;

      }


      const confirmed =
        window.confirm(
          `Archive batch "${item.batchNumber}"? This will remove it from active inventory. The record will be preserved.`
        );


      if (!confirmed) {

        return;

      }


      setSaving(true);
      setError("");


      try {

        await archiveInventoryBatch(
          item.id
        );

      } catch (operationError) {

        console.error(
          "Failed to archive batch:",
          operationError
        );


        setError(
          getInventoryErrorMessage(
            operationError
          )
        );

      } finally {

        setSaving(false);

      }

    };


  /* ==========================================================
     RESET FORM
     ========================================================== */

  const resetForm =
    () => {

      setFormData({

        batchNumber: "",

        freshWeight: "",

        harvestDate: "",

      });


      setEditingId(
        null
      );


      setShowForm(
        false
      );

    };


  /* ==========================================================
     RENDER
     ========================================================== */

  return (

    <div className="page-container">

      {/* ====================================================
          HEADER
          ==================================================== */}

      <div className="inventory-header">

        <div>

          <h2>
            Inventory Management
          </h2>

          <small>
            Harvest and drying batch inventory
          </small>

        </div>


        {canManageInventory && (

          <button
            className="add-btn"
            type="button"
            onClick={() => {

              setError("");


              if (showForm) {

                resetForm();

              } else {

                setEditingId(
                  null
                );


                setFormData({

                  batchNumber: "",

                  freshWeight: "",

                  harvestDate: "",

                });


                setShowForm(
                  true
                );

              }

            }}
            disabled={
              saving
            }
          >

            <FaPlus />

            {showForm
              ? "Cancel"
              : "Add New Batch"}

          </button>

        )}

      </div>


      {/* ====================================================
          SUMMARY
          ==================================================== */}

      <div className="inventory-summary">

        <div className="summary-card">

          <span>
            Active Batches
          </span>

          <strong>
            {summary.totalBatches}
          </strong>

        </div>


        <div className="summary-card">

          <span>
            Fresh Weight
          </span>

          <strong>
            {summary.totalFreshWeight.toFixed(2)}
            {" kg"}
          </strong>

        </div>


        <div className="summary-card">

          <span>
            Fresh Batches
          </span>

          <strong>
            {summary.freshCount}
          </strong>

        </div>


        <div className="summary-card">

          <span>
            Drying Batches
          </span>

          <strong>
            {summary.dryingCount}
          </strong>

        </div>


        <div className="summary-card">

          <span>
            Dried Batches
          </span>

          <strong>
            {summary.driedCount}
          </strong>

        </div>

      </div>


      {/* ====================================================
          ERROR
          ==================================================== */}

      {error && (

        <div
          className="inventory-error"
          role="alert"
        >
          {error}
        </div>

      )}


      {/* ====================================================
          ADD / EDIT FORM
          ==================================================== */}

      {showForm &&
        canManageInventory && (

          <div className="form-card">

            <h3 className="form-title">

              {editingId
                ? "Edit Batch Details"
                : "Add New Harvest Batch"}

            </h3>


            <form
              onSubmit={
                handleSaveBatch
              }
              className="inventory-form"
            >

              {/* =================================================
                  BATCH NUMBER
                  ================================================= */}

              <div className="form-group">

                <label>
                  Batch ID
                </label>

                <input
                  type="text"
                  name="batchNumber"
                  value={
                    formData.batchNumber
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={50}
                  required
                  disabled={
                    saving
                  }
                  autoComplete="off"
                />

                <small>
                  Example: SH-2026-001
                </small>

              </div>


              {/* =================================================
                  FRESH WEIGHT
                  ================================================= */}

              <div className="form-group">

                <label>
                  Fresh Weight at Harvest (kg)
                </label>

                <input
                  type="number"
                  name="freshWeight"
                  value={
                    formData.freshWeight
                  }
                  onChange={
                    handleChange
                  }
                  min="0.01"
                  step="0.01"
                  required
                  disabled={
                    saving
                  }
                />

                <small>
                  Total fresh weight before drying.
                </small>

              </div>


              {/* =================================================
                  HARVEST DATE
                  ================================================= */}

              <div className="form-group">

                <label>
                  Date of Harvest
                </label>

                <input
                  type="date"
                  name="harvestDate"
                  value={
                    formData.harvestDate
                  }
                  onChange={
                    handleChange
                  }
                  required
                  disabled={
                    saving
                  }
                />

              </div>


              {/* =================================================
                  SAVE
                  ================================================= */}

              <button
                type="submit"
                className="save-btn"
                disabled={
                  saving
                }
              >

                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Batch"
                    : "Save Batch"}

              </button>


              {editingId && (

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    resetForm
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>

              )}

            </form>

          </div>

        )}


      {/* ====================================================
          FILTERS
          ==================================================== */}

      <div className="inventory-filters card">

        <div className="search-box">

          <FaSearch />

          <input
            type="text"
            placeholder="Search batch ID..."
            value={
              searchTerm
            }
            onChange={
              (event) =>
                setSearchTerm(
                  event.target.value
                )
            }
          />

        </div>


        <select
          value={
            statusFilter
          }
          onChange={
            (event) =>
              setStatusFilter(
                event.target.value
              )
          }
        >

          <option value="All">
            All Statuses
          </option>

          <option value="Fresh">
            Fresh
          </option>

          <option value="Drying">
            Drying
          </option>

          <option value="Dried">
            Dried
          </option>

          <option value="Archived">
            Archived
          </option>

        </select>

      </div>


      {/* ====================================================
          TABLE
          ==================================================== */}

      <div className="inventory-table card">

        {loading ? (

          <div className="inventory-message">
            Loading inventory...
          </div>

        ) : filteredInventory.length === 0 ? (

          <div className="inventory-message">
            No inventory batches found.
          </div>

        ) : (

          <table>

            <thead>

              <tr>

                <th>
                  Batch ID
                </th>

                <th>
                  Harvest Date
                </th>

                <th>
                  Fresh Weight (kg)
                </th>

                <th>
                  Status
                </th>

                {canManageInventory && (

                  <th>
                    Actions
                  </th>

                )}

              </tr>

            </thead>


            <tbody>

              {filteredInventory.map(
                (item) => (

                  <tr
                    key={
                      item.id
                    }
                  >

                    <td>
                      {item.batchNumber}
                    </td>

                    <td>
                      {item.harvestDate}
                    </td>

                    <td>
                      {formatNumber(
                        item.freshWeight
                      )}
                    </td>

                    <td>

                      <span
                        className={
                          `badge status-${
                            String(
                              item.status ??
                              "Fresh"
                            ).toLowerCase()
                          }`
                        }
                      >

                        {item.status ??
                          "Fresh"}

                      </span>

                    </td>


                    {canManageInventory && (

                      <td className="action-group">

                        {/* =========================================
                            EDIT
                            ========================================= */}

                        {item.status ===
                          "Fresh" && (

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                item
                              )
                            }
                            className="edit-btn"
                            title="Edit batch"
                            disabled={
                              saving
                            }
                          >

                            <FaEdit />

                          </button>

                        )}


                        {/* =========================================
                            ARCHIVE
                            ========================================= */}

                        {isAdministrator &&
                          item.status !==
                            "Archived" &&
                          item.status !==
                            "Drying" && (

                          <button
                            type="button"
                            onClick={() =>
                              handleArchive(
                                item
                              )
                            }
                            className="archive-btn"
                            title="Archive batch"
                            disabled={
                              saving
                            }
                          >

                            <FaArchive />

                          </button>

                        )}

                      </td>

                    )}

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>

    </div>

  );

}


/* ============================================================
   NUMBER FORMAT
   ============================================================ */

function formatNumber(
  value
) {

  const number =
    Number(value);


  if (
    !Number.isFinite(
      number
    )
  ) {

    return "-";

  }


  return number.toFixed(2);

}

