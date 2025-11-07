import React from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

const POLineItemsTable = ({
  lineItems,
  errors,
  openItemDropdown,
  setOpenItemDropdown,
  filteredItems,
  selectItem,
  handleLineItemChange,
  addLineItem,
  removeLineItem,
  uomOptions,
  taxOptions
}) => {
  return (
    <div className="row gy-3 mb-4">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">Line Items</h6>
          <button
            type="button"
            className="btn btn-primary btn-sm d-inline-flex align-items-center justify-content-center"
            onClick={addLineItem}
            aria-label="Add new line item"
          >
            <Icon icon="mdi:plus" className="me-1" />
            Add Item
          </button>
        </div>

        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="table table-bordered" style={{ minWidth: '1000px' }}>
            <thead className="table-header-custom">
              <tr>
                <th style={{ width: '180px', minWidth: '180px' }} className="text-center">Item</th>
                <th style={{ width: '200px', minWidth: '200px' }} className="text-center">Description</th>
                <th style={{ width: '70px', minWidth: '70px' }} className="text-center">Qty</th>
                <th style={{ width: '80px', minWidth: '80px' }} className="text-center">UOM</th>
                <th style={{ width: '90px', minWidth: '90px' }} className="text-center">Unit Price</th>
                <th style={{ width: '70px', minWidth: '70px' }} className="text-center">SGST %</th>
                <th style={{ width: '70px', minWidth: '70px' }} className="text-center">CGST %</th>
                <th style={{ width: '90px', minWidth: '90px' }} className="text-center">Amount</th>
                <th style={{ width: '60px', minWidth: '60px' }} className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <div className="position-relative">
                      <input
                        type="text"
                        className={`form-control form-control-sm ${errors[`item_${index}`] ? 'is-invalid' : ''}`}
                        placeholder="Click to select item..."
                        value={item.itemId ? filteredItems.find(filteredItem => filteredItem.id === parseInt(item.itemId))?.name || '' : ''}
                        onChange={() => {}}
                        onFocus={() => setOpenItemDropdown(item.id)}
                        onBlur={() => setTimeout(() => setOpenItemDropdown(null), 200)}
                        aria-label={`Select item for line ${index + 1}`}
                        autoComplete="off"
                        readOnly
                      />
                      <Icon icon="mdi:chevron-down" className="position-absolute top-50 end-0 translate-middle-y me-2" style={{ fontSize: '14px' }} />
                      {openItemDropdown === item.id && (
                        <div className="dropdown-menu show position-absolute top-100 left-0 right-0 bg-white border rounded shadow-sm" style={{ maxHeight: '150px', overflowY: 'auto', zIndex: 1000 }}>
                          {filteredItems.map(filteredItem => (
                            <div
                              key={filteredItem.id}
                              className="dropdown-item p-2 cursor-pointer"
                              onClick={() => selectItem(filteredItem.id, item.id)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && selectItem(filteredItem.id, item.id)}
                            >
                              <div className="fw-bold">{filteredItem.name}</div>
                              <small className="text-muted">{filteredItem.code} • ${filteredItem.unitPrice}</small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors[`item_${index}`] && <div className="invalid-feedback d-block" style={{ fontSize: '12px' }}>{errors[`item_${index}`]}</div>}
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                      aria-label={`Description for line ${index + 1}`}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className={`form-control form-control-sm ${errors[`qty_${index}`] ? 'is-invalid' : ''}`}
                      value={item.qty}
                      onChange={(e) => handleLineItemChange(item.id, 'qty', parseInt(e.target.value) || 1)}
                      min="1"
                      aria-label={`Quantity for line ${index + 1}`}
                    />
                    {errors[`qty_${index}`] && <div className="invalid-feedback d-block" style={{ fontSize: '12px' }}>{errors[`qty_${index}`]}</div>}
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.uom}
                      onChange={(e) => handleLineItemChange(item.id, 'uom', e.target.value)}
                      aria-label={`Unit of measure for line ${index + 1}`}
                    >
                      {uomOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className={`form-control form-control-sm ${errors[`unitPrice_${index}`] ? 'is-invalid' : ''}`}
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      aria-label={`Unit price for line ${index + 1}`}
                    />
                    {errors[`unitPrice_${index}`] && <div className="invalid-feedback d-block" style={{ fontSize: '12px' }}>{errors[`unitPrice_${index}`]}</div>}
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.sgstPercent}
                      onChange={(e) => handleLineItemChange(item.id, 'sgstPercent', parseInt(e.target.value))}
                      aria-label={`SGST percentage for line ${index + 1}`}
                    >
                      {taxOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.cgstPercent}
                      onChange={(e) => handleLineItemChange(item.id, 'cgstPercent', parseInt(e.target.value))}
                      aria-label={`CGST percentage for line ${index + 1}`}
                    >
                      {taxOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={item.amount.toFixed(2)}
                      readOnly
                      aria-label={`Amount for line ${index + 1}`}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      aria-label={`Remove line ${index + 1}`}
                    >
                      <Icon icon="mdi:delete" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {errors.lineItems && <div className="text-danger mt-2" style={{ fontSize: '14px' }}>{errors.lineItems}</div>}
      </div>
    </div>
  );
};

export default POLineItemsTable;