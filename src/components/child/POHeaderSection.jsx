import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import AdvancedDatePicker from '../AdvancedDatePicker';

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
  termsConditions,
  loading
}) => {
  // State for terms & conditions dropdown
  const [showTermsDropdown, setShowTermsDropdown] = React.useState(false);
  const [termsSearch, setTermsSearch] = React.useState('');

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.po-form-dropdown')) {
        setShowTermsDropdown(false);
      }
    };

    if (showTermsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTermsDropdown]);

  // Filter terms & conditions based on search
  const filteredTermsConditions = React.useMemo(() => {
    if (!termsSearch) return termsConditions;
    return termsConditions.filter(term =>
      term.name.toLowerCase().includes(termsSearch.toLowerCase())
    );
  }, [termsConditions, termsSearch]);

  // Helper function to convert Date to YYYY-MM-DD string
  const formatDateForPicker = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  // Helper function to convert YYYY-MM-DD string to Date
  const parseDateFromPicker = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  // Get selected supplier
  const selectedSupplier = filteredSuppliers.find(supplier => supplier.id === formData.supplierId);
  
  // Get selected terms & conditions
  const selectedTerm = termsConditions.find(term => term.id === formData.termsConditionId);

  // Only show PO Number field if editing (i.e., poNo exists)
  return (
    <>
      {/* Header Section */}
      <div className="row gy-3 mb-2">
        {formData.poNo && (
          <div className="col-md-3">
            <label className="form-label">
              PO Number <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${errors.poNo ? "is-invalid" : ""}`}
              value={formData.poNo}
              readOnly
              disabled
              aria-label="Purchase Order Number"
              style={{ height: "40px" }}
            />
            {errors.poNo && <div className="invalid-feedback">{errors.poNo}</div>}
          </div>
        )}

        <div className="col-md-3">
          <label className="form-label">
            Supplier <span className="text-danger">*</span>
          </label>
          <div className="dropdown">
            <button
              className={`btn btn-sm ${
                formData.supplierId ? "btn-primary" : "btn-outline-secondary"
              } dropdown-toggle d-flex align-items-center gap-2 w-100`}
              type="button"
              data-bs-toggle="dropdown"
              style={{ borderColor: "#ced4da", height: "40px" }}
              disabled={loading}
            >
              <Icon
                icon="mdi:account-group"
                className="text-muted"
                style={{ height: "16px", width: "16px" }}
              />
              <span className="dropdown-label text-start flex-grow-1">
                {selectedSupplier ? (
                  <div className="d-flex align-items-center gap-2">
                    <div className="w-20-px h-20-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center">
                      <span className="text-primary-600 fw-semibold text-xs">
                        {selectedSupplier.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="fw-medium">{selectedSupplier.name}</div>
                      <small className="text-muted">
                        {selectedSupplier.code}
                      </small>
                    </div>
                  </div>
                ) : (
                  "Select Supplier"
                )}
              </span>
            </button>
            <ul className="dropdown-menu w-100" style={{ minWidth: "350px", maxHeight: "220px" }}>
              <li className="p-2">
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control form-control-sm pe-5"
                    placeholder="Search suppliers..."
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    onFocus={() => setShowSupplierDropdown(true)}
                  />
                  {supplierSearch && (
                    <button
                      type="button"
                      className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-1 p-0 border-0 bg-transparent d-flex align-items-center justify-content-center"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSupplierSearch('');
                      }}
                      style={{ width: '20px', height: '20px', right: '8px' }}
                      title="Clear search"
                    >
                      <Icon icon="mdi:close" className="text-muted" style={{ fontSize: '12px' }} />
                    </button>
                  )}
                </div>
              </li>
              <li style={{ maxHeight: "150px", paddingTop: "10px", overflowY: "auto" }}>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <button
                      key={supplier.id}
                      type="button"
                      className={`dropdown-item d-flex align-items-center gap-2 ${
                        formData.supplierId === supplier.id ? "active" : ""
                      } dropdown-item-content`}
                      onClick={(e) => {
                        e.preventDefault();
                        selectSupplier(supplier);
                        // Close dropdown by removing show class
                        e.currentTarget.closest('.dropdown').querySelector('.dropdown-toggle').click();
                      }}
                    >
                      <div className="w-24-px h-24-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center">
                        <span className="text-primary-600 fw-semibold text-xs">
                          {supplier.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-grow-1">
                        <div className="dropdown-item-text">{supplier.name}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="dropdown-item-text text-muted text-center py-3">
                    No suppliers found
                  </div>
                )}
              </li>
            </ul>
          </div>
          {errors.supplierId && (
            <div className="invalid-feedback d-block">{errors.supplierId}</div>
          )}
        </div>

        <div className="col-md-3">
          <label className="form-label">
            PO Date <span className="text-danger">*</span>
          </label>
          <AdvancedDatePicker
            value={formatDateForPicker(formData.poDate)}
            onChange={(dateString) =>
              handleInputChange("poDate", parseDateFromPicker(dateString))
            }
            placeholder="Select PO date"
            minDate={new Date()}
            className={`${errors.poDate ? "is-invalid" : ""}`}
            disabled={loading}
          />
          {errors.poDate && (
            <div className="invalid-feedback d-block">{errors.poDate}</div>
          )}
        </div>

        <div className="col-md-3">
          <label className="form-label">
            Expected Delivery Date <span className="text-danger">*</span>
          </label>
          <AdvancedDatePicker
            value={formatDateForPicker(formData.expectedDeliveryDate)}
            onChange={(dateString) =>
              handleInputChange(
                "expectedDeliveryDate",
                parseDateFromPicker(dateString)
              )
            }
            placeholder="Select delivery date"
            minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
            className={`${errors.expectedDeliveryDate ? "is-invalid" : ""}`}
            disabled={loading}
          />
          {errors.expectedDeliveryDate && (
            <div className="invalid-feedback d-block">
              {errors.expectedDeliveryDate}
            </div>
          )}
        </div>

        <div className="col-md-3">
          <label className="form-label">
            Terms & Conditions <span className="text-danger">*</span>
          </label>
          <div className="dropdown po-form-dropdown">
            <button
              className={`btn btn-sm ${
                formData.termsConditionId
                  ? "btn-primary"
                  : "btn-outline-secondary"
              } dropdown-toggle d-flex align-items-center gap-2 w-100 text-start`}
              type="button"
              onClick={() => setShowTermsDropdown(!showTermsDropdown)}
              style={{ borderColor: "#ced4da", height: "40px" }}
              disabled={loading}
            >
              <Icon
                icon="mdi:file-document-multiple"
                className="text-muted"
                style={{ height: "16px", width: "16px" }}
              />
              <span className="dropdown-label text-start flex-grow-1">
                {selectedTerm ? (
                  <div className="d-flex align-items-center gap-2">
                    <div className="w-24-px h-24-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center">
                      <Icon
                        icon="mdi:file-document"
                        className="text-primary-600"
                        style={{ height: "14px", width: "14px" }}
                      />
                    </div>
                    <div className="fw-medium">{selectedTerm.name}</div>
                  </div>
                ) : (
                  "Select terms and conditions"
                )}
              </span>
            </button>
            <ul className={`dropdown-menu w-100 ${showTermsDropdown ? "show" : ""}`} style={{ minWidth: "350px", maxHeight: "220px" }}>
              <li className="p-2">
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control form-control-sm pe-5"
                    placeholder="Search terms and conditions..."
                    value={termsSearch}
                    onChange={(e) => setTermsSearch(e.target.value)}
                    onFocus={() => setShowTermsDropdown(true)}
                    style={{ height: "32px" }}
                  />
                  {termsSearch && (
                    <button
                      type="button"
                      className="btn btn-sm position-absolute top-50 end-0 translate-middle-y me-1 p-0 border-0 bg-transparent d-flex align-items-center justify-content-center"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setTermsSearch('');
                      }}
                      style={{ width: '20px', height: '20px', right: '8px' }}
                      title="Clear search"
                    >
                      <Icon icon="mdi:close" className="text-muted" style={{ fontSize: '12px' }} />
                    </button>
                  )}
                </div>
              </li>
              <li style={{ maxHeight: "150px", paddingTop: "10px", overflowY: "auto" }}>
                {filteredTermsConditions.length > 0 ? (
                  filteredTermsConditions.map((term) => (
                    <button
                      key={term.id}
                      type="button"
                      className={`dropdown-item d-flex align-items-center gap-2 ${
                        formData.termsConditionId === term.id ? "active" : ""
                      } dropdown-item-content`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleInputChange("termsConditionId", term.id);
                        setShowTermsDropdown(false);
                      }}
                    >
                      <div className="w-24-px h-24-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center">
                        <Icon
                          icon="mdi:file-document"
                          className="text-primary-600"
                          style={{ height: "14px", width: "14px" }}
                        />
                      </div>
                      <span className="dropdown-item-text">{term.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="dropdown-item-text text-muted text-center py-3">
                    {termsSearch ? "No terms and conditions found matching your search" : "No terms and conditions found"}
                  </div>
                )}
              </li>
            </ul>
          </div>
          {errors.termsConditionId && (
            <div className="invalid-feedback d-block">
              {errors.termsConditionId}
            </div>
          )}
        </div>
      </div>

      {/* Remarks Section */}
      <div className="row gy-3 mb-4">
        <div className="col-12">
          <label className="form-label">Remarks</label>
          <textarea
            className={`form-control ${errors.remarks ? "is-invalid" : ""}`}
            rows="3"
            value={formData.remarks}
            onChange={(e) => handleInputChange("remarks", e.target.value)}
            placeholder="Additional notes or special instructions..."
            maxLength="500"
            aria-label="Purchase Order Remarks"
          />
          <div className="d-flex justify-content-between">
            <small
              className={`text-muted ${
                formData.remarks?.length > 450 ? "text-warning" : ""
              }`}
            >
              {formData.remarks?.length || 0}/500 characters
            </small>
            {errors.remarks && (
              <div className="invalid-feedback d-block">{errors.remarks}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default POHeaderSection;