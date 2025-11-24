import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useMemo } from "react";
import {
  getPOApprovalList,
  approvePO,
  rejectPO,
  bulkApprovePOs,
  bulkRejectPOs,
} from "../mocks/server";
import AdvancedDatePicker from "./AdvancedDatePicker";
import PODetailModal from "./child/PODetailModal";
import OperationControl from "./OperationControl";

const POApprovalListLayer = () => {
  const [poData, setPoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPOs, setSelectedPOs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [dateRangeFilter, setDateRangeFilter] = useState({
    start: "",
    end: "",
  });
  const [datePickerResetKey, setDatePickerResetKey] = useState(0);
  const [sortBy, setSortBy] = useState("poDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectCategory, setRejectCategory] = useState("Budget Exceeded");

  useEffect(() => {
    const fetchPOData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPOApprovalList();
        setPoData(response.data);
      } catch (err) {
        setError("Failed to fetch PO data. Please try again later.");
        console.error("Error fetching PO data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPOData();
  }, []);

  // Filter and sort PO data
  const filteredAndSortedPOs = useMemo(() => {
    let filtered = poData.filter((po) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        po.poNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "All" || po.status === statusFilter;

      // Priority filter
      const matchesPriority =
        priorityFilter === "All" || po.priority === priorityFilter;

      // Department filter
      const matchesDepartment =
        departmentFilter === "All" || po.department === departmentFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRangeFilter.start) {
        matchesDateRange =
          matchesDateRange &&
          new Date(po.poDate) >= new Date(dateRangeFilter.start);
      }
      if (dateRangeFilter.end) {
        matchesDateRange =
          matchesDateRange &&
          new Date(po.poDate) <= new Date(dateRangeFilter.end);
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesDepartment &&
        matchesDateRange
      );
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle nested properties
      if (sortBy === "supplier") {
        aValue = a.supplier.name;
        bValue = b.supplier.name;
      } else if (sortBy === "createdBy") {
        aValue = a.createdBy.name;
        bValue = b.createdBy.name;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    poData,
    searchTerm,
    statusFilter,
    priorityFilter,
    departmentFilter,
    dateRangeFilter,
    sortBy,
    sortOrder,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPOs.length / itemsPerPage);
  const paginatedPOs = filteredAndSortedPOs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleSelectPO = (poId) => {
    setSelectedPOs((prev) =>
      prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId]
    );
  };

  const handleSelectAllPOs = () => {
    if (selectedPOs.length === paginatedPOs.length) {
      setSelectedPOs([]);
    } else {
      setSelectedPOs(paginatedPOs.map((po) => po.id));
    }
  };

  const handleViewPO = (po) => {
    setSelectedPO(po);
    setShowDetailModal(true);
  };

  const handleApprovePO = async (po) => {
    try {
      setActionLoading(true);
      const response = await approvePO(po.id, {
        userId: 201, // Current user ID (Finance Manager)
        userName: "Sarah Johnson",
        comments: "Approved by finance manager",
      });

      if (response.success) {
        // Update local state
        setPoData((prev) =>
          prev.map((p) => (p.id === po.id ? response.data : p))
        );
        setShowApproveModal(false);
        setShowDetailModal(false);
        // Show success message
        alert("PO approved successfully!");
      }
    } catch (err) {
      console.error("Error approving PO:", err);
      alert("Failed to approve PO. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPO = async (po) => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      setActionLoading(true);
      const response = await rejectPO(po.id, {
        userId: 201,
        userName: "Sarah Johnson",
        reason: rejectReason,
        category: rejectCategory,
      });

      if (response.success) {
        setPoData((prev) =>
          prev.map((p) => (p.id === po.id ? response.data : p))
        );
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectReason("");
        alert("PO rejected successfully!");
      }
    } catch (err) {
      console.error("Error rejecting PO:", err);
      alert("Failed to reject PO. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedPOs.length === 0) return;

    try {
      setActionLoading(true);
      const response = await bulkApprovePOs({
        poIds: selectedPOs,
        userId: 201,
        userName: "Sarah Johnson",
      });

      if (response.success) {
        // Update local state
        response.data.forEach((updatedPO) => {
          setPoData((prev) =>
            prev.map((p) => (p.id === updatedPO.id ? updatedPO : p))
          );
        });
        setSelectedPOs([]);
        setShowBulkActions(false);
        alert(`${response.data.length} POs approved successfully!`);
      }
    } catch (err) {
      console.error("Error bulk approving POs:", err);
      alert("Failed to approve POs. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedPOs.length === 0) return;
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      setActionLoading(true);
      const response = await bulkRejectPOs({
        poIds: selectedPOs,
        userId: 201,
        userName: "Sarah Johnson",
        reason: rejectReason,
        category: rejectCategory,
      });

      if (response.success) {
        response.data.forEach((updatedPO) => {
          setPoData((prev) =>
            prev.map((p) => (p.id === updatedPO.id ? updatedPO : p))
          );
        });
        setSelectedPOs([]);
        setShowBulkActions(false);
        setShowBulkRejectModal(false);
        setRejectReason("");
        alert(`${response.data.length} POs rejected successfully!`);
      }
    } catch (err) {
      console.error("Error bulk rejecting POs:", err);
      alert("Failed to reject POs. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-success-focus text-success-main";
      case "Rejected":
        return "bg-danger-focus text-danger-main";
      case "Draft":
        return "bg-warning-focus text-warning-main";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "High":
        return "bg-danger-focus text-danger-main";
      case "Medium":
        return "bg-warning-focus text-warning-main";
      case "Low":
        return "bg-info-focus text-info-main";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  useEffect(() => {
    setShowBulkActions(selectedPOs.length > 0);
  }, [selectedPOs]);

  return (
    <div className="card">
      {/* Header with filters */}
      <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <div className="icon-field">
            <input
              type="text"
              className="form-control form-control-sm w-auto"
              placeholder="Search PO No, Supplier, or Created By..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="icon">
              <Icon icon="ion:search-outline" />
            </span>
          </div>

          <select
            className="form-select form-select-sm w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="form-select form-select-sm w-auto"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            className="form-select form-select-sm w-auto"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="IT">IT</option>
            <option value="Operations">Operations</option>
            <option value="Facilities">Facilities</option>
            <option value="Production">Production</option>
          </select>

          <div className="d-flex align-items-center gap-2">
            <AdvancedDatePicker
              value={dateRangeFilter.start}
              onChange={(date) =>
                setDateRangeFilter((prev) => ({ ...prev, start: date }))
              }
              placeholder="From date"
              label=""
              className="min-w-140-px"
              key={`start-${datePickerResetKey}`}
            />
            <span>to</span>
            <AdvancedDatePicker
              value={dateRangeFilter.end}
              onChange={(date) =>
                setDateRangeFilter((prev) => ({ ...prev, end: date }))
              }
              placeholder="To date"
              label=""
              className="min-w-140-px"
              key={`end-${datePickerResetKey}`}
            />
          </div>

          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All");
              setPriorityFilter("All");
              setDepartmentFilter("All");
              setDateRangeFilter({ start: "", end: "" });
              setDatePickerResetKey((prev) => prev + 1); // Force date pickers to re-mount
            }}
          >
            Clear Filters
          </button>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-3">
          {/* Export button removed as requested */}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-0">
          <div className="d-flex align-items-center gap-2">
            <Icon icon="mdi:information" />
            <span>
              {selectedPOs.length} PO{selectedPOs.length > 1 ? "s" : ""}{" "}
              selected
            </span>
          </div>
          <div className="d-flex gap-2">
            <OperationControl pageId="po-approval" operation="update">
              <button
                className="btn btn-sm btn-success"
                onClick={handleBulkApprove}
                disabled={actionLoading}
              >
                <Icon icon="mdi:check" className="me-1" />
                Approve Selected
              </button>
            </OperationControl>
            <OperationControl pageId="po-approval" operation="update">
              <button
                className="btn btn-sm btn-danger"
                onClick={() => setShowBulkRejectModal(true)}
                disabled={actionLoading}
              >
                <Icon icon="mdi:close" className="me-1" />
                Reject Selected
              </button>
            </OperationControl>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setSelectedPOs([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card-body">
        <div className="table-responsive">
          <table className="table bordered-table mb-0">
            <thead>
              <tr>
                <th scope="col">
                  <div className="form-check style-check d-flex align-items-center">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={
                        selectedPOs.length === paginatedPOs.length &&
                        paginatedPOs.length > 0
                      }
                      onChange={handleSelectAllPOs}
                    />
                    <label className="form-check-label">S.L</label>
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer"
                  onClick={() => handleSort("poNo")}
                >
                  <div className="d-flex align-items-center gap-1">
                    PO No
                    {sortBy === "poNo" && (
                      <Icon
                        icon={`mdi:arrow-${
                          sortOrder === "asc" ? "up" : "down"
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
                    {sortBy === "supplier" && (
                      <Icon
                        icon={`mdi:arrow-${
                          sortOrder === "asc" ? "up" : "down"
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer"
                  onClick={() => handleSort("createdBy")}
                >
                  <div className="d-flex align-items-center gap-1">
                    Created By
                    {sortBy === "createdBy" && (
                      <Icon
                        icon={`mdi:arrow-${
                          sortOrder === "asc" ? "up" : "down"
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer"
                  onClick={() => handleSort("poDate")}
                >
                  <div className="d-flex align-items-center gap-1">
                    Date
                    {sortBy === "poDate" && (
                      <Icon
                        icon={`mdi:arrow-${
                          sortOrder === "asc" ? "up" : "down"
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
                    {sortBy === "totalValue" && (
                      <Icon
                        icon={`mdi:arrow-${
                          sortOrder === "asc" ? "up" : "down"
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th scope="col">Priority</th>
                <th scope="col" style={{ width: "120px", minWidth: "120px" }}>
                  Status
                </th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="d-flex align-items-center justify-content-center">
                      <div
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      Loading PO data...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-danger">
                    {error}
                  </td>
                </tr>
              ) : paginatedPOs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="text-center">
                      <Icon
                        icon="mdi:file-document-outline"
                        className="text-4xl text-muted mb-2"
                      />
                      <p className="text-muted mb-2">
                        No POs found matching your filters
                      </p>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("All");
                          setPriorityFilter("All");
                          setDepartmentFilter("All");
                          setDateRangeFilter({ start: "", end: "" });
                          setDatePickerResetKey((prev) => prev + 1); // Force date pickers to re-mount
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPOs.map((po) => (
                  <tr
                    key={po.id}
                    className={
                      selectedPOs.includes(po.id) ? "table-active" : ""
                    }
                  >
                    <td>
                      <div className="form-check style-check d-flex align-items-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedPOs.includes(po.id)}
                          onChange={() => handleSelectPO(po.id)}
                          disabled={po.status !== "Draft"}
                        />
                        <label className="form-check-label">{po.sl}</label>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-link text-primary-600 p-0 text-decoration-none"
                        onClick={() => handleViewPO(po)}
                      >
                        {po.poNo}
                      </button>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1">
                          <div className="fw-medium">{po.supplier.name}</div>
                          <small className="text-muted">
                            {po.supplier.code}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="w-32-px h-32-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center">
                          <span className="text-primary-600 fw-semibold">
                            {po.createdBy.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="fw-medium">{po.createdBy.name}</div>
                          <small className="text-muted">
                            {po.createdBy.role}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div title={getRelativeTime(po.poDate)}>
                        {formatDate(po.poDate)}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className={`fw-semibold ${
                            po.totalValue > 5000
                              ? "text-danger"
                              : "text-success"
                          }`}
                        >
                          ${po.totalValue.toFixed(2)}
                        </span>
                        {po.totalValue > 5000 && (
                          <Icon
                            icon="mdi:alert-circle"
                            className="text-danger"
                          />
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`px-12 py-4 rounded-pill fw-medium text-xs ${getPriorityBadgeClass(
                          po.priority
                        )}`}
                      >
                        {po.priority}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`px-16 py-4 rounded-pill fw-bold text-xs d-inline-flex align-items-center gap-1 justify-content-center w-100-px status-pill ${getStatusBadgeClass(
                          po.status
                        )}`}
                      >
                        <Icon
                          icon={
                            po.status === "Approved"
                              ? "mdi:check-circle"
                              : po.status === "Rejected"
                              ? "mdi:close-circle"
                              : "mdi:clock-outline"
                          }
                          className="me-1 text-xl status-icon"
                        />
                        <span className="status-text">{po.status}</span>
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="w-32-px h-32-px bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                          onClick={() => handleViewPO(po)}
                          title="View Details"
                        >
                          <Icon icon="iconamoon:eye-light" />
                        </button>
                        {po.status === "Draft" && (
                          <>
                            <OperationControl
                              pageId="po-approval"
                              operation="update"
                            >
                              <button
                                className="w-32-px h-32-px bg-success-light text-success-600 rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                                onClick={() => {
                                  setSelectedPO(po);
                                  setShowApproveModal(true);
                                }}
                                title="Approve"
                              >
                                <Icon icon="mdi:check" />
                              </button>
                            </OperationControl>
                            <OperationControl
                              pageId="po-approval"
                              operation="update"
                            >
                              <button
                                className="w-32-px h-32-px bg-danger-light text-danger-600 rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                                onClick={() => {
                                  setSelectedPO(po);
                                  setShowRejectModal(true);
                                }}
                                title="Reject"
                              >
                                <Icon icon="mdi:close" />
                              </button>
                            </OperationControl>
                          </>
                        )}
                        {po.status !== "Draft" && (
                          <button
                            className="w-32-px h-32-px bg-neutral-100 text-neutral-400 rounded-circle d-inline-flex align-items-center justify-content-center border-0"
                            title="Cannot modify - PO already processed"
                            disabled
                          >
                            <Icon icon="mdi:lock" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-24">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedPOs.length)}{" "}
            of {filteredAndSortedPOs.length} entries
          </span>
          <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
            <li className="page-item">
              <button
                className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px bg-base"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <Icon icon="ep:d-arrow-left" className="text-xl" />
              </button>
            </li>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <li key={pageNum} className="page-item">
                  <button
                    className={`page-link fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px ${
                      currentPage === pageNum
                        ? "bg-primary-600 text-white"
                        : "bg-primary-50 text-secondary-light"
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                </li>
              );
            })}
            <li className="page-item">
              <button
                className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px bg-base"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                <Icon icon="ep:d-arrow-right" className="text-xl" />
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedPO && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Approval</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApproveModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to approve{" "}
                  <strong>{selectedPO.poNo}</strong> from{" "}
                  <strong>{selectedPO.supplier.name}</strong>?
                </p>
                <p>
                  <strong>Total Value:</strong> $
                  {selectedPO.totalValue.toFixed(2)}
                </p>
                <p>
                  This action will update the PO status to "Approved" and notify
                  the supplier.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowApproveModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleApprovePO(selectedPO)}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Approving..." : "Approve PO"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedPO && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Rejection</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRejectModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to reject{" "}
                  <strong>{selectedPO.poNo}</strong> from{" "}
                  <strong>{selectedPO.supplier.name}</strong>?
                </p>
                <p>
                  <strong>Total Value:</strong> $
                  {selectedPO.totalValue.toFixed(2)}
                </p>

                <div className="mb-3">
                  <label className="form-label">Rejection Category</label>
                  <select
                    className="form-select"
                    value={rejectCategory}
                    onChange={(e) => setRejectCategory(e.target.value)}
                  >
                    <option value="Budget Exceeded">Budget Exceeded</option>
                    <option value="Incorrect Items">Incorrect Items</option>
                    <option value="Pricing Issues">Pricing Issues</option>
                    <option value="Supplier Issues">Supplier Issues</option>
                    <option value="Documentation Missing">
                      Documentation Missing
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Rejection Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejection..."
                    minLength="10"
                    maxLength="500"
                    required
                  />
                  <small className="text-muted">
                    {rejectReason.length}/500 characters
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRejectPO(selectedPO)}
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  {actionLoading ? "Rejecting..." : "Reject PO"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {showBulkRejectModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Bulk Rejection</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowBulkRejectModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to reject{" "}
                  <strong>{selectedPOs.length}</strong> selected POs?
                </p>

                <div className="mb-3">
                  <label className="form-label">Rejection Category</label>
                  <select
                    className="form-select"
                    value={rejectCategory}
                    onChange={(e) => setRejectCategory(e.target.value)}
                  >
                    <option value="Budget Exceeded">Budget Exceeded</option>
                    <option value="Incorrect Items">Incorrect Items</option>
                    <option value="Pricing Issues">Pricing Issues</option>
                    <option value="Supplier Issues">Supplier Issues</option>
                    <option value="Documentation Missing">
                      Documentation Missing
                    </option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Rejection Reason <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejection..."
                    minLength="10"
                    maxLength="500"
                    required
                  />
                  <small className="text-muted">
                    {rejectReason.length}/500 characters
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowBulkRejectModal(false);
                    setRejectReason("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleBulkReject()}
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  {actionLoading ? "Rejecting..." : "Reject POs"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PO Detail Modal */}
      {showDetailModal && selectedPO && (
        <PODetailModal
          show={showDetailModal}
          handleClose={() => setShowDetailModal(false)}
          po={selectedPO}
          onApprove={() => {
            setShowDetailModal(false);
            setShowApproveModal(true);
          }}
          onReject={() => {
            setShowDetailModal(false);
            setShowRejectModal(true);
          }}
        />
      )}
    </div>
  );
};

export default POApprovalListLayer;
