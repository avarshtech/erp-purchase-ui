import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { getPurchaseOrders, deletePurchaseOrder } from "../services/purchaseOrders";
import AdvancedDatePicker from "./AdvancedDatePicker";
import POModalLayer from "./POModalLayer";
import POPreviewDialog from "./child/POPreviewDialog";
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
    const normalize = (s) => (s ? s.toString().replace(/\s+/g, "") : "");
    switch (normalize(status)) {
      case "Completed":
        return "mdi:check-circle";
      case "InProgress":
        return "mdi:clock-outline";
      case "Draft":
        return "mdi:file-document-outline";
      case "AwaitApproval":
        return "mdi:clock-check-outline";
      case "Rejected":
        return "mdi:close-circle";
      default:
        return "mdi:help-circle";
    }
  };

  // Use grandTotal from API response
  const totalValue = po.grandTotal || 0;

  // Format date from API (YYYY-MM-DD format)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <tr>
      <td className="text-start">
        <button
          className="btn btn-link text-primary-600 p-0 text-decoration-none fw-medium"
          onClick={() => onView(po)}
        >
          {po.poNumber}
        </button>
      </td>
      <td className="text-start">
        <div className="d-flex align-items-center gap-2">
          <div className="w-24-px h-24-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center flex-shrink-0">
            <span className="text-primary-600 fw-semibold text-xs">
              {po.supplierName ? po.supplierName.charAt(0) : "?"}
            </span>
          </div>
          <div className="fw-medium text-truncate">{po.supplierName}</div>
        </div>
      </td>
      <td className="text-center fw-medium">{formatDate(po.poDate)}</td>
      <td className="text-center fw-medium">{formatDate(po.deliveryDate)}</td>
      <td className="text-end">
        <span className="fw-semibold text-success">
          ₹{totalValue.toFixed(2)}
        </span>
      </td>
      <td className="text-center">
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
      </td>
      <td className="text-center">
        <div className="d-flex align-items-center justify-content-center gap-2">
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
    // Debounce ref for search
    const searchTimeoutRef = useRef();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [poDateRangeFilter, setPoDateRangeFilter] = useState({
    start: "",
    end: "",
  });
  const [deliveryDateRangeFilter, setDeliveryDateRangeFilter] = useState({
    start: "",
    end: "",
  });
  const [datePickerResetKey, setDatePickerResetKey] = useState(0);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  
  // Date filter popover state
  const [showPoDateFilter, setShowPoDateFilter] = useState(false);
  const [showDeliveryDateFilter, setShowDeliveryDateFilter] = useState(false);
  
  // Pagination state - server-side
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for API
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal state
  const [showPOModal, setShowPOModal] = useState(false);
  const [editingPO, setEditingPO] = useState(null);

  // Delete confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [poToDelete, setPoToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // View Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingPO, setViewingPO] = useState(null);

  const fetchPOData = useCallback(async () => {
    try {
      setLoading(true);
      // Build query params for server-side pagination and filters
      const params = {
        page: currentPage,
        size: itemsPerPage,
        sort: sortField,
        direction: sortDirection,
        search: searchTerm, // free text for PO Number & Supplier
        status: statusFilter !== "All" ? statusFilter : undefined,
        poDateStart: poDateRangeFilter.start || undefined,
        poDateEnd: poDateRangeFilter.end || undefined,
        deliveryDateStart: deliveryDateRangeFilter.start || undefined,
        deliveryDateEnd: deliveryDateRangeFilter.end || undefined,
      };
      const response = await getPurchaseOrders(params);
      // Ensure activities is always an array in local state
      const items = (response.content || []).map((po) => ({
        ...po,
        activities: po.activities || [],
      }));
      setPurchaseOrders(items);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err) {
      console.error("Error fetching PO data:", err);
      setPurchaseOrders([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortField, sortDirection, searchTerm, statusFilter, poDateRangeFilter, deliveryDateRangeFilter]);

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
    // Reset to first page when sorting changes
    setCurrentPage(0);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(0);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchPOData();
    }, 400); // 400ms debounce
  };

  // Use purchaseOrders directly for rendering

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

  const handleConfirmDelete = async () => {
    if (poToDelete) {
      try {
        setDeleteLoading(true);
        await deletePurchaseOrder(poToDelete.id);
        setShowDeleteDialog(false);
        setPoToDelete(null);
        // Refresh the list after delete
        fetchPOData();
      } catch (error) {
        console.error("Error deleting purchase order:", error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleViewPO = (po) => {
    setViewingPO(po);
    setShowViewModal(true);
  };

  const clearAllFilters = () => {
    setStatusFilter("All");
    setSearchTerm("");
    setPoDateRangeFilter({ start: "", end: "" });
    setDeliveryDateRangeFilter({ start: "", end: "" });
    setDatePickerResetKey((prev) => prev + 1);
    setCurrentPage(0);
  };

  const hasActiveFilters =
    statusFilter !== "All" ||
    searchTerm !== "" ||
    (poDateRangeFilter.start && poDateRangeFilter.end) ||
    (deliveryDateRangeFilter.start && deliveryDateRangeFilter.end);

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(0); // Reset to first page when page size changes
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);
      
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);
      
      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
      }
      
      if (start > 1) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages - 1);
    }
    
    return pages;
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <form className="navbar-search">
            <input
              type="text"
              className="bg-base h-40-px w-auto"
              name="search"
              placeholder="Search PO Number, Supplier..."
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
                    setCurrentPage(0);
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
                    setCurrentPage(0);
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
                    setCurrentPage(0);
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
                    setCurrentPage(0);
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
                    setCurrentPage(0);
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
                    setCurrentPage(0);
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

          {/* PO Date Range Filter */}
          <div className="position-relative">
            <button
              className={`btn btn-outline-secondary d-flex align-items-center gap-2 h-40-px ${
                poDateRangeFilter.start && poDateRangeFilter.end ? "border-primary text-primary" : ""
              }`}
              type="button"
              onClick={() => {
                setShowPoDateFilter(!showPoDateFilter);
                setShowDeliveryDateFilter(false);
              }}
            >
              <Icon icon="mdi:calendar-range" className="icon text-xl" />
              <span>
                {poDateRangeFilter.start && poDateRangeFilter.end
                  ? `PO: ${poDateRangeFilter.start} - ${poDateRangeFilter.end}`
                  : "PO Date"}
              </span>
              <Icon icon="mdi:chevron-down" className="text-sm" />
            </button>
            {showPoDateFilter && (
              <>
                <div 
                  className="position-fixed top-0 start-0 w-100 h-100" 
                  style={{ zIndex: 1040 }}
                  onClick={() => setShowPoDateFilter(false)}
                ></div>
                <div 
                  className="position-absolute border rounded-3 shadow-lg p-3 mt-1 date-filter-popover"
                  style={{ zIndex: 1050, minWidth: "340px", left: 0 }}
                >
                  <div className="mb-3">
                    <label className="form-label small fw-semibold mb-2">PO Date Range</label>
                  </div>
                  <div className="row g-3">
                    <div className="col-12" style={{ position: 'relative', zIndex: 2 }}>
                      <label className="form-label small mb-1">From Date</label>
                      <AdvancedDatePicker
                        value={poDateRangeFilter.start}
                        onChange={(date) => {
                          setPoDateRangeFilter((prev) => ({ ...prev, start: date }));
                          setCurrentPage(0);
                        }}
                        placeholder="Select start date"
                        label=""
                        key={`po-start-${datePickerResetKey}`}
                      />
                    </div>
                    <div className="col-12" style={{ position: 'relative', zIndex: 1 }}>
                      <label className="form-label small mb-1">To Date</label>
                      <AdvancedDatePicker
                        value={poDateRangeFilter.end}
                        onChange={(date) => {
                          setPoDateRangeFilter((prev) => ({ ...prev, end: date }));
                          setCurrentPage(0);
                        }}
                        placeholder="Select end date"
                        label=""
                        key={`po-end-${datePickerResetKey}`}
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    {poDateRangeFilter.start || poDateRangeFilter.end ? (
                      <button
                        className="btn btn-sm btn-outline-secondary flex-grow-1"
                        onClick={() => {
                          setPoDateRangeFilter({ start: "", end: "" });
                          setDatePickerResetKey((prev) => prev + 1);
                          setCurrentPage(0);
                        }}
                      >
                        Clear
                      </button>
                    ) : null}
                    <button
                      className="btn btn-sm btn-primary-600 flex-grow-1"
                      onClick={() => setShowPoDateFilter(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Delivery Date Range Filter */}
          <div className="position-relative">
            <button
              className={`btn btn-outline-secondary d-flex align-items-center gap-2 h-40-px ${
                deliveryDateRangeFilter.start && deliveryDateRangeFilter.end ? "border-primary text-primary" : ""
              }`}
              type="button"
              onClick={() => {
                setShowDeliveryDateFilter(!showDeliveryDateFilter);
                setShowPoDateFilter(false);
              }}
            >
              <Icon icon="mdi:truck-delivery-outline" className="icon text-xl" />
              <span>
                {deliveryDateRangeFilter.start && deliveryDateRangeFilter.end
                  ? `Delivery: ${deliveryDateRangeFilter.start} - ${deliveryDateRangeFilter.end}`
                  : "Delivery Date"}
              </span>
              <Icon icon="mdi:chevron-down" className="text-sm" />
            </button>
            {showDeliveryDateFilter && (
              <>
                <div 
                  className="position-fixed top-0 start-0 w-100 h-100" 
                  style={{ zIndex: 1040 }}
                  onClick={() => setShowDeliveryDateFilter(false)}
                ></div>
                <div 
                  className="position-absolute border rounded-3 shadow-lg p-3 mt-1 date-filter-popover"
                  style={{ zIndex: 1050, minWidth: "340px", left: 0 }}
                >
                  <div className="mb-3">
                    <label className="form-label small fw-semibold mb-2">Delivery Date Range</label>
                  </div>
                  <div className="row g-3">
                    <div className="col-12" style={{ position: 'relative', zIndex: 2 }}>
                      <label className="form-label small mb-1">From Date</label>
                      <AdvancedDatePicker
                        value={deliveryDateRangeFilter.start}
                        onChange={(date) => {
                          setDeliveryDateRangeFilter((prev) => ({ ...prev, start: date }));
                          setCurrentPage(0);
                        }}
                        placeholder="Select start date"
                        label=""
                        key={`delivery-start-${datePickerResetKey}`}
                      />
                    </div>
                    <div className="col-12" style={{ position: 'relative', zIndex: 1 }}>
                      <label className="form-label small mb-1">To Date</label>
                      <AdvancedDatePicker
                        value={deliveryDateRangeFilter.end}
                        onChange={(date) => {
                          setDeliveryDateRangeFilter((prev) => ({ ...prev, end: date }));
                          setCurrentPage(0);
                        }}
                        placeholder="Select end date"
                        label=""
                        key={`delivery-end-${datePickerResetKey}`}
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    {deliveryDateRangeFilter.start || deliveryDateRangeFilter.end ? (
                      <button
                        className="btn btn-sm btn-outline-secondary flex-grow-1"
                        onClick={() => {
                          setDeliveryDateRangeFilter({ start: "", end: "" });
                          setDatePickerResetKey((prev) => prev + 1);
                          setCurrentPage(0);
                        }}
                      >
                        Clear
                      </button>
                    ) : null}
                    <button
                      className="btn btn-sm btn-primary-600 flex-grow-1"
                      onClick={() => setShowDeliveryDateFilter(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </>
            )}
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
        ) : purchaseOrders.length === 0 ? (
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
                        setCurrentPage(0);
                      }}
                    ></button>
                  </span>
                )}
                {searchTerm && (
                  <span className="badge active-filter-badge d-flex align-items-center gap-1">
                    Search: {searchTerm}
                    <button
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(0);
                      }}
                    ></button>
                  </span>
                )}
                {poDateRangeFilter.start && poDateRangeFilter.end && (
                  <span className="badge active-filter-badge d-flex align-items-center gap-1">
                    PO Date: {poDateRangeFilter.start} to {poDateRangeFilter.end}
                    <button
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => {
                        setPoDateRangeFilter({ start: "", end: "" });
                        setDatePickerResetKey((prev) => prev + 1);
                        setCurrentPage(0);
                      }}
                    ></button>
                  </span>
                )}
                {deliveryDateRangeFilter.start && deliveryDateRangeFilter.end && (
                  <span className="badge active-filter-badge d-flex align-items-center gap-1">
                    Delivery Date: {deliveryDateRangeFilter.start} to {deliveryDateRangeFilter.end}
                    <button
                      className="btn-close btn-close-sm ms-1"
                      onClick={() => {
                        setDeliveryDateRangeFilter({ start: "", end: "" });
                        setDatePickerResetKey((prev) => prev + 1);
                        setCurrentPage(0);
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
                      className="cursor-pointer text-start"
                      onClick={() => handleSort("poNumber")}
                      style={{ minWidth: "120px" }}
                    >
                      <div className="d-flex align-items-center gap-1">
                        PO Number
                        {sortField === "poNumber" && (
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
                      className="cursor-pointer text-start"
                      onClick={() => handleSort("supplierName")}
                      style={{ minWidth: "180px" }}
                    >
                      <div className="d-flex align-items-center gap-1">
                        Supplier
                        {sortField === "supplierName" && (
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
                      className="cursor-pointer text-center"
                      onClick={() => handleSort("poDate")}
                      style={{ minWidth: "120px" }}
                    >
                      <div className="d-flex align-items-center gap-1 justify-content-center">
                        PO Date
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
                      className="cursor-pointer text-center"
                      onClick={() => handleSort("deliveryDate")}
                      style={{ minWidth: "130px" }}
                    >
                      <div className="d-flex align-items-center gap-1 justify-content-center">
                        Delivery Date
                        {sortField === "deliveryDate" && (
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
                      className="cursor-pointer text-end"
                      onClick={() => handleSort("grandTotal")}
                      style={{ minWidth: "130px" }}
                    >
                      <div className="d-flex align-items-center gap-1 justify-content-end">
                        Total Value
                        {sortField === "grandTotal" && (
                          <Icon
                            icon={`mdi:arrow-${
                              sortDirection === "asc" ? "up" : "down"
                            }`}
                          />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="text-center" style={{ minWidth: "140px" }}>Status</th>
                    <th scope="col" className="text-center" style={{ minWidth: "130px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
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
              <div className="d-flex align-items-center gap-2">
                <span>
                  Showing {totalElements > 0 ? currentPage * itemsPerPage + 1 : 0} to{" "}
                  {Math.min(
                    (currentPage + 1) * itemsPerPage,
                    totalElements
                  )}{" "}
                  of {totalElements} entries
                </span>
                <select
                  className="form-select form-select-sm w-auto"
                  value={itemsPerPage}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
              <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                <li className="page-item">
                  <button
                    className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px bg-base"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <Icon icon="ep:d-arrow-left" className="text-xl" />
                  </button>
                </li>
                {getPageNumbers().map((page, index) => (
                  <li key={index} className="page-item">
                    {page === '...' ? (
                      <span className="page-link fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px bg-base text-secondary-light">
                        ...
                      </span>
                    ) : (
                      <button
                        className={`page-link fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px ${
                          currentPage === page
                            ? "bg-primary-600 text-white"
                            : "bg-primary-50 text-secondary-light"
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page + 1}
                      </button>
                    )}
                  </li>
                ))}
                <li className="page-item">
                  <button
                    className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px bg-base"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
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
        <POPreviewDialog
          show={showViewModal}
          onClose={() => setShowViewModal(false)}
          viewMode={true}
          poData={viewingPO}
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
                  <strong>{poToDelete?.poNumber}</strong>?
                </p>
                <p className="text-danger">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
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
