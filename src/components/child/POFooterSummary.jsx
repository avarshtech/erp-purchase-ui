import React, { useMemo } from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";

const POFooterSummary = ({ subtotal = 0, sgst = 0, cgst = 0, igst = 0, grandTotal = 0, lineItems = [], isIgstApplicable = false }) => {
  // Compute GST breakup grouped by GST percentage
  const gstBreakup = useMemo(() => {
    const groups = {};

    lineItems.forEach((item) => {
      const qty = parseFloat(item.qty || item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const base = qty * unitPrice;

      // Determine gst percent - prefer gstPercent, fallback to sgst+cgst or igst
      let gstPercent = 0;
      if (item.gstPercent !== undefined && item.gstPercent !== null) {
        gstPercent = parseFloat(item.gstPercent) || 0;
      } else if (isIgstApplicable) {
        gstPercent = parseFloat(item.igstPercent ?? item.igst ?? 0) || 0;
      } else {
        gstPercent =
          (parseFloat(item.sgstPercent ?? item.sgst ?? 0) || 0) +
          (parseFloat(item.cgstPercent ?? item.cgst ?? 0) || 0);
      }

      if (gstPercent === 0) return; // skip 0% GST items from breakup

      const gstAmount = (base * gstPercent) / 100;

      if (!groups[gstPercent]) {
        groups[gstPercent] = { igst: 0, sgst: 0, cgst: 0, taxableAmount: 0 };
      }

      if (isIgstApplicable) {
        groups[gstPercent].igst += gstAmount;
      } else {
        groups[gstPercent].sgst += gstAmount / 2;
        groups[gstPercent].cgst += gstAmount / 2;
      }
      groups[gstPercent].taxableAmount += base;
    });

    // Sort by GST % ascending and convert to array
    return Object.entries(groups)
      .map(([pct, vals]) => ({
        percent: parseFloat(pct),
        igst: vals.igst,
        sgst: vals.sgst,
        cgst: vals.cgst,
        taxableAmount: vals.taxableAmount,
      }))
      .sort((a, b) => a.percent - b.percent);
  }, [lineItems, isIgstApplicable]);

  // Compute totals from breakup (or use passed props as fallback)
  const computedIgst = gstBreakup.reduce((s, g) => s + g.igst, 0);
  const computedSgst = gstBreakup.reduce((s, g) => s + g.sgst, 0);
  const computedCgst = gstBreakup.reduce((s, g) => s + g.cgst, 0);
  
  const totalIgst = gstBreakup.length > 0 ? computedIgst : igst;
  const totalSgst = gstBreakup.length > 0 ? computedSgst : sgst;
  const totalCgst = gstBreakup.length > 0 ? computedCgst : cgst;
  
  const computedGrandTotal = isIgstApplicable 
    ? subtotal + totalIgst 
    : subtotal + totalSgst + totalCgst;
  const finalGrandTotal = gstBreakup.length > 0 ? computedGrandTotal : grandTotal;

  return (
    <div className="row gy-2 mb-2" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
      <div className="col-md-5 col-lg-4">
        <div 
          className="rounded-3 overflow-hidden bg-base border border-neutral-200"
          style={{ 
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          }}
        >
          {/* Header */}
          <div className="px-16 py-10 bg-primary-600">
            <div className="d-flex align-items-center gap-2">
              <Icon icon="mdi:calculator" className="text-white" width="18" height="18" />
              <span className="text-white fw-semibold text-sm">Order Summary</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-16">
            {/* Subtotal */}
            <div className="d-flex justify-content-between align-items-center mb-12 pb-8 border-bottom border-dashed">
              <div className="d-flex align-items-center gap-2">
                <Icon icon="mdi:receipt-text-outline" className="text-secondary-light" width="16" height="16" />
                <span className="text-secondary-light text-sm">Subtotal</span>
              </div>
              <span className="text-sm fw-medium">₹ {subtotal.toFixed(2)}</span>
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
                    {isIgstApplicable ? (
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
            {isIgstApplicable ? (
              <div className="d-flex justify-content-between align-items-center mb-12 pb-8 border-bottom border-dashed">
                <div className="d-flex align-items-center gap-2">
                  <Icon icon="mdi:percent-outline" className="text-secondary-light" width="16" height="16" />
                  <span className="text-secondary-light text-sm">Total IGST</span>
                </div>
                <span className="text-sm fw-medium">₹ {totalIgst.toFixed(2)}</span>
              </div>
            ) : (
              <>
                {/* Total SGST */}
                <div className="d-flex justify-content-between align-items-center mb-8 pb-6 border-bottom border-dashed">
                  <div className="d-flex align-items-center gap-2">
                    <Icon icon="mdi:percent-outline" className="text-secondary-light" width="16" height="16" />
                    <span className="text-secondary-light text-sm">Total SGST</span>
                  </div>
                  <span className="text-sm fw-medium">₹ {totalSgst.toFixed(2)}</span>
                </div>

                {/* Total CGST */}
                <div className="d-flex justify-content-between align-items-center mb-12 pb-8 border-bottom border-dashed">
                  <div className="d-flex align-items-center gap-2">
                    <Icon icon="mdi:percent-outline" className="text-secondary-light" width="16" height="16" />
                    <span className="text-secondary-light text-sm">Total CGST</span>
                  </div>
                  <span className="text-sm fw-medium">₹ {totalCgst.toFixed(2)}</span>
                </div>
              </>
            )}
            
            {/* Grand Total */}
            <div className="d-flex justify-content-between align-items-center p-12 rounded-2 mt-8 bg-primary-600">
              <div className="d-flex align-items-center gap-2">
                <Icon icon="mdi:currency-inr" className="text-white" width="18" height="18" />
                <span className="text-white fw-semibold">Grand Total</span>
              </div>
              <span className="text-white fw-bold fs-5">₹ {finalGrandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POFooterSummary;