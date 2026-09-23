
import React, {
  useEffect,
  useState,
} from "react";

import "../styles/history.css";

import { db } from "../firebase";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";


export default function History() {

  const [records, setRecords] =
    useState([]);

  const [filteredRecords, setFilteredRecords] =
    useState([]);

  const [filters, setFilters] =
    useState({
      startDate: "",
      endDate: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
   * ============================================================
   * SUBSCRIBE TO DRYING RUNS
   * ============================================================
   */

  useEffect(() => {

    const dryingRunsQuery =
      query(
        collection(
          db,
          "dryingRuns"
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      );


    const unsubscribe =
      onSnapshot(

        dryingRunsQuery,

        (snapshot) => {

          const completedRuns =
            snapshot.docs
              .map(
                (runDoc) => ({
                  id:
                    runDoc.id,

                  ...runDoc.data(),
                })
              )
              .filter(
                (run) =>
                  run.status ===
                  "completed"
              );


          setRecords(
            completedRuns
          );

          setFilteredRecords(
            completedRuns
          );

          setLoading(
            false
          );

          setError(
            ""
          );

        },


        (snapshotError) => {

          console.error(
            "Failed to load drying history:",
            snapshotError
          );

          setError(
            "Unable to load drying history."
          );

          setLoading(
            false
          );

        }

      );


    return () =>
      unsubscribe();

  }, []);


  /*
   * ============================================================
   * APPLY DATE FILTERS
   * ============================================================
   */

  const applyFilters = () => {

    let filtered =
      [...records];


    if (
      filters.startDate
    ) {

      const start =
        new Date(
          `${filters.startDate}T00:00:00`
        );


      filtered =
        filtered.filter(
          (run) => {

            const completedDate =
              run.actualEndTime
                ?.toDate?.();

            return (
              completedDate &&
              completedDate >= start
            );

          }
        );

    }


    if (
      filters.endDate
    ) {

      const end =
        new Date(
          `${filters.endDate}T23:59:59.999`
        );


      filtered =
        filtered.filter(
          (run) => {

            const completedDate =
              run.actualEndTime
                ?.toDate?.();

            return (
              completedDate &&
              completedDate <= end
            );

          }
        );

    }


    setFilteredRecords(
      filtered
    );

  };


  /*
   * ============================================================
   * CLEAR FILTERS
   * ============================================================
   */

  const clearFilters = () => {

    setFilters({
      startDate: "",
      endDate: "",
    });


    setFilteredRecords(
      records
    );

  };


  /*
   * ============================================================
   * CALCULATE YIELD
   * ============================================================
   */

  const calculateYield =
    (
      initialWeight,
      finalWeight
    ) => {

      const initial =
        Number(
          initialWeight
        );

      const final =
        Number(
          finalWeight
        );


      if (
        !Number.isFinite(initial) ||
        !Number.isFinite(final) ||
        initial <= 0
      ) {

        return null;

      }


      return (
        final /
        initial
      ) * 100;

    };


  /*
   * ============================================================
   * YIELD STYLE
   * ============================================================
   */

  const getYieldClass =
    (
      yieldPercentage
    ) => {

      const value =
        Number(
          yieldPercentage
        );


      if (
        !Number.isFinite(value)
      ) {

        return "";

      }


      if (
        value >= 20
      ) {

        return "yield-high";

      }


      if (
        value >= 15
      ) {

        return "yield-medium";

      }


      return "yield-low";

    };


  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */

  const formatDateTime =
    (
      timestamp
    ) => {

      if (
        !timestamp
      ) {

        return "-";

      }


      const date =
        timestamp.toDate?.();


      if (
        !date
      ) {

        return "-";

      }


      return date.toLocaleString();

    };


  /*
   * ============================================================
   * FORMAT NUMBER
   * ============================================================
   */

  const formatNumber =
    (
      value
    ) => {

      const number =
        Number(value);


      if (
        !Number.isFinite(number)
      ) {

        return "-";

      }


      return number.toFixed(2);

    };


  return (

    <div className="page-container">


      <h2 className="page-title">
        Drying History
      </h2>


      {/* =====================================================
          FILTERS
          ===================================================== */}

      <div className="card filter-card">

        <div className="filter-row">


          <div className="filter-group">

            <label>
              From Date
            </label>

            <input
              type="date"

              value={
                filters.startDate
              }

              onChange={
                (event) =>
                  setFilters({
                    ...filters,

                    startDate:
                      event.target.value,
                  })
              }
            />

          </div>


          <div className="filter-group">

            <label>
              To Date
            </label>

            <input
              type="date"

              value={
                filters.endDate
              }

              onChange={
                (event) =>
                  setFilters({
                    ...filters,

                    endDate:
                      event.target.value,
                  })
              }
            />

          </div>


          <button
            className="primary-btn"

            onClick={
              applyFilters
            }
          >
            Apply Filter
          </button>


          <button
            className="secondary-btn"

            onClick={
              clearFilters
            }
          >
            Clear
          </button>


        </div>

      </div>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {
        error && (

          <div className="error-message">
            {error}
          </div>

        )
      }


      {/* =====================================================
          TABLE
          ===================================================== */}

      <div className="card history-table">


        <table>

          <thead>

            <tr>

              <th>
                Batch Number
              </th>

              <th>
                Initial Weight
              </th>

              <th>
                Final Weight
              </th>

              <th>
                Yield %
              </th>

              <th>
                Duration (hrs)
              </th>

              <th>
                Target Temp (°C)
              </th>

              <th>
                Started At
              </th>

              <th>
                Completed At
              </th>

            </tr>

          </thead>


          <tbody>

            {
              filteredRecords.map(
                (run) => {

                  const yieldPercentage =
                    calculateYield(
                      run.initialWeight,
                      run.finalWeight
                    );


                  return (

                    <tr
                      key={
                        run.id
                      }
                    >

                      <td>
                        {
                          run.batchNumber ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          formatNumber(
                            run.initialWeight
                          )
                        }
                      </td>


                      <td>
                        {
                          formatNumber(
                            run.finalWeight
                          )
                        }
                      </td>


                      <td>

                        {
                          yieldPercentage !==
                          null ? (

                            <span
                              className={
                                `yield-badge ${getYieldClass(
                                  yieldPercentage
                                )}`
                              }
                            >
                              {
                                yieldPercentage.toFixed(
                                  2
                                )
                              }
                              %
                            </span>

                          ) : (

                            "-"
                          )
                        }

                      </td>


                      <td>
                        {
                          formatNumber(
                            run.durationHours
                          )
                        }
                      </td>


                      <td>
                        {
                          formatNumber(
                            run.targetTemp
                          )
                        }
                      </td>


                      <td>
                        {
                          formatDateTime(
                            run.actualStartTime
                          )
                        }
                      </td>


                      <td>
                        {
                          formatDateTime(
                            run.actualEndTime
                          )
                        }
                      </td>


                    </tr>

                  );

                }
              )
            }

          </tbody>

        </table>


        {/* =================================================
            LOADING
            ================================================= */}

        {
          loading && (

            <div className="empty-state">
              Loading drying history...
            </div>

          )
        }


        {/* =================================================
            EMPTY STATE
            ================================================= */}

        {
          !loading &&
          !error &&
          filteredRecords.length === 0 && (

            <div className="empty-state">

              No completed drying runs found.

            </div>

          )
        }


      </div>


    </div>

  );

}

