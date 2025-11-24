import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getPOList } from "../mocks/server";
import AdvancedDatePicker from "./AdvancedDatePicker";
import POModalLayer from "./POModalLayer";
import POViewLayer from "./POViewLayer";
import OperationControl from "./OperationControl";
import "../assets/css/purchase-order.css";

const TableRow = ({ po, onEdit, onDelete, onView }) => {
  const isEditable = po.status === "Draft" || po.status === "Rejected";
  const isDeletable = po.status === "Draft" || po.status === "Rejected";
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-success-focus text-success-main";
      case "InProgress":
        return "bg-warning-focus text-warning-main";
      case "Draft":
        return "bg-info-focus text-info-600";
      case "Await Approval":
        return "bg-neutral-200 text-cyan-600";
      case "Rejected":
        return "bg-danger-focus text-danger-main";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return "mdi:check-circle";
      case "InProgress":
        return "mdi:clock-outline";
      case "Draft":
        return "mdi:file-document-outline";
      case "Await Approval":
        return "mdi:clock-check-outline";
      case "Rejected":
        return "mdi:close-circle";
      default:
        return "mdi:help-circle";
    }
  };

  // Parse totalValue as number
  const totalValue =
    typeof po.totalValue === "string"
      ? parseFloat(po.totalValue)
      : po.totalValue;

  return (
    <tr>
      <td>
        <button
          className="btn btn-link text-primary-600 p-0 text-decoration-none fw-medium"
          onClick={() => onView(po)}
        >
          {po.poNo}
        </button>
      </td>
      <td>
        <div className="d-flex align-items-center gap-2">
          <div className="w-24-px h-24-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center">
            <span className="text-primary-600 fw-semibold text-xs">
              {po.supplier.name.charAt(0)}
            </span>
          </div>
          <div className="fw-medium">{po.supplier.name}</div>
        </div>
      </td>
      <td className="po-list-cell-center fw-medium text-center">{po.poDate}</td>
      <td>
        <div className="po-list-value-cell">
          <span
            className={`fw-semibold ${
              totalValue > 5000 ? "text-danger" : "text-success"
            }`}
          >
            ${totalValue.toFixed(2)}
          </span>
          {totalValue > 5000 && (
            <Icon icon="mdi:alert-circle" className="text-danger" />
          )}
        </div>
      </td>
      <td>
        <div className="po-list-status-cell">
          <span
            className={`px-16 py-4 rounded-pill fw-bold text-xs d-inline-flex align-items-center gap-1 justify-content-center status-pill ${getStatusBadgeClass(
              po.status
            )}`}
          >
            <Icon
              icon={getStatusIcon(po.status)}
              className="text-xl status-icon"
            />
            <span className="status-text">{po.status}</span>
          </span>
        </div>
      </td>
      <td>
        <div className="po-list-actions-cell">
          <button
            className="w-32-px h-32-px bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center border-0"
            onClick={() => onView(po)}
            title="View Details"
          >
            <Icon icon="iconamoon:eye-light" />
          </button>
          <OperationControl pageId="purchase-orders" operation="update">
            <button
              className={`w-32-px h-32-px rounded-circle d-inline-flex align-items-center justify-content-center border-0 ${
                isEditable
                  ? "bg-success-light text-success-600"
                  : "bg-light text-muted"
              }`}
              onClick={() => isEditable && onEdit(po)}
              disabled={!isEditable}
              title={
                isEditable ? "Edit PO" : "Cannot edit PO with current status"
              }
            >
              <Icon icon="lucide:edit" />
            </button>
          </OperationControl>
          <OperationControl pageId="purchase-orders" operation="delete">
            <button
              className={`w-32-px h-32-px rounded-circle d-inline-flex align-items-center justify-content-center border-0 ${
                isDeletable
                  ? "bg-danger-light text-danger-600"
                  : "bg-light text-muted"
              }`}
              onClick={() => isDeletable && onDelete(po)}
              disabled={!isDeletable}
              title={
                isDeletable
                  ? "Delete PO"
                  : "Cannot delete PO with current status"
              }
            >
              <Icon icon="mingcute:delete-2-line" />
            </button>
          </OperationControl>
        </div>
      </td>
    </tr>
  );
};

