
import React, { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import OperationControl from "../OperationControl";
import { createActivity, updateActivity, parseActivityComment } from "../../services/poActivityLog";
import { updatePurchaseOrder } from "../../services/purchaseOrders";
import { getCurrentUser } from "../../utils/permissions";
import POStatusActionModal from "./POStatusActionModal";
import { getColorHex, isColorAttribute } from "../../utils/colorConstants";

// Render color swatch for color attributes
const ColorSwatch = ({ colorName, size = 14 }) => {
  const hex = getColorHex(colorName);
  if (!hex) return null;
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "3px",
        backgroundColor: hex,
        border: "1px solid rgba(0,0,0,0.15)",
        flexShrink: 0,
        marginRight: 4,
        verticalAlign: "middle",
      }}
      title={colorName}
    />
  );
};

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
  // IGST mode (for preview/create mode)
  isIgstApplicable = false,
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
  const [cancelLoading, setCancelLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [referBackLoading, setReferBackLoading] = useState(false);

  // Status action modal state
  const [actionModal, setActionModal] = useState({
    show: false,
    actionType: null, // 'approve' | 'reject' | 'cancel' | 'complete' | 'referback' | 'completeLineItem'
    lineItem: null, // For line item specific actions
    lineItemIndex: null,
  });

  // NOTE: removed explicit order summary height-sync to allow flex layout
  // so Activity Log can expand and both columns stretch evenly.

  useEffect(() => {
    if (isViewMode && poData) {
      const activities = poData.activities || poData.notes || [];
      const mappedNotes = activities.map((activity) => {
        // Parse the comment to extract isSystemGenerated and status
        const rawComment = activity.comment || activity.text || "";
        const parsed = parseActivityComment(rawComment);
        
        return {
          text: parsed.text,
          timestamp: activity.createdAt || activity.timestamp || "",
          user: activity.user || "User",
          edited: activity.edited || false,
          id: activity.id,
          isSystemGenerated: parsed.isSystemGenerated,
          status: parsed.status,
          rawComment: rawComment, // Keep raw for editing
        };
      });
      setNotes(mappedNotes);
    }
  }, [isViewMode, poData]);

  // (removed) previous ResizeObserver-based height-sync — rely on flexbox instead

  // Get current user info for activity logging
  const currentUser = getCurrentUser();
  const userName = currentUser?.name || currentUser?.username || currentUser?.email || "User";

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

  // Open status action modal
  const openActionModal = (actionType, lineItem = null, lineItemIndex = null) => {
    setActionModal({ show: true, actionType, lineItem, lineItemIndex });
  };

  // Close status action modal
  const closeActionModal = () => {
    setActionModal({ show: false, actionType: null, lineItem: null, lineItemIndex: null });
  };

  // Handle line item mark as complete
  const handleLineItemComplete = (item, index) => {
    openActionModal('completeLineItem', item, index);
  };

  // Handle status action confirmation
  const handleStatusAction = async (comment) => {
    if (!poData) return;
    
    const { actionType, lineItem, lineItemIndex } = actionModal;
    
    // Handle line item completion separately
    if (actionType === 'completeLineItem') {
      await handleLineItemCompleteConfirm(lineItem, lineItemIndex, comment);
      return;
    }
    
    // Map action type to status
    const statusMap = {
      approve: "InProgress",
      reject: "Rejected",
      cancel: "Cancelled",
      complete: "Completed",
      referback: "ReferredBack",
    };

    // Map action type to activity message
    const getActivityMessage = (type, userComment) => {
      const actionMessages = {
        approve: `PO approved by ${userName}. ${userComment ? `Comments: ${userComment}` : ""}`,
        reject: `PO rejected by ${userName}. Reason: ${userComment}`,
        cancel: `PO cancelled by ${userName}. Reason: ${userComment}`,
        complete: `PO marked as completed by ${userName}. ${userComment ? `Notes: ${userComment}` : ""}`,
        referback: `PO referred back by ${userName}. Reason: ${userComment}`,
      };
      return actionMessages[type] || `Status updated by ${userName}`;
    };

    const newStatus = statusMap[actionType];
    const activityMessage = getActivityMessage(actionType, comment);

    // Set appropriate loading state
    const loadingSetters = {
      approve: setApproveLoading,
      reject: setRejectLoading,
      cancel: setCancelLoading,
      complete: setCompleteLoading,
      referback: setReferBackLoading,
    };

    const setLoading = loadingSetters[actionType];
    
    try {
      setLoading(true);
      
      // Update line items status based on PO status change
      let updatedLineItems = [...(poData.lineItems || [])];
      
      // When PO is cancelled, mark all line items as Cancelled
      if (actionType === 'cancel') {
        updatedLineItems = updatedLineItems.map(item => ({
          ...item,
          status: 'Cancelled'
        }));
      }
      
      // When PO is completed, all line items should already be Completed
      // (button is disabled until all are complete)
      
      // Update PO status
      const payload = { 
        ...poData, 
        status: newStatus,
        lineItems: updatedLineItems,
      };
      const res = await updatePurchaseOrder(poData.id, payload);
      
      // Create activity log entry
      await createActivity(poData.id, { 
        comment: activityMessage,
        status: newStatus,
        isSystemGenerated: false,
      });
      
      // Update local notes state
      const newNoteEntry = {
        text: activityMessage,
        timestamp: new Date().toISOString(),
        user: userName,
        edited: false,
        id: Date.now(), // Temporary ID until refresh
        isSystemGenerated: false,
      };
      setNotes((prev) => [...prev, newNoteEntry]);
      
      // Call appropriate callback
      const callbacks = {
        approve: onApprove,
        reject: onReject,
        cancel: onReject, // Reuse reject callback for cancel
        complete: onApprove, // Reuse approve callback for complete
        referback: onReject, // Reuse reject callback for referback
      };
      
      const callback = callbacks[actionType];
      if (callback) callback(res);
      
      closeActionModal();
      onClose();
    } catch (err) {
      console.error(`Failed to ${actionType} PO:`, err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle line item completion confirmation
  const handleLineItemCompleteConfirm = async (lineItem, index, comment) => {
    if (!poData) return;
    
    try {
      setCompleteLoading(true);
      
      // Update the specific line item's status
      const updatedLineItems = [...(poData.lineItems || [])];
      updatedLineItems[index] = {
        ...updatedLineItems[index],
        status: 'Completed',
      };
      
      // Update PO with the new line items
      const payload = {
        ...poData,
        lineItems: updatedLineItems,
      };
      const res = await updatePurchaseOrder(poData.id, payload);
      
      // Create activity log for line item completion
      const itemName = lineItem.itemName || `Item ${index + 1}`;
      const activityMessage = `Line item "${itemName}" marked as completed by ${userName}. Notes: ${comment}`;
      
      await createActivity(poData.id, {
        comment: activityMessage,
        status: poData.status, // Keep the current PO status
        isSystemGenerated: false,
      });
      
      // Update local notes state
      const newNoteEntry = {
        text: activityMessage,
        timestamp: new Date().toISOString(),
        user: userName,
        edited: false,
        id: Date.now(),
        isSystemGenerated: false,
      };
      setNotes((prev) => [...prev, newNoteEntry]);
      
      // Refresh the PO data by calling onApprove callback with updated data
      if (onApprove) onApprove(res);
      
      closeActionModal();
      // Don't close the dialog - user might want to complete more line items
    } catch (err) {
      console.error('Failed to complete line item:', err);
    } finally {
      setCompleteLoading(false);
    }
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

      // Detect if IGST is applicable from data (check if any line item has igst > 0)
      const isIgstFromData = displayLineItems.some(
        (item) => (parseFloat(item.igst ?? item.igstPercent ?? 0) || 0) > 0 ||
                  (parseFloat(item.igstValue ?? 0) || 0) > 0
      ) || (parseFloat(poData.igstValue ?? poData.igst ?? 0) || 0) > 0;

      const totals = displayLineItems.reduce(
        (acc, item) => {
          const qty = item.quantity || 0;
          const unitPrice = item.unitPrice || 0;
          const base = qty * unitPrice;
          
          if (isIgstFromData) {
            // IGST mode
            const igstPercent = parseFloat(item.igstPercent ?? item.igst ?? 0) || 0;
            if (igstPercent > 0) {
              acc.igst += (base * igstPercent) / 100;
            } else {
              // Fallback to gstPercent if igst not present
              const gstPercent = parseFloat(item.gstPercent || 0) || 0;
              acc.igst += (base * gstPercent) / 100;
            }
          } else {
            // SGST/CGST mode
            const sgstPercent = parseFloat(item.sgstPercent ?? item.sgst ?? 0) || 0;
            const cgstPercent = parseFloat(item.cgstPercent ?? item.cgst ?? 0) || 0;
            if (sgstPercent === 0 && cgstPercent === 0) {
              const gstPercent = parseFloat(item.gstPercent || 0) || 0;
              acc.sgst += (base * gstPercent) / 200;
              acc.cgst += (base * gstPercent) / 200;
            } else {
              acc.sgst += (base * sgstPercent) / 100;
              acc.cgst += (base * cgstPercent) / 100;
            }
          }
          return acc;
        },
        { sgst: 0, cgst: 0, igst: 0 }
      );

      // Prefer API-provided order-level fields when available. Provide fallbacks to computed values.
      const apiSubtotal = poData.subtotal ?? poData.subTotal ?? poData.totalValue;
      const apiTax = poData.tax ?? poData.taxAmount;
      const apiSgst = poData.sgst ?? poData.sgstValue;
      const apiCgst = poData.cgst ?? poData.cgstValue;
      const apiIgst = poData.igst ?? poData.igstValue;
      const apiGrand = poData.grandTotal ?? poData.totalValue ?? poData.grand_total;

      // If API gives tax but not split, try to split evenly when necessary
      const computedTax = apiTax !== undefined ? apiTax : (isIgstFromData ? totals.igst : totals.sgst + totals.cgst);
      const computedSgst = apiSgst !== undefined ? apiSgst : totals.sgst;
      const computedCgst = apiCgst !== undefined ? apiCgst : totals.cgst;
      const computedIgst = apiIgst !== undefined ? apiIgst : totals.igst;

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
        isIgstApplicable: isIgstFromData,
        lineItems: displayLineItems.map((item, index) => ({
          id: item.id || index,
          itemName: item.itemName || '',
          itemCode: item.itemCode || item.code || '',
          description: item.description || '',
          qty: item.quantity || 0,
          uom: item.uomName || "",
          unitPrice: item.unitPrice || 0,
          status: item.status || null,
          variantAttributes: item.variantAttributes || item.variant_attributes || null,
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
          igst: parseFloat((computedIgst || 0).toFixed(2)),
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

      // Compute sgst/cgst/igst from the form line items based on isIgstApplicable prop
      let previewBreakdown;
      if (isIgstApplicable) {
        // IGST mode
        previewBreakdown = (totals && totals.igst !== undefined)
          ? { igst: totals.igst || 0, sgst: 0, cgst: 0 }
          : (lineItems || []).reduce((acc, it) => {
              const qty = parseFloat(it.qty) || 0;
              const unitPrice = parseFloat(it.unitPrice) || 0;
              const base = qty * unitPrice;
              const gstPercent = parseFloat(it.gstPercent || 0) || 0;
              acc.igst += (base * gstPercent) / 100;
              return acc;
            }, { igst: 0, sgst: 0, cgst: 0 });
      } else {
        // SGST/CGST mode
        previewBreakdown = (totals && (totals.sgst !== undefined || totals.cgst !== undefined))
          ? { sgst: totals.sgst || 0, cgst: totals.cgst || 0, igst: 0 }
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
            }, { sgst: 0, cgst: 0, igst: 0 });
      }

      const previewGrand = (totals && totals.grandTotal) || previewSubtotal + (isIgstApplicable ? previewBreakdown.igst : previewBreakdown.sgst + previewBreakdown.cgst);

      return {
        supplierName: selectedSupplier?.name || "Not selected",
        poDate: formatDate(formData?.poDate),
        deliveryDate: formatDate(formData?.expectedDeliveryDate),
        termsConditionsTitle: selectedTerms?.name || "Not selected",
        remarks: formData?.remarks || "",
        poNumber: formData?.poNo || "",
        status: "",
        isIgstApplicable: isIgstApplicable,
        lineItems: (lineItems || []).map((item) => ({
          id: item.id,
          itemName: item.itemName || '',
          itemCode: item.itemCode || item.code || '',
          description: item.description || '',
          qty: item.qty || 0,
          uom: item.uom || "",
          unitPrice: item.unitPrice || 0,
          gstPercent: item.gstPercent || 0,
          status: item.status || null,
          variantAttributes: item.variantAttributes || null,
        })),
        totals: {
          subtotal: previewSubtotal || 0,
          sgst: previewBreakdown.sgst || 0,
          cgst: previewBreakdown.cgst || 0,
          igst: previewBreakdown.igst || 0,
          grandTotal: previewGrand || 0,
        },
      };
    }
  };

  const displayData = getDisplayData();

  // Determine if IGST mode based on displayData
  const isIgstMode = displayData.isIgstApplicable || false;

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
      } else if (isIgstMode) {
        gstPercent = parseFloat(item.igstPercent ?? item.igst ?? 0) || 0;
      } else {
        gstPercent =
          (parseFloat(item.sgstPercent ?? item.sgst ?? 0) || 0) +
          (parseFloat(item.cgstPercent ?? item.cgst ?? 0) || 0);
      }

      if (gstPercent === 0) return;

      const gstAmount = (base * gstPercent) / 100;

      if (!groups[gstPercent]) {
        groups[gstPercent] = { igst: 0, sgst: 0, cgst: 0 };
      }

      if (isIgstMode) {
        groups[gstPercent].igst += gstAmount;
      } else {
        groups[gstPercent].sgst += gstAmount / 2;
        groups[gstPercent].cgst += gstAmount / 2;
      }
    });

    return Object.entries(groups)
      .map(([pct, vals]) => ({
        percent: parseFloat(pct),
        igst: vals.igst,
        sgst: vals.sgst,
        cgst: vals.cgst,
      }))
      .sort((a, b) => a.percent - b.percent);
  })();

  const normalizeStatus = (s) => (s ? s.toString().replace(/\s+/g, "").toLowerCase() : "");
  const isInProgress = normalizeStatus(displayData.status) === "inprogress";
  const isAwaitApproval = normalizeStatus(displayData.status) === "awaitapproval";
  const isRejected = normalizeStatus(displayData.status) === "rejected";
  const isCancelled = normalizeStatus(displayData.status) === "cancelled";
  const isCompleted = normalizeStatus(displayData.status) === "completed";
  const isReferredBack = normalizeStatus(displayData.status) === "referredback";
  const isDraft = normalizeStatus(displayData.status) === "draft";

  // Helper to get effective line item status (handles old data without status field)
  const getEffectiveLineItemStatus = (item) => {
    if (item.status) return item.status;
    // Infer from PO status for old data
    if (isInProgress) return "InProgress";
    if (isCompleted) return "Completed";
    if (isCancelled) return "Cancelled";
    return "Draft";
  };

  // Check if all line items are completed (for enabling PO Complete button)
  const allLineItemsCompleted = displayData.lineItems?.length > 0 && 
    displayData.lineItems.every(item => getEffectiveLineItemStatus(item) === "Completed");
  
  // Check if there are any incomplete line items
  const incompleteLineItemsCount = displayData.lineItems?.filter(
    item => getEffectiveLineItemStatus(item) !== "Completed"
  ).length || 0;

  // Show activity log for all statuses in view mode (except preview mode before submit)
  const shouldShowActivityLog = isViewMode;

  const getStatusBadgeClass = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case "completed":
        return "bg-success-focus text-success-main";
      case "inprogress":
        return "bg-warning-focus text-warning-main";
      case "draft":
        return "bg-info-focus text-info-600";
      case "awaitapproval":
        return "bg-neutral-200 text-cyan-600";
      case "rejected":
        return "bg-danger-focus text-danger-main";
      case "cancelled":
        return "bg-danger-focus text-danger-main";
      case "referredback":
        return "bg-purple-100 text-purple-600";
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

                {/* Remarks - always show */}
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
                      <div className="fw-medium">
                        {displayData.remarks || (
                          <span className="text-secondary-light fst-italic">
                            No remarks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
                  
                  // Get effective line item status (uses helper that handles old data)
                  const lineItemStatus = getEffectiveLineItemStatus(item);
                  
                  const lineItemStatusConfig = {
                    Draft: { label: "Draft", bg: "bg-secondary-100", color: "text-secondary-600" },
                    InProgress: { label: "In Progress", bg: "bg-info-100", color: "text-info-600" },
                    Completed: { label: "Completed", bg: "bg-success-100", color: "text-success-600" },
                    Cancelled: { label: "Cancelled", bg: "bg-danger-100", color: "text-danger-600" },
                  };
                  const statusDisplay = lineItemStatusConfig[lineItemStatus] || lineItemStatusConfig.Draft;
                  
                  // Show mark complete button only for InProgress line items when PO is InProgress
                  const canMarkComplete = isViewMode && isInProgress && lineItemStatus === "InProgress";

                  return (
                    <div
                      key={item.id || index}
                      className="rounded-3 border border-neutral-200 overflow-hidden"
                    >
                      {/* Item Header */}
                      <div className="d-flex align-items-center justify-content-between px-16 py-10 bg-primary-50 border-bottom border-neutral-200">
                        <div className="d-flex align-items-center gap-4">
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
                            <div className="fw-semibold text-primary-600 d-flex align-items-center gap-2 flex-wrap" style={{wordBreak: 'break-word'}}>
                              <span>{item.itemName || "No item name"}</span>
                              {item.itemCode && (
                                <span className="text-secondary-light text-xs fw-normal">({item.itemCode})</span>
                              )}
                              {/* Line Item Status Badge */}
                              {isViewMode && (
                                <span className={`badge px-8 py-4 rounded-pill ${statusDisplay.bg} ${statusDisplay.color} text-xs fw-medium`}>
                                  {statusDisplay.label}
                                </span>
                              )}
                            </div>
                            {/* Variant Attributes - displayed as inline tags */}
                            {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                              <div className="d-flex flex-wrap gap-1 mt-6">
                                {Object.entries(item.variantAttributes).map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="badge d-inline-flex align-items-center gap-1 bg-neutral-100 text-neutral-700 border border-neutral-200"
                                    style={{ 
                                      fontSize: "11px", 
                                      padding: "4px 8px",
                                      fontWeight: 500,
                                      borderRadius: "6px",
                                    }}
                                  >
                                    {isColorAttribute(key) && <ColorSwatch colorName={value} size={12} />}
                                    <span className="text-secondary-light text-capitalize" style={{ fontSize: "10px" }}>{key}:</span>
                                    <span className="text-capitalize">{value}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.description && (
                              <div className="text-secondary-light text-xs mt-4" style={{wordBreak: 'break-word'}}>
                                <Icon icon="mdi:text-box-outline" width="12" height="12" className="me-1" style={{ verticalAlign: 'text-bottom' }} />
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          {/* Mark Complete Button for Line Item */}
                          {canMarkComplete && (
                            <OperationControl allowedRoles={['Purchaser']}>
                              <button
                                type="button"
                                className="btn btn-outline-success btn-sm d-flex align-items-center gap-1 px-12 py-4"
                                onClick={() => handleLineItemComplete(item, index)}
                                title="Mark this line item as complete"
                              >
                                <Icon icon="mdi:check-circle-outline" width="16" height="16" />
                                <span className="text-xs">Complete</span>
                              </button>
                            </OperationControl>
                          )}
                          <p className="fw-bold text-success-600 fs-6" style={{marginBottom: 0, minWidth: '100px', textAlign: 'right' }}>
                            ₹ {totalAmount.toFixed(2)}
                          </p>
                        </div>
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
                              ₹ {parseFloat(item.unitPrice || 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="text-secondary-light text-xs mb-1">
                              GST ({item.gstPercent || 0}%)
                            </div>
                            <div className="fw-medium">
                              ₹ {gstAmount.toFixed(2)}
                            </div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="text-secondary-light text-xs mb-1">
                              Base Amount
                            </div>
                            <div className="fw-medium">
                              ₹ {baseAmount.toFixed(2)}
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
            <div className="d-flex gap-12 align-items-stretch">
              {/* Activity Log - shown for all statuses in view mode */}
              {shouldShowActivityLog && (
                <div 
                  className="rounded-3 overflow-hidden bg-base border border-neutral-200 d-flex flex-column" 
                  style={{
                    flex: 1,
                    minWidth: 380,
                    maxWidth: 720,
                    display: 'flex',
                    flexDirection: 'column',
                    // ensure readable area for activity log; flexbox will stretch both columns
                    minHeight: '40vh',
                  }}
                >
                  <div className="px-16 py-10 bg-primary-600" style={{ flexShrink: 0 }}>
                    <div className="d-flex align-items-center gap-2">
                      <Icon
                        icon="mdi:history"
                        className="text-white"
                        width="18"
                        height="18"
                      />
                      <span className="text-white fw-semibold text-sm">
                        Activity Log
                      </span>
                    </div>
                  </div>

                  <div className="p-16 d-flex flex-column" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <div 
                      className="stepper-container activity-scroll" 
                      style={{ 
                        flex: 1, 
                        overflowY: "auto", 
                        paddingRight: 8,
                        marginBottom: (isInProgress || isDraft || isRejected || isReferredBack) ? 12 : 0,
                        maxHeight: '430px',
                      }}
                    >
                      {notes.length === 0 ? (
                        <div className="text-muted text-center py-3">No activity found.</div>
                      ) : (
                        notes.map((note, index) => {
                          // isSystemGenerated is already parsed from the comment format
                          const isSystemActivity = note.isSystemGenerated;
                          // text is already cleaned from prefix by parseActivityComment
                          const displayText = note.text;
                          
                          return (
                            <div className="stepper-item" key={note.id || index}>
                              <div className="stepper-icon-wrapper">
                                <div 
                                  className="stepper-icon"
                                  style={{
                                    backgroundColor: isSystemActivity ? '#6c757d' : '#0d6efd',
                                  }}
                                ></div>
                              </div>
                              <div className="stepper-content">
                                <div className="stepper-date d-flex align-items-center gap-2">
                                  {formatTimestamp(note.timestamp)}
                                  {isSystemActivity && (
                                    <span
                                      className="badge bg-secondary-100 text-secondary-600 rounded-pill text-xs d-inline-flex align-items-center"
                                      style={{ padding: '4px 8px', lineHeight: 1, height: 20 }}
                                    >
                                      <Icon icon="mdi:robot" width="12" height="12" className="me-1" />
                                      <span style={{ display: 'inline-block', transform: 'translateY(-1px)' }}>System</span>
                                    </span>
                                  )}
                                  {!isSystemActivity && (
                                    <span
                                      className="badge bg-primary-100 text-primary-600 rounded-pill text-xs d-inline-flex align-items-center"
                                      style={{ padding: '4px 8px', lineHeight: 1, height: 20 }}
                                    >
                                      <Icon icon="mdi:account" width="12" height="12" className="me-1" />
                                      <span style={{ display: 'inline-block', transform: 'translateY(-1px)' }}>User</span>
                                    </span>
                                  )}
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
                                    <div 
                                      className="stepper-text flex-grow-1"
                                      style={{
                                        fontStyle: isSystemActivity ? 'italic' : 'normal',
                                        color: isSystemActivity ? '#6c757d' : 'inherit',
                                      }}
                                    >
                                      {displayText}
                                    </div>
                                    {/* Only allow editing notes for in-progress status and user activities */}
                                    {isInProgress && !isSystemActivity && (
                                      <OperationControl pageId="purchase-orders" operation="update">
                                        <button className="btn btn-sm btn-link text-primary p-0 ms-2" onClick={() => handleEditNote(index)} title="Edit note">
                                          <Icon icon="mdi:pencil" className="text-lg" />
                                        </button>
                                      </OperationControl>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add note section - only for active statuses */}
                    {(isInProgress || isDraft || isRejected || isReferredBack) && (
                      <OperationControl pageId="purchase-orders" operation="update">
                        <div className="notes-input-area" style={{ flexShrink: 0 }}>
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
                    )}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div 
                className="rounded-3 overflow-hidden bg-base border border-neutral-200"
                style={{
                  flexBasis: shouldShowActivityLog ? "35%" : "100%",
                  // Do not stretch this card to match activity log; keep compact
                  alignSelf: 'flex-start',
                  marginLeft: "auto",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  // Limit height so it doesn't stretch too tall and allow scrolling
                  maxHeight: '60vh',
                  overflowY: 'auto',
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
                      ₹ {displayData.totals.subtotal.toFixed(2)}
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
                          {isIgstMode ? (
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-secondary-light text-xs ps-24">IGST ({group.percent}%)</span>
                              <span className="text-xs fw-medium">₹ {group.igst.toFixed(2)}</span>
                            </div>
                          ) : (
                            <>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-secondary-light text-xs ps-24">SGST ({group.percent / 2}%)</span>
                                <span className="text-xs fw-medium">₹ {group.sgst.toFixed(2)}</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-secondary-light text-xs ps-24">CGST ({group.percent / 2}%)</span>
                                <span className="text-xs fw-medium">₹ {group.cgst.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total IGST or Total SGST/CGST */}
                  {isIgstMode ? (
                    <div className="d-flex justify-content-between align-items-center mb-12 pb-8 border-bottom border-dashed">
                      <span className="text-secondary-light text-sm">Total IGST</span>
                      <span className="text-sm fw-medium">₹ {(displayData.totals.igst || 0).toFixed(2)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-8 pb-6 border-bottom border-dashed">
                        <span className="text-secondary-light text-sm">Total SGST</span>
                        <span className="text-sm fw-medium">₹ {(displayData.totals.sgst || 0).toFixed(2)}</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-12 pb-8 border-bottom border-dashed">
                        <span className="text-secondary-light text-sm">Total CGST</span>
                        <span className="text-sm fw-medium">₹ {(displayData.totals.cgst || 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  <div className="d-flex justify-content-between align-items-center p-12 rounded-2 mt-8 bg-primary-600">
                    <span className="text-white fw-semibold">Grand Total</span>
                    <span className="text-white fw-bold fs-5">
                      ₹ {displayData.totals.grandTotal.toFixed(2)}
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

              {/* AwaitApproval Status: Reject, Cancel PO, Approve */}
              {isViewMode && isAwaitApproval && (
                <>
                  <OperationControl pageId="po-approval" operation="update">
                    <button
                      type="button"
                      className="btn btn-outline-danger px-20 py-10 radius-8 d-flex align-items-center ms-3"
                      onClick={() => openActionModal("reject")}
                      disabled={loading || rejectLoading}
                    >
                      <Icon icon="mdi:close-octagon" className="me-2" />
                      Reject
                    </button>
                  </OperationControl>

                  <OperationControl pageId="po-approval" operation="update">
                    <button
                      type="button"
                      className="btn btn-outline-warning px-20 py-10 radius-8 d-flex align-items-center ms-3"
                      onClick={() => openActionModal("cancel")}
                      disabled={loading || cancelLoading}
                    >
                      <Icon icon="mdi:cancel" className="me-2" />
                      Cancel PO
                    </button>
                  </OperationControl>

                  <OperationControl pageId="po-approval" operation="update">
                    <button
                      type="button"
                      className="btn btn-success px-20 py-10 radius-8 d-flex align-items-center ms-3"
                      onClick={() => openActionModal("approve")}
                      disabled={loading || approveLoading}
                    >
                      <Icon icon="mdi:check-circle-outline" className="me-2" />
                      Approve
                    </button>
                  </OperationControl>
                </>
              )}

              {/* InProgress Status: Refer Back, Cancel PO, Complete */}
              {isViewMode && isInProgress && (
                <>
                  <OperationControl pageId="purchase-orders" operation="update">
                    <button
                      type="button"
                      className="btn btn-outline-info px-20 py-10 radius-8 d-flex align-items-center ms-3"
                      onClick={() => openActionModal("referback")}
                      disabled={loading || referBackLoading}
                    >
                      <Icon icon="mdi:undo-variant" className="me-2" />
                      Refer Back
                    </button>
                  </OperationControl>

                  <OperationControl pageId="purchase-orders" operation="update">
                    <button
                      type="button"
                      className="btn btn-outline-warning px-20 py-10 radius-8 d-flex align-items-center ms-3"
                      onClick={() => openActionModal("cancel")}
                      disabled={loading || cancelLoading}
                    >
                      <Icon icon="mdi:cancel" className="me-2" />
                      Cancel PO
                    </button>
                  </OperationControl>

                  <OperationControl pageId="purchase-orders" operation="update">
                    <div 
                      title={!allLineItemsCompleted ? `Complete all line items first (${incompleteLineItemsCount} remaining)` : ""}
                      style={{ display: 'inline-block' }}
                    >
                      <button
                        type="button"
                        className="btn btn-success px-20 py-10 radius-8 d-flex align-items-center ms-3"
                        onClick={() => openActionModal("complete")}
                        disabled={loading || completeLoading || !allLineItemsCompleted}
                      >
                        <Icon icon="mdi:check-all" className="me-2" />
                        Complete
                        {!allLineItemsCompleted && incompleteLineItemsCount > 0 && (
                          <span className="badge bg-white text-warning-600 ms-2">{incompleteLineItemsCount}</span>
                        )}
                      </button>
                    </div>
                  </OperationControl>
                </>
              )}

              {/* Preview mode (before submit) */}
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

      {/* Status Action Modal */}
      <POStatusActionModal
        show={actionModal.show}
        onClose={closeActionModal}
        onConfirm={handleStatusAction}
        actionType={actionModal.actionType}
        loading={approveLoading || rejectLoading || cancelLoading || completeLoading || referBackLoading}
        poNumber={displayData.poNumber}
        lineItemName={actionModal.lineItem?.itemName}
      />
    </div>
  );
};

export default POPreviewDialog;
