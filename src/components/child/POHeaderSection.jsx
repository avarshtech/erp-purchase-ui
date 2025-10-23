import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const POHeaderSection = ({
  formData,
  errors,
  supplierSearch,
  setSupplierSearch,
  showSupplierDropdown,
  setShowSupplierDropdown,
  filteredSuppliers,
  selectSupplier,
  handleInputChange,
  termsConditions
}) => {
  return (
    <>
      {/* Header Section */}
      <div className="row gy-3 mb-4">
        <div className="col-md-3">
          <label className="form-label">PO Number <span className="text-danger">*</span></label>
          <input
            type="text"
            className={`form-control ${errors.poNo ? 'is-invalid' : ''}`}
            value={formData.poNo}
            onChange={(e) => handleInputChange('poNo', e.target.value)}
            readOnly
            aria-label="Purchase Order Number"
          />
          {errors.poNo && <div className="invalid-feedback">{errors.poNo}</div>}
        </div>

        <div className="col-md-3">
          <label className="form-label">Supplier <span className="text-danger">*</span></label>
          <div className="position-relative">
            <input
              type="text"
              className={`form-control ${errors.supplierId ? 'is-invalid' : ''}`}
              placeholder="Search supplier..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              onFocus={() => setShowSupplierDropdown(true)}
              onBlur={() => setTimeout(() => setShowSupplierDropdown(false), 200)}
              aria-label="Search and select supplier"
              autoComplete="off"
            />
            <Icon icon="mdi:chevron-down" className="position-absolute top-50 end-0 translate-middle-y me-3" />
            {showSupplierDropdown && (
              <div className="dropdown-menu show position-absolute top-100 left-0 right-0 bg-white border rounded shadow-sm" style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}>
                {filteredSuppliers.map(supplier => (
                  <div
                    key={supplier.id}
                    className="dropdown-item p-2 cursor-pointer"
                    onClick={() => selectSupplier(supplier)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && selectSupplier(supplier)}
                  >
                    <div className="fw-bold">{supplier.name}</div>
                    <small className="text-muted">{supplier.code} • {supplier.contact}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
          {errors.supplierId && <div className="invalid-feedback d-block">{errors.supplierId}</div>}
        </div>

        <div className="col-md-3">
          <label className="form-label">PO Date <span className="text-danger">*</span></label>
          <div className="datepicker-wrapper">
            <DatePicker
              selected={formData.poDate}
              onChange={(date) => handleInputChange('poDate', date)}
              className={`form-control ${errors.poDate ? 'is-invalid' : ''}`}
              dateFormat="dd MMM yyyy"
              minDate={new Date()}
              ariaLabel="Purchase Order Date"
              wrapperClassName="w-100"
            />
          </div>
          {errors.poDate && <div className="invalid-feedback d-block">{errors.poDate}</div>}
        </div>

        <div className="col-md-3">
          <label className="form-label">Expected Delivery Date <span className="text-danger">*</span></label>
          <div className="datepicker-wrapper">
            <DatePicker
              selected={formData.expectedDeliveryDate}
              onChange={(date) => handleInputChange('expectedDeliveryDate', date)}
              className={`form-control ${errors.expectedDeliveryDate ? 'is-invalid' : ''}`}
              dateFormat="dd MMM yyyy"
              minDate={formData.poDate || new Date()}
              ariaLabel="Expected Delivery Date"
              wrapperClassName="w-100"
            />
          </div>
          {errors.expectedDeliveryDate && <div className="invalid-feedback d-block">{errors.expectedDeliveryDate}</div>}
        </div>

        <div className="col-md-3">
          <label className="form-label">Terms & Conditions</label>
          <select
            className={`form-select ${errors.termsConditionId ? 'is-invalid' : ''}`}
            value={formData.termsConditionId}
            onChange={(e) => handleInputChange('termsConditionId', e.target.value)}
            aria-label="Select Terms and Conditions"
          >
            <option value="">Select terms and conditions...</option>
            {termsConditions.map(term => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
          {errors.termsConditionId && <div className="invalid-feedback d-block">{errors.termsConditionId}</div>}
        </div>
      </div>

      {/* Remarks Section */}
      <div className="row gy-3 mb-4">
        <div className="col-12">
          <label className="form-label">Remarks</label>
          <textarea
            className={`form-control ${errors.remarks ? 'is-invalid' : ''}`}
            rows="3"
            value={formData.remarks}
            onChange={(e) => handleInputChange('remarks', e.target.value)}
            placeholder="Additional notes or special instructions..."
            maxLength="500"
            aria-label="Purchase Order Remarks"
          />
          <div className="d-flex justify-content-between">
            <small className={`text-muted ${formData.remarks?.length > 450 ? 'text-warning' : ''}`}>
              {formData.remarks?.length || 0}/500 characters
            </small>
            {errors.remarks && <div className="invalid-feedback d-block">{errors.remarks}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default POHeaderSection;