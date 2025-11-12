import React from 'react';

const POFooterSummary = ({ subtotal, tax, grandTotal }) => {
  return (
    <div className="row gy-3 mb-4" style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
      <div className="col-md-4">
        <div className="border rounded p-3 bg-light text-dark">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-body">Subtotal:</span>
            <span className="text-body">${subtotal.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span className="text-body">Tax:</span>
            <span className="text-body">${tax.toFixed(2)}</span>
          </div>
          <hr className="my-2 border-secondary" />
          <div className="d-flex justify-content-between fw-bold fs-5">
            <span className="text-body">Grand Total:</span>
            <span className="text-body fw-bold">${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POFooterSummary;