const PurchaseOrderListLayer = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: "",
    end: "",
  });
  const [datePickerResetKey, setDatePickerResetKey] = useState(0);
  const [sortField, setSortField] = useState("poNo");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal state
  const [showPOModal, setShowPOModal] = useState(false);
  const [editingPO, setEditingPO] = useState(null);

  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [poToDelete, setPoToDelete] = useState(null);

  // View Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPO, setViewingPO] = useState(null);

  const fetchPOData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPOList();
      setPurchaseOrders(response.data);
    } catch (err) {
      console.error("Error fetching PO data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPOData();
  }, [fetchPOData]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getMonthIndex = (monthStr) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.indexOf(monthStr);
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = purchaseOrders.filter((po) => {
      const matchesStatus =
        statusFilter === "All" || po.status === statusFilter;
      const matchesSearch =
        po.poNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesDate = true;
      if (dateRangeFilter.start && dateRangeFilter.end) {
        const poDateParts = po.poDate.split(" ");
        const poDay = parseInt(poDateParts[0]);
        const poMonth = getMonthIndex(poDateParts[1]);
        const poYear = parseInt(poDateParts[2]);
        const poDateObj = new Date(poYear, poMonth, poDay);

        const startDate = new Date(dateRangeFilter.start);
        const endDate = new Date(dateRangeFilter.end);
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);

        matchesDate = poDateObj >= startDate && poDateObj <= endDate;
      }

      return matchesStatus && matchesSearch && matchesDate;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "totalValue") {
        aValue =
          typeof a.totalValue === "string"
            ? parseFloat(a.totalValue)
            : a.totalValue;
        bValue =
          typeof b.totalValue === "string"
            ? parseFloat(b.totalValue)
            : b.totalValue;
      } else if (sortField === "poDate") {
        const aParts = a.poDate.split(" ");
        const bParts = b.poDate.split(" ");
        aValue = new Date(
          parseInt(aParts[2]),
          getMonthIndex(aParts[1]),
          parseInt(aParts[0])
        ).getTime();
        bValue = new Date(
          parseInt(bParts[2]),
          getMonthIndex(bParts[1]),
          parseInt(bParts[0])
        ).getTime();
      } else if (sortField === "supplier") {
        aValue = a.supplier.name.toLowerCase();
        bValue = b.supplier.name.toLowerCase();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [
    purchaseOrders,
    statusFilter,
    searchTerm,
    sortField,
    sortDirection,
    dateRangeFilter,
  ]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddPO = () => {
    setEditingPO(null);
    setShowPOModal(true);
  };

  const handleEditPO = (po) => {
    setEditingPO(po);
    setShowPOModal(true);
  };

  const handleDeleteClick = (po) => {
    setPoToDelete(po);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (poToDelete) {
      setPurchaseOrders((prev) => prev.filter((po) => po.id !== poToDelete.id));
      setShowDeleteDialog(false);
      setPoToDelete(null);
    }
  };

  const handleViewPO = (po) => {
    setViewingPO(po);
    setShowViewModal(true);
  };

  const clearAllFilters = () => {
    setStatusFilter("All");
    setSearchTerm("");
    setDateRangeFilter({ start: "", end: "" });
    setDatePickerResetKey((prev) => prev + 1);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    statusFilter !== "All" ||
    searchTerm !== "" ||
    (dateRangeFilter.start && dateRangeFilter.end);

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <form className="navbar-search">
            <input
              type="text"
              className="bg-base h-40-px w-auto"
              name="search"
              placeholder="Search PO No, Supplier..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Icon icon="ion:search-outline" className="icon" />
          </form>

          {/* Status Filter */}
          <div className="dropdown">
            <button
              className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2 h-40-px"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <Icon icon="mdi:filter-variant" className="icon text-xl" />
              <span>Status: {statusFilter}</span>
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className={`dropdown-item d-flex align-items-center gap-2 ${
                    statusFilter === "All" ? "active" : ""
                  } dropdown-item-content`}
                  onClick={(e) => {
                    e.preventDefault();
                    setStatusFilter("All");
                    setCurrentPage(1);
                    // Close dropdown by removing show class
                    e.currentTarget
                      .closest(".dropdown")
                      .querySelector(".dropdown-toggle")
                      .click();
                  }}
                >
                  <Icon
                    icon="mdi:format-list-bulleted"
                    className="text-primary"
                  />
                  <span className="dropdown-item-text">All Status</span>
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item d-flex align-items-center gap-2 ${
                    statusFilter === "Draft" ? "active" : ""
                  } dropdown-item-content`}
                  onClick={(e) => {
                    e.preventDefault();
                    setStatusFilter("Draft");
                    setCurrentPage(1);
                    // Close dropdown by removing show class
                    e.currentTarget
                      .closest(".dropdown")
                      .querySelector(".dropdown-toggle")
                      .click();
                  }}
                >
                  <Icon
                    icon="mdi:file-document-outline"
                    className="text-info-600"
                  />
                  <span className="dropdown-item-text">Draft</span>
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item d-flex align-items-center gap-2 ${
                    statusFilter === "InProgress" ? "active" : ""
                  } dropdown-item-content`}
                  onClick={(e) => {
                    e.preventDefault();
                    setStatusFilter("InProgress");
                    setCurrentPage(1);
                    // Close dropdown by removing show class
                    e.currentTarget
                      .closest(".dropdown")
                      .querySelector(".dropdown-toggle")
                      .click();
                  }}
                >
                  <Icon icon="mdi:clock-outline" className="text-warning" />
                  <span className="dropdown-item-text">In Progress</span>
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item d-flex align-items-center gap-2 ${
                    statusFilter === "Completed" ? "active" : ""
                  } dropdown-item-content`}
                  onClick={(e) => {
                    e.preventDefault();
                    setStatusFilter("Completed");
                    setCurrentPage(1);
                    // Close dropdown by removing show class
                    e.currentTarget
                      .closest(".dropdown")
                      .querySelector(".dropdown-toggle")
                      .click();
                  }}
                >
                  <Icon icon="mdi:check-circle" className="text-success" />
                  <span className="dropdown-item-text">Completed</span>
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item d-flex align-items-center gap-2 ${
                    statusFilter === "Await Approval" ? "active" : ""
                  } dropdown-item-content`}
                  onClick={(e) => {
                    e.preventDefault();
                    setStatusFilter("Await Approval");
                    setCurrentPage(1);
                    // Close dropdown by removing show class
                    e.currentTarget
                      .closest(".dropdown")
                      .querySelector(".dropdown-toggle")
                      .click();
                  }}
                >
                  <Icon
                    icon="mdi:clock-check-outline"
                    className="text-cyan-600"
                  />
                  <span className="dropdown-item-text">Await Approval</span>
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item d-flex align-items-center gap-2 ${
                    statusFilter === "Rejected" ? "active" : ""
                  } dropdown-item-content`}
                  onClick={(e) => {
                    e.preventDefault();
                    setStatusFilter("Rejected");
                    setCurrentPage(1);
                    // Close dropdown by removing show class
                    e.currentTarget
                      .closest(".dropdown")
                      .querySelector(".dropdown-toggle")
                      .click();
                  }}
                >
                  <Icon icon="mdi:close-circle" className="text-danger" />
                  <span className="dropdown-item-text">Rejected</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Date Range Filter */}
          <div
            className="d-flex align-items-center gap-2"
            style={{ zIndex: "20" }}
          >
            <Icon
              icon="mdi:calendar-range"
              className="text-muted icon"
              style={{ height: "25px", width: "25px" }}
            />
            <AdvancedDatePicker
              value={dateRangeFilter.start}
              onChange={(date) => {
                setDateRangeFilter((prev) => ({ ...prev, start: date }));
                setCurrentPage(1);
              }}
              placeholder="From date"
              label=""
              className="min-w-140-px"
              key={`start-${datePickerResetKey}`}
            />
            <span className="text-muted">to</span>
            <AdvancedDatePicker
              value={dateRangeFilter.end}
              onChange={(date) => {
                setDateRangeFilter((prev) => ({ ...prev, end: date }));
                setCurrentPage(1);
              }}
              placeholder="To date"
              label=""
              className="min-w-140-px"
              key={`end-${datePickerResetKey}`}
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-2"
              onClick={clearAllFilters}
            >
              <Icon icon="mdi:filter-off" className="icon" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap align-items-center gap-3">
          <OperationControl pageId="purchase-orders" operation="add">
            <button
              type="button"
              className="btn btn-sm btn-primary-600 d-flex align-items-center gap-2"
              onClick={handleAddPO}
            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              <span>New Purchase Order</span>
            </button>
          </OperationControl>
        </div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="po-list-loading-container">
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h6 className="text-muted">Loading Purchase Orders...</h6>
            </div>
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className="po-list-no-results">
            <div className="card border">
              <div className="card-body">
                <h6 className="text-md text-secondary-light mb-16">
                  No Purchase Orders Found
                </h6>
                {hasActiveFilters && (
                  <button
                    className="btn btn-primary-600"
                    onClick={clearAllFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className="text-muted small">Active filters:</span>
                {statusFilter !== "All" && (
                  <span className="badge active-filter-badge d-flex align-items-center gap-1">
                    Status: {statusFilter}
                    <button
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => {
                        setStatusFilter("All");
                        setCurrentPage(1);
                      }}
                    ></button>
                  </span>
                )}
                {searchTerm && (
                  <span className="badge active-filter-badge d-flex align-items-center gap-1">
                    Search: {searchTerm}
                    <button
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => setSearchTerm("")}
                    ></button>
                  </span>
                )}
                {dateRangeFilter.start && dateRangeFilter.end && (
                  <span className="badge active-filter-badge d-flex align-items-center gap-1">
                    Date: {dateRangeFilter.start} to {dateRangeFilter.end}
                    <button
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => {
                        setDateRangeFilter({ start: "", end: "" });
                        setDatePickerResetKey((prev) => prev + 1);
                        setCurrentPage(1);
                      }}
                    ></button>
                  </span>
                )}
              </div>
            )}

            <div className="table-responsive">
              <table className="table bordered-table mb-0">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="cursor-pointer"
                      onClick={() => handleSort("poNo")}
                    >
                      <div className="d-flex align-items-center gap-1">
                        PO No
                        {sortField === "poNo" && (
                          <Icon
                            icon={`mdi:arrow-${
                              sortDirection === "asc" ? "up" : "down"
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="cursor-pointer"
                      onClick={() => handleSort("supplier")}
                    >
                      <div className="d-flex align-items-center gap-1">
                        Supplier
                        {sortField === "supplier" && (
                          <Icon
                            icon={`mdi:arrow-${
                              sortDirection === "asc" ? "up" : "down"
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="cursor-pointer po-list-cell-center"
                      onClick={() => handleSort("poDate")}
                    >
                      <div className="d-flex align-items-center gap-1 justify-content-center">
                        Date
                        {sortField === "poDate" && (
                          <Icon
                            icon={`mdi:arrow-${
                              sortDirection === "asc" ? "up" : "down"
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="cursor-pointer"
                      onClick={() => handleSort("totalValue")}
                    >
                      <div className="d-flex align-items-center gap-1">
                        Total Value
                        {sortField === "totalValue" && (
                          <Icon
                            icon={`mdi:arrow-${
                              sortDirection === "asc" ? "up" : "down"
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((po) => (
                    <TableRow
                      key={po.id}
                      po={po}
                      onEdit={handleEditPO}
                      onDelete={handleDeleteClick}
                      onView={handleViewPO}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-24">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(
                  currentPage * itemsPerPage,
                  filteredAndSortedOrders.length
                )}{" "}
                of {filteredAndSortedOrders.length} entries
              </span>
              <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                <li className="page-item">
                  <button
                    className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px bg-base"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <Icon icon="ep:d-arrow-left" className="text-xl" />
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <li key={page} className="page-item">
                      <button
                        className={`page-link fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px ${
                          currentPage === page
                            ? "bg-primary-600 text-white"
                            : "bg-primary-50 text-secondary-light"
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  )
                )}
                <li className="page-item">
                  <button
                    className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px bg-base"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <Icon icon="ep:d-arrow-right" className="text-xl" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {showPOModal && (
        <POModalLayer
          showModal={showPOModal}
          onClose={() => setShowPOModal(false)}
          onPOUpdated={fetchPOData}
          editingPO={editingPO}
        />
      )}

      {showViewModal && viewingPO && (
        <POViewLayer
          showModal={showViewModal}
          onClose={() => setShowViewModal(false)}
          po={viewingPO}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Purchase Order</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteDialog(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete PO{" "}
                  <strong>{poToDelete?.poNo}</strong>?
                </p>
                <p className="text-danger">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderListLayer;
