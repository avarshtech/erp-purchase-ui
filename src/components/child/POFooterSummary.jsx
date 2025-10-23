import React from 'react';

const POFooterSummary = ({ subtotal, tax, grandTotal }) => {
  return (
    <div className="row gy-3 mb-4">
      <div className="col-md-8"></div>
      <div className="col-md-4">
        <div className="border rounded p-3 bg-light">
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Tax:</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <hr className="my-2" />
          <div className="d-flex justify-content-between fw-bold fs-5">
            <span>Grand Total:</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POFooterSummary;