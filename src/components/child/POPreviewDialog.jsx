import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const POPreviewDialog = ({
  show,
  onClose,
  onSubmit,
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
  if (!show) return null;

  // Determine data source based on mode
  const isViewMode = viewMode && poData;
  
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

  // Get display values based on mode
  const getDisplayData = () => {
    if (isViewMode) {
      // View mode - use poData directly from table
      const displayLineItems = poData.lineItems || [];
      const subtotal = displayLineItems.reduce(
        (sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)),
        0
      );
      const totalTax = displayLineItems.reduce((sum, item) => {
        const gstPercent = (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0);
        return sum + (((item.quantity || 0) * (item.unitPrice || 0)) * gstPercent) / 100;
      }, 0);
      
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
          description: item.description || item.itemName || "No description",
          qty: item.quantity || 0,
          uom: item.uomName || "",
          unitPrice: item.unitPrice || 0,
          gstPercent: (item.cgst || 0) + (item.sgst || 0) + (item.igst || 0),
        })),
        totals: {
          subtotal: poData.subtotal || subtotal,
          tax: poData.taxAmount || totalTax,
          grandTotal: poData.grandTotal || (subtotal + totalTax),
        },
      };
    } else {
      // Preview mode - use formData and props
      const selectedSupplier = suppliers?.find((s) => s.id === formData?.supplierId);
      const selectedTerms = termsConditions?.find(
        (tc) => tc.id === parseInt(formData?.termsConditionId)
      );
      
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
          description: item.description || "No description",
          qty: item.qty || 0,
          uom: item.uom || "",
          unitPrice: item.unitPrice || 0,
          gstPercent: item.gstPercent || 0,
        })),
        totals: totals || { subtotal: 0, tax: 0, grandTotal: 0 },
      };
    }
  };

  const displayData = getDisplayData();

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
      <div
        className="modal-dialog"
        style={{ maxWidth: "900px", width: "90%", maxHeight: "90vh" }}
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
                icon={isViewMode ? "mdi:file-document-outline" : "mdi:file-document-check-outline"}
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
                          className={`ms-3 px-12 py-4 rounded-pill fw-bold text-xs ${getStatusBadgeClass(displayData.status)}`}
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
                    className={`ms-3 px-12 py-4 rounded-pill fw-bold text-xs ${getStatusBadgeClass(displayData.status)}`}
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
                      <div className="fw-semibold">
                        {displayData.poDate}
                      </div>
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
                        <div className="fw-medium">
                          {displayData.remarks}
                        </div>
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
                  const gstAmount =
                    (baseAmount * (item.gstPercent || 0)) / 100;
                  const totalAmount = baseAmount + gstAmount;

                  return (
                    <div
                      key={item.id || index}
                      className="rounded-3 border border-neutral-200 overflow-hidden"
                    >
                      {/* Item Header */}
                      <div className="d-flex align-items-center justify-content-between px-16 py-10 bg-primary-50 border-bottom border-neutral-200">
                        <div className="d-flex align-items-center gap-2">
                          <span className="d-flex align-items-center justify-content-center bg-primary-600 text-white rounded-circle fw-semibold" style={{ width: "24px", height: "24px", fontSize: "12px" }}>
                            {index + 1}
                          </span>
                          <span className="fw-semibold text-primary-600">
                            {item.description || "No description"}
                          </span>
                        </div>
                        <span className="fw-bold text-primary-600 fs-6">
                          ₹{totalAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Item Details */}
                      <div className="p-16">
                        <div className="row g-3">
                          <div className="col-6 col-md-3">
                            <div className="text-secondary-light text-xs mb-1">Quantity</div>
                            <div className="fw-medium">{item.qty || 0} <span className="text-secondary-light text-uppercase">{item.uom || ""}</span></div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="text-secondary-light text-xs mb-1">Unit Price</div>
                            <div className="fw-medium">₹{parseFloat(item.unitPrice || 0).toFixed(2)}</div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="text-secondary-light text-xs mb-1">GST ({item.gstPercent || 0}%)</div>
                            <div className="fw-medium">₹{gstAmount.toFixed(2)}</div>
                          </div>
                          <div className="col-6 col-md-3">
                            <div className="text-secondary-light text-xs mb-1">Base Amount</div>
                            <div className="fw-medium">₹{baseAmount.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary Section */}
            <div className="d-flex justify-content-end">
              <div
                className="rounded-3 overflow-hidden bg-base border border-neutral-200"
                style={{
                  width: "320px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
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
                    <span className="text-secondary-light text-sm">Subtotal</span>
                    <span className="text-sm fw-medium">
                      ₹{displayData.totals.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-12 pb-8 border-bottom border-dashed">
                    <span className="text-secondary-light text-sm">Total GST</span>
                    <span className="text-sm fw-medium">
                      ₹{displayData.totals.tax.toFixed(2)}
                    </span>
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
              className="btn btn-outline-secondary px-24 py-10 radius-8"
              onClick={onClose}
              disabled={loading}
            >
              <Icon icon="mdi:close" className="me-2" />
              {isViewMode ? "Close" : "Cancel"}
            </button>
            {!isViewMode && (
              <button
                type="button"
                className="btn btn-primary px-24 py-10 radius-8"
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
