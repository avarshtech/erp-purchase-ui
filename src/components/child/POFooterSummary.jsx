import React from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";

const POFooterSummary = ({ subtotal, tax, grandTotal }) => {
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
            <div className="d-flex justify-content-between align-items-center mb-12 pb-8 border-bottom border-dashed">
              <div className="d-flex align-items-center gap-2">
                <Icon icon="mdi:receipt-text-outline" className="text-secondary-light" width="16" height="16" />
                <span className="text-secondary-light text-sm">Subtotal</span>
              </div>
              <span className="text-sm fw-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="d-flex justify-content-between align-items-center mb-12 pb-8 border-bottom border-dashed">
              <div className="d-flex align-items-center gap-2">
                <Icon icon="mdi:percent-outline" className="text-secondary-light" width="16" height="16" />
                <span className="text-secondary-light text-sm">Total GST</span>
              </div>
              <span className="text-sm fw-medium">₹{tax.toFixed(2)}</span>
            </div>
            
            <div className="d-flex justify-content-between align-items-center p-12 rounded-2 mt-8 bg-primary-600">
              <div className="d-flex align-items-center gap-2">
                <Icon icon="mdi:currency-inr" className="text-white" width="18" height="18" />
                <span className="text-white fw-semibold">Grand Total</span>
              </div>
              <span className="text-white fw-bold fs-5">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POFooterSummary;