import React from 'react';

const POFooterSummary = ({ subtotal, tax, grandTotal }) => {
  return (
    <div className="row gy-3 mb-4">
      <div className="col-md-8"></div>
      <div className="col-md-4">
        <div className="border rounded p-3 bg-light text-dark">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-dark">Subtotal:</span>
            <span className="text-dark">${subtotal.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-dark">Tax:</span>
            <span className="text-dark">${tax.toFixed(2)}</span>
          </div>
          <hr className="my-2 border-secondary" />
          <div className="d-flex justify-content-between fw-bold fs-5">
            <span className="text-dark">Grand Total:</span>
            <span className="text-dark">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POFooterSummary;