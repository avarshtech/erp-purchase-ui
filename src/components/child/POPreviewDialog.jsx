
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import OperationControl from "../OperationControl";
import { createActivity, updateActivity } from "../../services/poActivityLog";
import { updatePurchaseOrder } from "../../services/purchaseOrders";

const POPreviewDialog = ({
  show,
  onClose,
  onSubmit,
  onApprove,
  onReject,
  formData,
  lineItems,
  suppliers,
  termsConditions,
  totals,
  loading,
  // View-only mode props
  viewMode = false,
  poData = null,
}) => {
  // Determine data source based on mode
  const isViewMode = viewMode && poData;

  // Activity log state (hooks must run unconditionally)
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");
  // Separate loading flags so approve and reject buttons show independent spinners
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    if (isViewMode && poData) {
      const activities = poData.activities || poData.notes || [];
      const mappedNotes = activities.map((activity) => ({
        text: activity.comment || activity.text || "",
        timestamp: activity.createdAt || activity.timestamp || "",
        user: activity.user || "User",
        edited: activity.edited || false,
        id: activity.id,
      }));
      setNotes(mappedNotes);
    }
  }, [isViewMode, poData]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    if (!poData) return;
    try {
      const res = await createActivity(poData.id, { comment: newNote });
      const mapped = {
        text: res.comment || res.text || newNote,
        timestamp: res.createdAt || new Date().toLocaleString(),
        user: res.user || "User",
        edited: res.edited || false,
        id: res.id,
      };
      setNotes((prev) => [...prev, mapped]);
      setNewNote("");
    } catch (err) {
      console.error("Failed to add activity:", err);
    }
  };

  const handleEditNote = (index) => {
    setEditingNoteIndex(index);
    setEditNoteText(notes[index].text);
  };

  const handleSaveEdit = async (index) => {
    if (!editNoteText.trim()) return;
    const noteToUpdate = notes[index];
    const timestamp = new Date().toLocaleString();
    const updatedNotes = [...notes];
    updatedNotes[index] = { ...updatedNotes[index], text: editNoteText, timestamp, edited: true };
    setNotes(updatedNotes);
    setEditingNoteIndex(null);
    setEditNoteText("");

    if (noteToUpdate && noteToUpdate.id && poData) {
      try {
        const res = await updateActivity(poData.id, noteToUpdate.id, { comment: editNoteText });
        setNotes((prev) => prev.map((n) => (n.id === res.id ? {
          text: res.comment || res.text || n.text,
          timestamp: res.updatedAt || res.createdAt || n.timestamp,
          user: res.user || n.user,
          edited: res.edited || true,
          id: res.id,
        } : n)));
      } catch (err) {
        console.error("Failed to update activity:", err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteIndex(null);
    setEditNoteText("");
  };

  // Thin scrollbar styles for activity log
  const activityScrollStyles = `
    .activity-scroll::-webkit-scrollbar { width: 8px; }
    .activity-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.16); border-radius: 6px; }
    .activity-scroll::-webkit-scrollbar-track { background: transparent; }
    .activity-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.16) transparent; }
  `;

  if (!show) return null;

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "Not selected";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format timestamp to `yyyy-MMM-dd HH:MM:ss` (24-hour)
  const formatTimestamp = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    const pad = (n) => String(n).padStart(2, "0");
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const year = d.getFullYear();
    const month = months[d.getMonth()];
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Get display values based on mode
  const getDisplayData = () => {
    if (isViewMode) {
      // View mode - use poData directly from table
      const displayLineItems = poData.lineItems || [];
      const subtotal = displayLineItems.reduce(
        (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
        0
      );
      const totals = displayLineItems.reduce(
        (acc, item) => {
          const qty = item.quantity || 0;
          const unitPrice = item.unitPrice || 0;
          const base = qty * unitPrice;
          const sgstPercent = parseFloat(item.sgstPercent ?? item.sgst ?? 0) || 0;
          const cgstPercent = parseFloat(item.cgstPercent ?? item.cgst ?? 0) || 0;
          // If explicit sgst/cgst percents are not present, try splitting combined gst (fallback)
          if (sgstPercent === 0 && cgstPercent === 0) {
            const gstPercent = parseFloat(item.gstPercent || 0) || 0;
            acc.sgst += (base * gstPercent) / 200; // half
            acc.cgst += (base * gstPercent) / 200; // half
          } else {
            acc.sgst += (base * sgstPercent) / 100;
            acc.cgst += (base * cgstPercent) / 100;
          }
          return acc;
        },
        { sgst: 0, cgst: 0 }
      );

      // Prefer API-provided order-level fields when available. Provide fallbacks to computed values.
      const apiSubtotal = poData.subtotal ?? poData.subTotal ?? poData.totalValue;
      const apiTax = poData.tax ?? poData.taxAmount;
      const apiSgst = poData.sgst ?? poData.sgstValue;
      const apiCgst = poData.cgst ?? poData.cgstValue;
      const apiGrand = poData.grandTotal ?? poData.totalValue ?? poData.grand_total;

      // If API gives tax but not split, try to split evenly when necessary
      const computedTax = apiTax !== undefined ? apiTax : totals.sgst + totals.cgst;
      const computedSgst = apiSgst !== undefined ? apiSgst : totals.sgst;
      const computedCgst = apiCgst !== undefined ? apiCgst : totals.cgst;

      const finalSubtotal = apiSubtotal !== undefined ? apiSubtotal : subtotal;
      const finalGrand = apiGrand !== undefined ? apiGrand : (finalSubtotal + computedTax);

      return {
        supplierName: poData.supplierName || "Not selected",
        poDate: formatDate(poData.poDate),
        deliveryDate: formatDate(poData.deliveryDate),
        termsConditionsTitle: poData.termsConditionsTitle || "Not specified",
        remarks: poData.remarks || "",
        poNumber: poData.poNumber || "",
        status: poData.status || "",
        lineItems: displayLineItems.map((item, index) => ({
          id: item.id || index,
          itemName: item.itemName || '',
          description: item.description || '',
          qty: item.quantity || 0,
          uom: item.uomName || "",
          unitPrice: item.unitPrice || 0,
          // item.cgst/item.sgst are percentages per API; combine them for display
          gstPercent:
            (parseFloat(item.cgst ?? item.cgstPercent ?? 0) || 0) +
            (parseFloat(item.sgst ?? item.sgstPercent ?? 0) || 0) +
            (parseFloat(item.igst ?? item.igstPercent ?? 0) || 0),
        })),
        totals: {
          subtotal: parseFloat((finalSubtotal || 0).toFixed(2)),
          sgst: parseFloat((computedSgst || 0).toFixed(2)),
          cgst: parseFloat((computedCgst || 0).toFixed(2)),
          grandTotal: parseFloat((finalGrand || 0).toFixed(2)),
        },
      };
    } else {
      // Preview mode - use formData and props
      const selectedSupplier = suppliers?.find(
        (s) => s.id === formData?.supplierId
      );
      const selectedTerms = termsConditions?.find(
        (tc) => tc.id === parseInt(formData?.termsConditionId)
      );

      // Compute totals for preview mode (use passed `totals` prop if it contains breakdown)
      const previewSubtotal = (totals && totals.subtotal) || (lineItems || []).reduce((s, it) => s + (it.qty || 0) * (it.unitPrice || 0), 0);

      // Compute sgst/cgst from the form line items if totals don't include them
      const previewBreakdown = (totals && (totals.sgst !== undefined || totals.cgst !== undefined))
        ? { sgst: totals.sgst || 0, cgst: totals.cgst || 0 }
        : (lineItems || []).reduce((acc, it) => {
            const qty = parseFloat(it.qty) || 0;
            const unitPrice = parseFloat(it.unitPrice) || 0;
            const base = qty * unitPrice;
            const sgstPercent = parseFloat(it.sgstPercent ?? it.sgst ?? 0) || 0;
            const cgstPercent = parseFloat(it.cgstPercent ?? it.cgst ?? 0) || 0;
            if (sgstPercent === 0 && cgstPercent === 0) {
              const gstPercent = parseFloat(it.gstPercent || 0) || 0;
              acc.sgst += (base * gstPercent) / 200;
              acc.cgst += (base * gstPercent) / 200;
            } else {
              acc.sgst += (base * sgstPercent) / 100;
              acc.cgst += (base * cgstPercent) / 100;
            }
            return acc;
          }, { sgst: 0, cgst: 0 });

      const previewGrand = (totals && totals.grandTotal) || previewSubtotal + previewBreakdown.sgst + previewBreakdown.cgst;

      return {
        supplierName: selectedSupplier?.name || "Not selected",
        poDate: formatDate(formData?.poDate),
        deliveryDate: formatDate(formData?.expectedDeliveryDate),
        termsConditionsTitle: selectedTerms?.name || "Not selected",
        remarks: formData?.remarks || "",
        poNumber: formData?.poNo || "",
        status: "",
        lineItems: (lineItems || []).map((item) => ({
          id: item.id,
          itemName: item.itemName || '',
          description: item.description || '',
          qty: item.qty || 0,
          uom: item.uom || "",
          unitPrice: item.unitPrice || 0,
          gstPercent: item.gstPercent || 0,
        })),
        totals: {
          subtotal: previewSubtotal || 0,
          sgst: previewBreakdown.sgst || 0,
          cgst: previewBreakdown.cgst || 0,
          grandTotal: previewGrand || 0,
        },
      };
    }
  };

  const displayData = getDisplayData();

  // Compute GST breakup grouped by GST percentage for preview dialog
  const gstBreakup = (() => {
    const groups = {};
    (displayData.lineItems || []).forEach((item) => {
      const qty = parseFloat(item.qty || item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const base = qty * unitPrice;

      let gstPercent = 0;
      if (item.gstPercent !== undefined && item.gstPercent !== null) {
        gstPercent = parseFloat(item.gstPercent) || 0;
      } else {
        gstPercent =
          (parseFloat(item.sgstPercent ?? item.sgst ?? 0) || 0) +
          (parseFloat(item.cgstPercent ?? item.cgst ?? 0) || 0);
      }

      if (gstPercent === 0) return;

      const gstAmount = (base * gstPercent) / 100;
      const sgstAmount = gstAmount / 2;
      const cgstAmount = gstAmount / 2;

      if (!groups[gstPercent]) {
        groups[gstPercent] = { sgst: 0, cgst: 0 };
      }
      groups[gstPercent].sgst += sgstAmount;
      groups[gstPercent].cgst += cgstAmount;
    });

    return Object.entries(groups)
      .map(([pct, vals]) => ({
        percent: parseFloat(pct),
        sgst: vals.sgst,
        cgst: vals.cgst,
      }))
      .sort((a, b) => a.percent - b.percent);
  })();

  const normalizeStatus = (s) => (s ? s.toString().replace(/\s+/g, "").toLowerCase() : "");
  const isInProgress = normalizeStatus(displayData.status) === "inprogress";
  const isAwaitApproval = normalizeStatus(displayData.status) === "awaitapproval";

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-success-focus text-success-main";
      case "InProgress":
        return "bg-warning-focus text-warning-main";
      case "Draft":
        return "bg-info-focus text-info-600";
      case "AwaitApproval":
        return "bg-neutral-200 text-cyan-600";
      case "Rejected":
        return "bg-danger-focus text-danger-main";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1060,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{activityScrollStyles}</style>
      <div
        className="modal-dialog"
        style={{ maxWidth: "1100px", width: "94%", maxHeight: "90vh" }}
      >
        <div
          className="modal-content radius-16 bg-base"
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "90vh",
          }}
        >
          {/* Header */}
          <div
            className="modal-header py-12 px-20 bg-primary-600"
            style={{
              borderRadius: "16px 16px 0 0",
              flexShrink: 0,
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <Icon
                icon={
                  isViewMode
                    ? "mdi:file-document-outline"
                    : "mdi:file-document-check-outline"
                }
                className="text-white"
                width="24"
                height="24"
              />
              <div className="d-flex align-items-center gap-3">
                <h1
                  className="modal-title fs-5 text-white mb-0"
                  id="poPreviewModalLabel"
                >
                  {isViewMode ? (
                    <>
                      {displayData.poNumber && (
                        <span className="fw-bold">{displayData.poNumber}</span>
                      )}
                      {!displayData.poNumber && "Purchase Order Details"}
                    </>
                  ) : (
                    <>
                      Purchase Order Preview
                      {displayData.status && (
                        <span
                          className={`ms-3 px-12 py-4 rounded-pill fw-bold text-xs ${getStatusBadgeClass(
                            displayData.status
                          )}`}
                        >
                          {displayData.status}
                        </span>
                      )}
                    </>
                  )}
                </h1>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            />
          </div>

          {/* Body */}
          <div
            className="modal-body p-20"
            style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
          >
            {/* PO Details Section */}
            <div className="mb-20">
              <div className="d-flex align-items-center gap-2 mb-16">
                <Icon
                  icon="mdi:information-outline"
                  className="text-primary-600"
                  width="20"
                  height="20"
                />
                <h6 className="mb-0 fw-semibold">Order Details</h6>
                {/* Show PO status badge in body for view mode only */}
                {isViewMode && displayData.status && (
                  <span
                    className={`ms-3 px-12 py-4 rounded-pill fw-bold text-xs ${getStatusBadgeClass(
                      displayData.status
                    )}`}
                  >
                    {displayData.status}
                  </span>
                )}
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="d-flex align-items-start gap-3 p-12 rounded-3 bg-neutral-50 border border-neutral-200">
                    <Icon
                      icon="mdi:store-outline"
                      width="20"
                      height="20"
                      className="text-primary-600 mt-1"
                    />
                    <div className="flex-grow-1">
                      <div className="text-secondary-light text-xs mb-1">
                        Supplier
                      </div>
                      <div className="fw-semibold">
                        {displayData.supplierName || (
                          <span className="text-secondary-light fst-italic">
                            Not selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-start gap-3 p-12 rounded-3 bg-neutral-50 border border-neutral-200">
                    <Icon
                      icon="mdi:calendar-outline"
                      width="20"
                      height="20"
                      className="text-primary-600 mt-1"
                    />
                    <div className="flex-grow-1">
                      <div className="text-secondary-light text-xs mb-1">
                        PO Date
                      </div>
                      <div className="fw-semibold">{displayData.poDate}</div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-start gap-3 p-12 rounded-3 bg-neutral-50 border border-neutral-200">
                    <Icon
                      icon="mdi:truck-delivery-outline"
                      width="20"
                      height="20"
                      className="text-primary-600 mt-1"
                    />
                    <div className="flex-grow-1">
                      <div className="text-secondary-light text-xs mb-1">
                        Expected Delivery Date
                      </div>
                      <div className="fw-semibold">
                        {displayData.deliveryDate}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-start gap-3 p-12 rounded-3 bg-neutral-50 border border-neutral-200">
                    <Icon
                      icon="mdi:file-document-outline"
                      width="20"
                      height="20"
                      className="text-primary-600 mt-1"
                    />
                    <div className="flex-grow-1">
                      <div className="text-secondary-light text-xs mb-1">
                        Terms & Conditions
                      </div>
                      <div className="fw-semibold">
                        {displayData.termsConditionsTitle || (
                          <span className="text-secondary-light fst-italic">
                            Not selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {displayData.remarks && (
                  <div className="col-12">
                    <div className="d-flex align-items-start gap-3 p-12 rounded-3 bg-neutral-50 border border-neutral-200">
                      <Icon
                        icon="mdi:note-text-outline"
                        width="20"
                        height="20"
                        className="text-primary-600 mt-1"
                      />
                      <div className="flex-grow-1">
                        <div className="text-secondary-light text-xs mb-1">
                          Remarks
                        </div>
                        <div className="fw-medium">{displayData.remarks}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Section - Card Based */}
            <div className="mb-20">
              <div className="d-flex align-items-center gap-2 mb-16">
                <Icon
                  icon="mdi:format-list-bulleted"
                  className="text-primary-600"
                  width="20"
                  height="20"
                />
                <h6 className="mb-0 fw-semibold">
                  Line Items ({displayData.lineItems.length})
                </h6>
              </div>

              <div className="d-flex flex-column gap-12">
                {displayData.lineItems.map((item, index) => {
                  const baseAmount =
                    (parseFloat(item.qty) || 0) *
                    (parseFloat(item.unitPrice) || 0);
                  const gstAmount = (baseAmount * (item.gstPercent || 0)) / 100;
                  const totalAmount = baseAmount + gstAmount;

                  return (
                    <div
                      key={item.id || index}
                      className="rounded-3 border border-neutral-200 overflow-hidden"
                    >
                      {/* Item Header */}
                      <div className="d-flex align-items-center justify-content-between px-16 py-10 bg-primary-50 border-bottom border-neutral-200">
                        <div className="d-flex align-items-center gap-2">
                          <p
                            className="d-flex align-items-center justify-content-center bg-primary-600 text-white rounded-circle fw-semibold"
                            style={{
                              minWidth: "32px",
                              width: "32px",
                              height: "32px",
                              fontSize: "14px",
                              marginBottom: 0
                            }}
                          >
                            {index + 1}
                          </p>
                          <div style={{width: '100%'}}>
                            <div className="fw-semibold text-primary-600" style={{wordBreak: 'break-word'}}>
                              {item.itemName || "No item name"}
                            </div>
                            {item.description && (
                              <div className="text-secondary-light text-xs mt-1" style={{wordBreak: 'break-word'}}>
                                description: {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="fw-bold text-success-600 fs-6" style={{marginBottom: 0}}>
                          ₹{totalAmount.toFixed(2)}
                        </p>
                      </div>

                      {/* Item Details */}
                      <div className="p-16">
                        <div className="row g-3">
                          <div className="col-6 col-md-3">
                            <div className="text-secondary-light text-xs mb-1">
                              Quantity
                            </div>
                            <div className="fw-medium">
                              {item.qty || 0}{" "}
                              <span className="text-secondary-light text-uppercase">
                                {item.uom || ""}
                              </span>
                            </div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="text-secondary-light text-xs mb-1">
                              Unit Price
                            </div>
                            <div className="fw-medium">
                              ₹{parseFloat(item.unitPrice || 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="text-secondary-light text-xs mb-1">
                              GST ({item.gstPercent || 0}%)
                            </div>
                            <div className="fw-medium">
                              ₹{gstAmount.toFixed(2)}
                            </div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="text-secondary-light text-xs mb-1">
                              Base Amount
                            </div>
                            <div className="fw-medium">
                              ₹{baseAmount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary + Activity Section */}
            <div className="d-flex gap-12 align-items-start">
              {isViewMode && isInProgress && (
                <div className="rounded-3 overflow-hidden bg-base border border-neutral-200" style={{flex: 1, minWidth: 380, maxWidth: 720}}>
                  <div className="px-16 py-10 bg-primary-600">
                    <div className="d-flex align-items-center gap-2">
                      <Icon
                        icon="mdi:format-list-bulleted"
                        className="text-white"
                        width="18"
                        height="18"
                      />
                      <span className="text-white fw-semibold text-sm">
                        Activity Log
                      </span>
                    </div>
                  </div>

                  <div className="p-16">
                    <div className="stepper-container activity-scroll mb-4" style={{ maxHeight: 270, overflowY: "auto", paddingRight: 8 }}>
                      {notes.length === 0 ? (
                        <div className="text-muted text-center py-3">No activity found.</div>
                      ) : (
                        notes.map((note, index) => (
                          <div className="stepper-item" key={note.id || index}>
                            <div className="stepper-icon-wrapper">
                              <div className="stepper-icon"></div>
                            </div>
                            <div className="stepper-content">
                              <div className="stepper-date">
                                {formatTimestamp(note.timestamp)}
                                {note.edited && <span className="text-muted ms-2">(Edited)</span>}
                              </div>
                              {editingNoteIndex === index ? (
                                <div className="d-flex gap-2 align-items-start mt-2">
                                  <textarea className="form-control" rows="2" value={editNoteText} onChange={(e) => setEditNoteText(e.target.value)} autoFocus></textarea>
                                  <div className="d-flex flex-column gap-1">
                                    <button className="btn btn-sm btn-success d-flex align-items-center gap-1" onClick={() => handleSaveEdit(index)} disabled={!editNoteText.trim()} style={{ whiteSpace: "nowrap" }}>
                                      <Icon icon="mdi:check" /> Save
                                    </button>
                                    <button className="btn btn-sm btn-secondary d-flex align-items-center gap-1" onClick={handleCancelEdit} style={{ whiteSpace: "nowrap" }}>
                                      <Icon icon="mdi:close" /> Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="d-flex align-items-start justify-content-between">
                                  <div className="stepper-text flex-grow-1">{note.text}</div>
                                  <OperationControl pageId="purchase-orders" operation="update">
                                    <button className="btn btn-sm btn-link text-primary p-0 ms-2" onClick={() => handleEditNote(index)} title="Edit note">
                                      <Icon icon="mdi:pencil" className="text-lg" />
                                    </button>
                                  </OperationControl>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <OperationControl pageId="purchase-orders" operation="update">
                      <div className="notes-input-area">
                        <label className="form-label fw-medium mb-2">Add Note</label>
                        <div className="d-flex gap-2 align-items-start">
                          <textarea className="form-control" rows="2" placeholder="Enter your note or comment here..." value={newNote} onChange={(e) => setNewNote(e.target.value)}></textarea>
                          <button
                            className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            style={{ whiteSpace: "nowrap", padding: "6px 10px", fontSize: "0.9rem" }}
                          >
                            <Icon icon="mdi:send" width="16" height="16" />
                            Add Note
                          </button>
                        </div>
                      </div>
                    </OperationControl>
                  </div>
                </div>
              )}

              <div className="rounded-3 overflow-hidden bg-base border border-neutral-200"
                style={{
                  width: "320px",
                  marginLeft: "auto",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              >
                <div className="px-16 py-10 bg-primary-600">
                  <div className="d-flex align-items-center gap-2">
                    <Icon
                      icon="mdi:calculator"
                      className="text-white"
                      width="18"
                      height="18"
                    />
                    <span className="text-white fw-semibold text-sm">
                      Order Summary
                    </span>
                  </div>
                </div>

                <div className="p-16">
                  <div className="d-flex justify-content-between align-items-center mb-12 pb-8 border-bottom border-dashed">
                    <span className="text-secondary-light text-sm">
                      Subtotal
                    </span>
                    <span className="text-sm fw-medium">
                      ₹{displayData.totals.subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* GST Breakup Section */}
                  {gstBreakup.length > 0 && (
                    <div className="mb-12 pb-8 border-bottom border-dashed">
                      <div className="d-flex align-items-center gap-2 mb-8">
                        <Icon icon="mdi:format-list-group" className="text-primary-600" width="16" height="16" />
                        <span className="text-primary-600 fw-semibold text-xs text-uppercase">GST Breakup</span>
                      </div>
                      {gstBreakup.map((group) => (
                        <div key={group.percent} className="ps-3 mb-6">
                          <div className="text-secondary-light text-xs fw-medium mb-4" style={{ opacity: 0.85 }}>
                            GST @ {group.percent}%
                          </div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="text-secondary-light text-xs ps-24">SGST ({group.percent / 2}%)</span>
                            <span className="text-xs fw-medium">₹{group.sgst.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-secondary-light text-xs ps-24">CGST ({group.percent / 2}%)</span>
                            <span className="text-xs fw-medium">₹{group.cgst.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mb-8 pb-6 border-bottom border-dashed">
                    <span className="text-secondary-light text-sm">Total SGST</span>
                    <span className="text-sm fw-medium">₹{(displayData.totals.sgst || 0).toFixed(2)}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-12 pb-8 border-bottom border-dashed">
                    <span className="text-secondary-light text-sm">Total CGST</span>
                    <span className="text-sm fw-medium">₹{(displayData.totals.cgst || 0).toFixed(2)}</span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center p-12 rounded-2 mt-8 bg-primary-600">
                    <span className="text-white fw-semibold">Grand Total</span>
                    <span className="text-white fw-bold fs-5">
                      ₹{displayData.totals.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          

          {/* Footer */}
            <div
              className="modal-footer p-16 border-top"
              style={{ flexShrink: 0 }}
            >
              <button
                type="button"
                className="btn btn-outline-secondary px-24 py-10 radius-8 d-flex align-items-center"
                onClick={onClose}
                disabled={loading}
              >
                <Icon icon="mdi:close" className="me-2" />
                {isViewMode ? "Close" : "Cancel"}
              </button>

              {isViewMode && isAwaitApproval && (
                <>
                  <OperationControl pageId="purchase-orders" operation="reject">
                    <button
                      type="button"
                      className="btn btn-outline-danger px-24 py-10 radius-8 d-flex align-items-center ms-3"
                          onClick={async () => {
                            if (!poData) return;
                            try {
                              setRejectLoading(true);
                              const payload = { ...poData, status: "Rejected" };
                              const res = await updatePurchaseOrder(poData.id, payload);
                              if (onReject) onReject(res);
                              onClose();
                            } catch (err) {
                              console.error("Failed to reject PO:", err);
                            } finally {
                              setRejectLoading(false);
                            }
                          }}
                          disabled={loading || rejectLoading}
                    >
                          {rejectLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <Icon icon="mdi:close-octagon" className="me-2" />
                              Reject
                            </>
                          )}
                    </button>
                  </OperationControl>

                  <OperationControl pageId="purchase-orders" operation="approve">
                    <button
                      type="button"
                      className="btn btn-success px-24 py-10 radius-8 d-flex align-items-center ms-3"
                      onClick={async () => {
                        if (!poData) return;
                        try {
                          setApproveLoading(true);
                          const payload = { ...poData, status: "InProgress" };
                          const res = await updatePurchaseOrder(poData.id, payload);
                          if (onApprove) onApprove(res);
                          onClose();
                        } catch (err) {
                          console.error("Failed to approve PO:", err);
                        } finally {
                          setApproveLoading(false);
                        }
                      }}
                      disabled={loading || approveLoading}
                    >
                      {approveLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:check-circle-outline" className="me-2" />
                          Approve
                        </>
                      )}
                    </button>
                  </OperationControl>
                </>
              )}

              {!isViewMode && (
                <button
                  type="button"
                  className="btn btn-primary px-24 py-10 radius-8 d-flex align-items-center"
                  onClick={onSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:send-outline" className="me-2" />
                      Submit for Approval
                    </>
                  )}
                </button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default POPreviewDialog;
