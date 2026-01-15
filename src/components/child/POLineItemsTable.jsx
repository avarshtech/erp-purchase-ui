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

        <div className="table-responsive" style={{ overflowX: "auto" }}>
          <table
            className="table table-bordered"
            style={{ minWidth: "1000px" }}
          >
            <thead className="table-header-custom">
              <tr>
                <th
                  style={{ width: "180px", minWidth: "180px" }}
                  className="text-center"
                >
                  Item
                </th>
                <th
                  style={{ width: "200px", minWidth: "200px" }}
                  className="text-center"
                >
                  Description
                </th>
                <th
                  style={{ width: "120px", minWidth: "120px" }}
                  className="text-center"
                >
                  Qty
                </th>
                <th
                  style={{ width: "106px", minWidth: "106px" }}
                  className="text-center"
                >
                  UOM
                </th>
                <th
                  style={{ width: "140px", minWidth: "140px" }}
                  className="text-center"
                >
                  Unit Price
                </th>
                <th
                  style={{ width: "75px", minWidth: "75px" }}
                  className="text-center"
                >
                  SGST %
                </th>
                <th
                  style={{ width: "75px", minWidth: "75px" }}
                  className="text-center"
                >
                  CGST %
                </th>
                <th
                  style={{ width: "90px", minWidth: "90px" }}
                  className="text-center"
                >
                  Amount
                </th>
                <th
                  style={{ width: "60px", minWidth: "60px" }}
                  className="text-center"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.itemId || ""}
                      onChange={(e) =>
                        selectItem(parseInt(e.target.value), item.id)
                      }
                      aria-label={`Select item for line ${index + 1}`}
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
                        style={{ fontSize: "12px" }}
                      >
                        {errors[`item_${index}`]}
                      </div>
                    )}
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Enter Description"
                      value={item.description}
                      onChange={(e) =>
                        handleLineItemChange(
                          item.id,
                          "description",
                          e.target.value
                        )
                      }
                      aria-label={`Description for line ${index + 1}`}
                    />
                  </td>
                  <td>
                    <div className="input-group input-group-sm">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          handleLineItemChange(
                            item.id,
                            "qty",
                            Math.max(1, (item.qty || 1) - 1)
                          )
                        }
                        aria-label={`Decrease quantity for line ${index + 1}`}
                      >
                        <Icon icon="mdi:minus" />
                      </button>
                      <input
                        type="number"
                        className={`form-control form-control-sm text-center ${
                          errors[`qty_${index}`] ? "is-invalid" : ""
                        }`}
                        value={item.qty || 1}
                        onChange={(e) =>
                          handleLineItemChange(
                            item.id,
                            "qty",
                            parseInt(e.target.value) || 1
                          )
                        }
                        min="1"
                        style={{ minWidth: "50px" }}
                        aria-label={`Quantity for line ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          handleLineItemChange(
                            item.id,
                            "qty",
                            (item.qty || 1) + 1
                          )
                        }
                        aria-label={`Increase quantity for line ${index + 1}`}
                      >
                        <Icon icon="mdi:plus" />
                      </button>
                    </div>
                    {errors[`qty_${index}`] && (
                      <div
                        className="invalid-feedback d-block"
                        style={{ fontSize: "12px" }}
                      >
                        {errors[`qty_${index}`]}
                      </div>
                    )}
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={item.uom || ""}
                      readOnly
                      disabled
                      aria-label={`Unit of measure for line ${index + 1}`}
                    />
                  </td>
                  <td>
                    <div className="input-group input-group-sm">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          handleLineItemChange(
                            item.id,
                            "unitPrice",
                            Math.max(0, parseFloat(((item.unitPrice || 0) - 1).toFixed(2)))
                          )
                        }
                        aria-label={`Decrease unit price for line ${index + 1}`}
                      >
                        <Icon icon="mdi:minus" />
                      </button>
                      <input
                        type="number"
                        className={`form-control form-control-sm text-center ${
                          errors[`unitPrice_${index}`] ? "is-invalid" : ""
                        }`}
                        value={item.unitPrice || 0}
                        onChange={(e) =>
                          handleLineItemChange(
                            item.id,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        step="0.01"
                        style={{ minWidth: "60px" }}
                        aria-label={`Unit price for line ${index + 1}`}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          handleLineItemChange(
                            item.id,
                            "unitPrice",
                            parseFloat(((item.unitPrice || 0) + 1).toFixed(2))
                          )
                        }
                        aria-label={`Increase unit price for line ${index + 1}`}
                      >
                        <Icon icon="mdi:plus" />
                      </button>
                    </div>
                    {errors[`unitPrice_${index}`] && (
                      <div
                        className="invalid-feedback d-block"
                        style={{ fontSize: "12px" }}
                      >
                        {errors[`unitPrice_${index}`]}
                      </div>
                    )}
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.sgstPercent}
                      onChange={(e) =>
                        handleLineItemChange(
                          item.id,
                          "sgstPercent",
                          parseInt(e.target.value)
                        )
                      }
                      aria-label={`SGST percentage for line ${index + 1}`}
                    >
                      {taxOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.cgstPercent}
                      onChange={(e) =>
                        handleLineItemChange(
                          item.id,
                          "cgstPercent",
                          parseInt(e.target.value)
                        )
                      }
                      aria-label={`CGST percentage for line ${index + 1}`}
                    >
                      {taxOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm text-end"
                      value={`₹${(item.amount || 0).toFixed(2)}`}
                      readOnly
                      disabled
                      aria-label={`Amount for line ${index + 1}`}
                    />
                  </td>
                  <td className="text-center">
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
        {errors.lineItems && (
          <div className="text-danger mt-2" style={{ fontSize: "14px" }}>
            {errors.lineItems}
          </div>
        )}
      </div>
    </div>
  );
};

export default POLineItemsTable;
