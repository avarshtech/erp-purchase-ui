import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { makeRequest } from "../mocks/server";
import POFooterSummary from "./child/POFooterSummary";

const POViewLayer = ({ showModal, onClose, po }) => {
  const [masterData, setMasterData] = useState({
    suppliers: [],
    items: [],
    termsConditions: [],
  });
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");

  useEffect(() => {
    if (po) {
      // Initialize notes from PO or empty array
      // Sort by timestamp descending if needed, but for stepper usually newest first or last depending on design
      // Here we assume array order is display order (top to bottom)
      setNotes(po.notes || []);
    }
  }, [po]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const timestamp = new Date().toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const note = {
      text: newNote,
      timestamp: timestamp,
      user: "Current User", // You might want to get this from auth context
    };

    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    setNewNote("");

    // In a real app, you would save this to the backend here
    makeRequest("POST", `/purchase-orders/${po.id}/notes`, note);
  };

  const handleEditNote = (index) => {
    setEditingNoteIndex(index);
    setEditNoteText(notes[index].text);
  };

  const handleSaveEdit = (index) => {
    if (!editNoteText.trim()) return;

    const timestamp = new Date().toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const updatedNotes = [...notes];
    updatedNotes[index] = {
      ...updatedNotes[index],
      text: editNoteText,
      timestamp: timestamp,
      edited: true,
    };

    setNotes(updatedNotes);
    setEditingNoteIndex(null);
    setEditNoteText("");

    // In a real app, you would update this on the backend here
    makeRequest(
      "PUT",
      `/purchase-orders/${po.id}/notes/${index}`,
      updatedNotes[index]
    );
  };

  const handleCancelEdit = () => {
    setEditingNoteIndex(null);
    setEditNoteText("");
  };

  useEffect(() => {
    if (showModal) {
      loadMasterData();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      const [suppliersResponse, itemsResponse, termsConditionsResponse] =
        await Promise.all([
          makeRequest("GET", "/suppliers"),
          makeRequest("GET", "/items"),
          makeRequest("GET", "/terms-conditions"),
        ]);
      setMasterData({
        suppliers: suppliersResponse.data,
        items: itemsResponse.data,
        termsConditions: termsConditionsResponse.data,
      });
    } catch (error) {
      console.error("Error loading master data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal || !po) return null;

  const supplierName =
    po.supplier?.name ||
    masterData.suppliers.find((s) => s.id === po.supplierId)?.name ||
    "N/A";
  const supplierCode =
    po.supplier?.code ||
    masterData.suppliers.find((s) => s.id === po.supplierId)?.code ||
    "";

  const terms =
    masterData.termsConditions.find((t) => t.id === po.termsConditionId) || {};

  const lineItems = po.lineItems || [];

  // Calculate totals if not present in PO object
  const subtotal =
    po.subtotal ||
    lineItems.reduce(
      (sum, item) => sum + (item.qty || 0) * (item.unitPrice || 0),
      0
    );
  const tax =
    po.tax ||
    lineItems.reduce((sum, item) => {
      const totalTaxPercent = (item.sgstPercent || 0) + (item.cgstPercent || 0);
      return (
        sum + ((item.qty || 0) * (item.unitPrice || 0) * totalTaxPercent) / 100
      );
    }, 0);
  const grandTotal = po.grandTotal || subtotal + tax;

  // Helper for date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  // Helper for status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-success-focus text-success-main";
      case "InProgress":
        return "bg-warning-focus text-warning-main";
      case "Draft":
        return "bg-info-300 text-info-600";
      case "Await Approval":
        return "bg-neutral-300 text-cyan-600";
      case "Rejected":
        return "bg-danger-300 text-danger-main";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  // Helper for status icon
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

  return (
    <div
      className={`modal fade ${showModal ? "show d-block" : ""}`}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      data-bs-backdrop="static"
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "1400px", width: "95%" }}
      >
        <div
          className="modal-content radius-16 bg-base"
          style={{
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="modal-header py-16 px-24 border border-top-0 border-start-0 border-end-0"
            style={{ flexShrink: 0 }}
          >
            <h1 className="modal-title fs-5" id="poViewModalLabel">
              {po.poNo}
            </h1>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div
            className="modal-body p-24"
            style={{ flex: 1, overflowY: "auto" }}
          >
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Header Info */}
                <div className="row gy-3 mb-4">
                  <div className="col-md-2">
                    <label className="form-label text-muted mb-1">
                      PO Number
                    </label>
                    <div className="fw-semibold">{po.poNo}</div>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-muted mb-1">Status</label>
                    <div>
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
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted mb-1">
                      Supplier
                    </label>
                    <div className="d-flex align-items-center gap-2">
                      {supplierName && (
                        <div className="w-24-px h-24-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center">
                          <span className="text-primary-600 fw-semibold text-xs">
                            {supplierName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="fw-medium">{supplierName}</div>
                        {supplierCode && (
                          <small className="text-muted">{supplierCode}</small>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-muted mb-1">
                      PO Date
                    </label>
                    <div className="fw-semibold">{formatDate(po.poDate)}</div>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-muted mb-1">
                      Expected Delivery
                    </label>
                    <div className="fw-semibold">
                      {formatDate(po.expectedDeliveryDate)}
                    </div>
                  </div>
                </div>

                <div className="row gy-3 mb-4">
                  <div className="col-md-3">
                    <label className="form-label text-muted mb-1">
                      Terms & Conditions
                    </label>
                    <div className="fw-semibold">{terms.name || "None"}</div>
                  </div>
                  <div className="col-md-9">
                    <label className="form-label text-muted mb-1">
                      Remarks
                    </label>
                    <div className="fw-semibold">{po.remarks || "-"}</div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="row gy-3 mb-4 mt-4">
                  <div className="col-12">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead className="table-header-custom">
                          <tr>
                            <th className="text-center">Item</th>
                            <th
                              className="text-center"
                              style={{ width: "300px" }}
                            >
                              Description
                            </th>
                            <th className="text-center">Qty</th>
                            <th className="text-center">UOM</th>
                            <th className="text-center">Unit Price</th>
                            <th className="text-center">SGST %</th>
                            <th className="text-center">CGST %</th>
                            <th className="text-center">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lineItems.length === 0 ? (
                            <tr>
                              <td
                                colSpan="8"
                                className="text-center py-3 text-muted"
                              >
                                No line items found
                              </td>
                            </tr>
                          ) : (
                            lineItems.map((item, index) => {
                              const itemDetails =
                                masterData.items.find(
                                  (i) => i.id === item.itemId
                                ) || {};
                              return (
                                <tr key={index}>
                                  <td>
                                    <div className="fw-medium">
                                      {itemDetails.name || "Unknown Item"}
                                    </div>
                                    <small className="text-muted">
                                      {itemDetails.code}
                                    </small>
                                  </td>
                                  <td className="text-center">
                                    {item.description}
                                  </td>
                                  <td className="text-center">{item.qty}</td>
                                  <td className="text-center">{item.uom}</td>
                                  <td className="text-center">
                                    ${(item.unitPrice || 0).toFixed(2)}
                                  </td>
                                  <td className="text-center">
                                    {item.sgstPercent || 0}%
                                  </td>
                                  <td className="text-center">
                                    {item.cgstPercent || 0}%
                                  </td>
                                  <td className="text-center">
                                    ${(item.amount || 0).toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <POFooterSummary
                  subtotal={subtotal}
                  tax={tax}
                  grandTotal={grandTotal}
                />

                {/* Notes / Activity Log Section - Only show for InProgress POs */}
                {po.status === "InProgress" && (
                  <>
                    <hr style={{ marginTop: "10px" }} />
                    <div>
                      <h6
                        className="fw-bold text-lg"
                        style={{ padding: "16px 10px" }}
                      >
                        Activity Log & Notes
                      </h6>

                      <div className="stepper-container mb-4">
                        {notes.length === 0 ? (
                          <div className="text-muted text-center py-3">
                            No notes added yet.
                          </div>
                        ) : (
                          notes.map((note, index) => (
                            <div className="stepper-item" key={index}>
                              <div className="stepper-icon-wrapper">
                                <div className="stepper-icon"></div>
                              </div>
                              <div className="stepper-content">
                                <div className="stepper-date">
                                  {note.timestamp}
                                  {note.edited && (
                                    <span className="text-muted ms-2">
                                      (Edited)
                                    </span>
                                  )}
                                </div>
                                {editingNoteIndex === index ? (
                                  <div className="d-flex gap-2 align-items-start mt-2">
                                    <textarea
                                      className="form-control"
                                      rows="2"
                                      value={editNoteText}
                                      onChange={(e) =>
                                        setEditNoteText(e.target.value)
                                      }
                                      autoFocus
                                    ></textarea>
                                    <div className="d-flex flex-column gap-1">
                                      <button
                                        className="btn btn-sm btn-success d-flex align-items-center gap-1"
                                        onClick={() => handleSaveEdit(index)}
                                        disabled={!editNoteText.trim()}
                                        style={{ whiteSpace: "nowrap" }}
                                      >
                                        <Icon icon="mdi:check" />
                                        Save
                                      </button>
                                      <button
                                        className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
                                        onClick={handleCancelEdit}
                                        style={{ whiteSpace: "nowrap" }}
                                      >
                                        <Icon icon="mdi:close" />
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="d-flex align-items-start justify-content-between">
                                    <div className="stepper-text flex-grow-1">
                                      {note.text}
                                    </div>
                                    <button
                                      className="btn btn-sm btn-link text-primary p-0 ms-2"
                                      onClick={() => handleEditNote(index)}
                                      title="Edit note"
                                    >
                                      <Icon
                                        icon="mdi:pencil"
                                        className="text-lg"
                                      />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="notes-input-area">
                        <label className="form-label fw-medium mb-2">
                          Add Note
                        </label>
                        <div className="d-flex gap-2 align-items-start">
                          <textarea
                            className="form-control"
                            rows="2"
                            placeholder="Enter your note or comment here..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                          ></textarea>
                          <button
                            className="btn btn-primary d-flex align-items-center gap-2"
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            <Icon icon="mdi:send" />
                            Add Note
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <div
            className="modal-footer p-24 border border-top border-start-0 border-end-0 border-bottom-0"
            style={{ flexShrink: 0 }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POViewLayer;
