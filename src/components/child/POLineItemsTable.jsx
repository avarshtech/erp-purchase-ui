import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const POLineItemsTable = ({
  lineItems,
  errors,
  filteredItems,
  selectItem,
  handleLineItemChange,
  addLineItem,
  removeLineItem,
  taxOptions,
  loading,
}) => {
  // Calculate GST value for a line item
  const calculateGstValue = (item) => {
    const baseAmount = (item.qty || 0) * (item.unitPrice || 0);
    const gstPercent = item.gstPercent || 0;
    return (baseAmount * gstPercent) / 100;
  };

  // Handle quantity input - only allow positive integers
  const handleQtyChange = (itemId, value) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      handleLineItemChange(itemId, "qty", '');
      return;
    }
    
    const parsedValue = parseInt(numericValue, 10);
    
    // Don't allow 0
    if (parsedValue === 0) {
      return;
    }
    
    handleLineItemChange(itemId, "qty", parsedValue);
  };

  // Handle unit price input - only allow numbers with up to 2 decimal places
  const handleUnitPriceChange = (itemId, value) => {
    // Allow empty value
    if (value === '') {
      handleLineItemChange(itemId, "unitPrice", '');
      return;
    }
    
    // Remove any non-numeric characters except decimal point
    let cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + '.' + parts[1].slice(0, 2);
    }
    
    handleLineItemChange(itemId, "unitPrice", cleanValue);
  };

  // Validate unit price on blur
  const handleUnitPriceBlur = (itemId, value) => {
    if (value === '' || value === undefined) {
      return;
    }
    
    const numericValue = parseFloat(value);
    
    if (isNaN(numericValue) || numericValue < 0.01) {
      // Set to empty if invalid
      handleLineItemChange(itemId, "unitPrice", '');
    } else {
      // Format to 2 decimal places
      handleLineItemChange(itemId, "unitPrice", parseFloat(numericValue.toFixed(2)));
    }
  };

  return (
    <div className="row gy-2 mb-2">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 fw-semibold">Line Items</h6>
          <button
            type="button"
            className="btn btn-primary btn-sm d-inline-flex align-items-center justify-content-center"
            onClick={addLineItem}
            aria-label="Add new line item"
            disabled={loading}
          >
            <Icon icon="mdi:plus" className="me-1" />
            Add Item
          </button>
        </div>

        <div className="table-responsive rounded border" style={{ overflowX: "auto" }}>
          <table
            className="table table-bordered table-hover mb-0"
            style={{ minWidth: "900px" }}
          >
            <thead style={{ backgroundColor: "var(--primary-color, #487fff)" }}>
              <tr>
                <th
                  style={{ width: "200px", minWidth: "200px" }}
                  className="text-center fw-semibold text-sm py-12 border-0"
                >
                  Item
                </th>
                <th
                  style={{ width: "180px", minWidth: "180px" }}
                  className="text-center fw-semibold text-sm py-12 border-0"
                >
                  Description
                </th>
                <th
                  style={{ width: "80px", minWidth: "80px" }}
                  className="text-center fw-semibold text-sm py-12 border-0"
                >
                  Qty
                </th>
                <th
                  style={{ width: "70px", minWidth: "70px" }}
                  className="text-center fw-semibold text-sm py-12 border-0"
                >
                  UOM
                </th>
                <th
                  style={{ width: "120px", minWidth: "120px" }}
                  className="text-center fw-semibold text-sm py-12 border-0"
                >
                  Unit Price
                </th>
                <th
                  style={{ width: "90px", minWidth: "90px" }}
                  className="text-center fw-semibold text-sm py-12 border-0"
                >
                  GST %
                </th>
                <th
                  style={{ width: "100px", minWidth: "100px" }}
                  className="text-center fw-semibold text-sm py-12 border-0"
                >
                  GST Value
                </th>
                <th
                  style={{ width: "110px", minWidth: "110px" }}
                  className="text-center fw-semibold text-sm py-12 border-0"
                >
                  Amount
                </th>
                <th
                  style={{ width: "50px", minWidth: "50px" }}
                  className="text-center fw-semibold text-sm py-12 border-0"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => {
                const gstValue = calculateGstValue(item);
                return (
                  <tr key={item.id}>
                    <td className="py-2">
                      <select
                        className={`form-select form-select-sm ${errors[`item_${index}`] ? "is-invalid" : ""}`}
                        value={item.itemId || ""}
                        onChange={(e) =>
                          selectItem(parseInt(e.target.value), item.id)
                        }
                        aria-label={`Select item for line ${index + 1}`}
                        disabled={loading}
                      >
                        <option value="">Select an item...</option>
                        {filteredItems.map((filteredItem) => (
                          <option key={filteredItem.id} value={filteredItem.id}>
                            {filteredItem.itemCode} - {filteredItem.itemName}
                          </option>
                        ))}
                      </select>
                      {errors[`item_${index}`] && (
                        <div
                          className="invalid-feedback d-block"
                          style={{ fontSize: "11px" }}
                        >
                          {errors[`item_${index}`]}
                        </div>
                      )}
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          handleLineItemChange(
                            item.id,
                            "description",
                            e.target.value
                          )
                        }
                        aria-label={`Description for line ${index + 1}`}
                        disabled={loading}
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        className={`form-control form-control-sm text-center ${
                          errors[`qty_${index}`] ? "is-invalid" : ""
                        }`}
                        value={item.qty === '' ? '' : (item.qty || '')}
                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                        placeholder=""
                        aria-label={`Quantity for line ${index + 1}`}
                        disabled={loading}
                      />
                      {errors[`qty_${index}`] && (
                        <div
                          className="invalid-feedback d-block"
                          style={{ fontSize: "11px" }}
                        >
                          {errors[`qty_${index}`]}
                        </div>
                      )}
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        className="form-control form-control-sm text-center bg-light"
                        value={(item.uom || "").toUpperCase()}
                        readOnly
                        disabled
                        aria-label={`Unit of measure for line ${index + 1}`}
                      />
                    </td>
                    <td className="py-2" style={{ position: "relative" }}>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light border-end-0">₹</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          className={`form-control form-control-sm text-end border-start-0 ${
                            errors[`unitPrice_${index}`] ? "is-invalid" : ""
                          }`}
                          value={item.unitPrice === '' ? '' : (item.unitPrice || '')}
                          onChange={(e) => handleUnitPriceChange(item.id, e.target.value)}
                          onBlur={(e) => handleUnitPriceBlur(item.id, e.target.value)}
                          placeholder="0.00"
                          aria-label={`Unit price for line ${index + 1}`}
                          disabled={loading}
                        />
                      </div>
                      {errors[`unitPrice_${index}`] && (
                        <div
                          className="invalid-feedback d-block"
                          style={{ fontSize: "10px", whiteSpace: "nowrap", position: "absolute", left: 0, right: 0 }}
                        >
                          {errors[`unitPrice_${index}`]}
                        </div>
                      )}
                    </td>
                    <td className="py-2">
                      <select
                        className="form-select form-select-sm"
                        value={item.gstPercent || 0}
                        onChange={(e) =>
                          handleLineItemChange(
                            item.id,
                            "gstPercent",
                            parseInt(e.target.value)
                          )
                        }
                        aria-label={`GST percentage for line ${index + 1}`}
                        disabled={loading}
                      >
                        {taxOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        className="form-control form-control-sm text-end bg-light"
                        value={`₹${gstValue.toFixed(2)}`}
                        readOnly
                        disabled
                        aria-label={`GST value for line ${index + 1}`}
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        className="form-control form-control-sm text-end bg-light fw-medium"
                        value={`₹${(item.amount || 0).toFixed(2)}`}
                        readOnly
                        disabled
                        aria-label={`Amount for line ${index + 1}`}
                      />
                    </td>
                    <td className="text-center py-2">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1 || loading}
                        aria-label={`Remove line ${index + 1}`}
                        title="Remove item"
                      >
                        <Icon icon="mdi:delete-outline" width="16" height="16" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {errors.lineItems && (
          <div className="text-danger mt-2" style={{ fontSize: "13px" }}>
            <Icon icon="mdi:alert-circle-outline" className="me-1" />
            {errors.lineItems}
          </div>
        )}
      </div>
    </div>
  );
};

export default POLineItemsTable;
