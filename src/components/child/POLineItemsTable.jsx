import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { searchItems } from "../../services/ItemMaster";
import { getColorHex, isColorAttribute } from "../../utils/colorConstants";

// Render color swatch inline
const ColorSwatch = ({ colorName, size = 14 }) => {
  const hex = getColorHex(colorName);
  if (!hex) return null;
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "3px",
        backgroundColor: hex,
        border: "1px solid rgba(0,0,0,0.15)",
        flexShrink: 0,
        marginRight: 4,
        verticalAlign: "middle",
      }}
      title={colorName}
    />
  );
};

const POLineItemsTable = ({
  lineItems,
  errors,
  filteredItems,
  itemsMaster = [],
  selectItem,
  handleLineItemChange,
  addLineItem,
  removeLineItem,
  taxOptions,
  loading,
  isIgstApplicable = false,
  onChangeVariant,
  itemsWithVariants = {},
}) => {
  // Calculate GST value for a line item (returns total GST amount)
  const calculateGstValue = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const baseAmount = qty * unitPrice;
    const gstPercent = parseFloat((item.gstPercent ?? (item.sgstPercent + item.cgstPercent))) || 0;
    return (baseAmount * gstPercent) / 100;
  };

  // Handle quantity input - allow decimals up to 2 places (behaves like Unit Price)
  const handleQtyChange = (itemId, value) => {
    // Allow empty
    if (value === '') {
      handleLineItemChange(itemId, 'qty', '');
      return;
    }

    // Remove any non-numeric characters except decimal point
    let clean = String(value).replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    const after = clean.split('.');
    if (after.length === 2 && after[1].length > 2) {
      clean = after[0] + '.' + after[1].slice(0, 2);
    }

    // Update as string so user can continue typing a decimal
    handleLineItemChange(itemId, 'qty', clean);
  };

  // Format qty on blur: only format to 2 decimals if the entered value contains a decimal point
  const handleQtyBlur = (itemId, value) => {
    if (value === '' || value === undefined) return;
    const str = String(value).trim();
    // If user entered a decimal number, format to 2 decimals; otherwise keep as integer
    if (str.includes('.')) {
      const n = parseFloat(str);
      if (isNaN(n) || n <= 0) {
        handleLineItemChange(itemId, 'qty', '');
        return;
      }
      // Store formatted string so the UI shows two decimals
      handleLineItemChange(itemId, 'qty', n.toFixed(2));
    } else {
      // Keep integer as-is (normalize to integer number)
      const i = parseInt(str.replace(/[^0-9]/g, ''), 10);
      if (isNaN(i) || i <= 0) {
        handleLineItemChange(itemId, 'qty', '');
        return;
      }
      handleLineItemChange(itemId, 'qty', i);
    }
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

  // Validate unit price on blur and ensure .00 is appended when necessary
  const handleUnitPriceBlur = (itemId, value) => {
    if (value === '' || value === undefined) {
      return;
    }

    const numericValue = parseFloat(value);

    if (isNaN(numericValue) || numericValue < 0.01) {
      // Set to empty if invalid
      handleLineItemChange(itemId, "unitPrice", '');
    } else {
      // Format to 2 decimal places and store as string so `.00` is visible
      handleLineItemChange(itemId, "unitPrice", numericValue.toFixed(2));
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
            style={{ minWidth: "1350px" }}
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
                  style={{ width: "150px", minWidth: "150px" }}
                  className="text-center fw-semibold text-sm py-12 border-0"
                >
                  Variant
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
                  style={{ width: "120px", minWidth: "120px" }}
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
                {isIgstApplicable ? (
                  <th
                    style={{ width: "110px", minWidth: "110px" }}
                    className="text-center fw-semibold text-sm py-12 border-0"
                  >
                    IGST
                  </th>
                ) : (
                  <>
                    <th
                      style={{ width: "90px", minWidth: "90px" }}
                      className="text-center fw-semibold text-sm py-12 border-0"
                    >
                      SGST
                    </th>
                    <th
                      style={{ width: "90px", minWidth: "90px" }}
                      className="text-center fw-semibold text-sm py-12 border-0"
                    >
                      CGST
                    </th>
                  </>
                )}
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
                console.log('Rendering line item', index, item);
                const gstValue = calculateGstValue(item);
                return (
                  <tr key={item.id}>
                    <td className="py-2" style={{ position: 'relative' }}>
                      {/* Autocomplete input for item search (name or code) */}
                      <ItemSearchInput
                        lineId={item.id}
                        value={
                          (item.itemCode || item.itemName)
                            ? `${item.itemCode || ""} - ${item.itemName || ""}`
                            : ""
                        }
                        disabled={loading}
                        error={errors[`item_${index}`]}
                        onChange={(val) => {
                          // When user types, clear associated itemId so fields remain disabled
                          handleLineItemChange(item.id, 'itemId', '');
                          // If user cleared the item text, reset all other fields for that line
                          if (!val || !String(val).trim()) {
                              handleLineItemChange(item.id, 'qty', '');
                              handleLineItemChange(item.id, 'unitPrice', '');
                              handleLineItemChange(item.id, 'uom', '');
                              handleLineItemChange(item.id, 'uomId', null);
                              handleLineItemChange(item.id, 'primaryUom', '');
                              handleLineItemChange(item.id, 'primaryUomId', null);
                              handleLineItemChange(item.id, 'secondaryUom', '');
                              handleLineItemChange(item.id, 'secondaryUomId', null);
                              handleLineItemChange(item.id, 'secondaryUomId', null);
                              handleLineItemChange(item.id, 'gstPercent', 0);
                              handleLineItemChange(item.id, 'amount', 0);
                              // clear description when cleared
                              handleLineItemChange(item.id, 'description', '');
                              // clear variant fields when cleared
                              handleLineItemChange(item.id, 'variantId', null);
                              handleLineItemChange(item.id, 'variantAttributes', null);
                            }
                        }}
                        onSelect={(selectedItem) => {
                          // selectedItem is full item object
                          selectItem(selectedItem, item.id);
                        }}
                      />
                    </td>
                    {/* Variant column - styled like SGST/CGST/Amount */}
                    <td className="py-2">
                      <div 
                        className="form-control form-control-sm bg-light d-flex align-items-center justify-content-center"
                        style={{ 
                          minHeight: "31px", 
                          cursor: item.variantId && itemsWithVariants[item.itemId]?.variants?.length > 1 ? "pointer" : "default",
                          padding: "4px 8px"
                        }}
                        onClick={() => {
                          if (item.variantId && onChangeVariant && itemsWithVariants[item.itemId]?.variants?.length > 1 && !loading) {
                            onChangeVariant(item.id, item.itemId);
                          }
                        }}
                        title={item.variantId && itemsWithVariants[item.itemId]?.variants?.length > 1 ? "Click to change variant" : ""}
                      >
                        {item.variantId ? (
                          <div className="d-flex flex-wrap gap-1 justify-content-center align-items-center w-100">
                            {item.variantAttributes && Object.entries(item.variantAttributes).length > 0 ? (
                              <>
                                {Object.entries(item.variantAttributes).slice(0, 2).map(([key, value]) => {
                                  return (
                                    <span
                                      key={key}
                                      className="d-inline-flex align-items-center text-neutral-700"
                                      style={{ fontSize: "11px" }}
                                    >
                                      {isColorAttribute(key) && <ColorSwatch colorName={value} size={12} />}
                                      <span className="text-capitalize">{value}</span>
                                    </span>
                                  );
                                })}
                                {Object.entries(item.variantAttributes).length > 2 && (
                                  <span className="text-neutral-500" style={{ fontSize: "10px" }}>
                                    +{Object.entries(item.variantAttributes).length - 2}
                                  </span>
                                )}
                                {itemsWithVariants[item.itemId]?.variants?.length > 1 && (
                                  <Icon icon="mdi:pencil" width="12" className="text-primary ms-1" />
                                )}
                              </>
                            ) : (
                              <span className="text-neutral-500 text-xs">Default</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2">
                      <input
                        type="text"
                        className={`form-control form-control-sm ${loading || !item.itemId ? 'bg-light' : ''}`}
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
                        disabled={loading || !item.itemId}
                      />
                    </td>
                    <td className="py-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`form-control form-control-sm text-center ${errors[`qty_${index}`] ? "is-invalid" : ""} ${loading || !item.itemId ? 'bg-light' : ''}`}
                          value={item.qty === '' ? '' : (item.qty || '')}
                          onChange={(e) => handleQtyChange(item.id, e.target.value)}
                          onBlur={(e) => handleQtyBlur(item.id, e.target.value)}
                          placeholder=""
                          aria-label={`Quantity for line ${index + 1}`}
                          disabled={loading || !item.itemId}
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
                      {/* UOM dropdown: include primary and optional secondary UOM from master item data */}
                      {(() => {
                        // Build options from stored primary/secondary (master) UOM fields if available,
                        // otherwise fall back to line uom/uomId
                        const primaryIdField = item.primaryUomId ?? item.uomId;
                        const primaryNameField = item.primaryUom ?? item.uom ?? item.uomName;
                        const secondaryIdField = item.secondaryUomId ?? item.secondaryUomId;
                        const secondaryNameField = item.secondaryUom ?? item.secondaryUomName;

                        const primary = (primaryIdField || primaryNameField) ? { id: primaryIdField ?? primaryNameField, name: primaryNameField ?? "" } : null;
                        const secondary = (secondaryIdField || secondaryNameField) ? { id: secondaryIdField ?? secondaryNameField, name: secondaryNameField ?? "" } : null;

                        const opts = [];
                        if (primary && primary.name) opts.push({ id: String(primary.id), name: primary.name });
                        if (secondary && secondary.name && String(secondary.id) !== String(primary?.id)) opts.push({ id: String(secondary.id), name: secondary.name });

                        // If no ids but names exist, include them as fallback
                        if (opts.length === 0 && (item.uom || item.primaryUom)) {
                          const fallbackName = item.uom || item.primaryUom;
                          opts.push({ id: String(item.uomId ?? item.primaryUomId ?? fallbackName), name: fallbackName });
                        }

                        const valueToUse = String(item.uomId ?? (opts[0] && opts[0].id) ?? "");

                        return (
                          <select
                            className="form-select form-select-sm text-center"
                            value={valueToUse}
                            onChange={(e) => {
                              const val = e.target.value;
                              const found = opts.find((o) => String(o.id) === String(val));
                              // Save both id and name to the line payload so parent can format correctly
                              handleLineItemChange(item.id, "uomId", found ? found.id : val);
                              handleLineItemChange(item.id, "uom", found ? found.name : val);
                            }}
                            aria-label={`Unit of measure for line ${index + 1}`} 
                            disabled={loading || !item.itemId}
                          >
                            {opts.map((u) => (
                              <option key={u.id} value={u.id}>
                                {String(u.name).toUpperCase()}
                              </option>
                            ))}
                          </select>
                        );
                      })()}
                    </td>
                    <td className="py-2" style={{ position: "relative" }}>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light border-end-0">₹</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          className={`form-control form-control-sm text-end border-start-0 ${errors[`unitPrice_${index}`] ? "is-invalid" : ""} ${loading || !item.itemId ? 'bg-light' : ''}`}
                          value={item.unitPrice === '' ? '' : (item.unitPrice || '')}
                          onChange={(e) => handleUnitPriceChange(item.id, e.target.value)}
                          onBlur={(e) => handleUnitPriceBlur(item.id, e.target.value)}
                          placeholder="0.00"
                          aria-label={`Unit price for line ${index + 1}`}
                          disabled={loading || !item.itemId}
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
                        onChange={(e) => handleLineItemChange(item.id, "gstPercent", parseInt(e.target.value))}
                        aria-label={`GST percentage for line ${index + 1}`}
                        disabled={loading || !item.itemId}
                      >
                        {taxOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    {isIgstApplicable ? (
                      <td className="py-2">
                          <input
                          type="text"
                          className="form-control form-control-sm text-end bg-light"
                          value={`₹ ${gstValue.toFixed(2)}`}
                          readOnly
                          disabled
                          aria-label={`IGST value for line ${index + 1}`}
                        />
                      </td>
                    ) : (
                      <>
                        <td className="py-2">
                            <input
                            type="text"
                            className="form-control form-control-sm text-end bg-light"
                            value={`₹ ${(gstValue / 2).toFixed(2)}`}
                            readOnly
                            disabled
                            aria-label={`SGST value for line ${index + 1}`}
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="text"
                            className="form-control form-control-sm text-end bg-light"
                            value={`₹ ${(gstValue / 2).toFixed(2)}`}
                            readOnly
                            disabled
                            aria-label={`CGST value for line ${index + 1}`}
                          />
                        </td>
                      </>
                    )}
                    <td className="py-2">
                        <input
                        type="text"
                        className="form-control form-control-sm text-end bg-light fw-medium"
                        value={`₹ ${(item.amount || 0).toFixed(2)}`}
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

// Small internal component providing debounced search and suggestion dropdown per line
const ItemSearchInput = ({ lineId, value, disabled, error, onChange, onSelect }) => {
  const [text, setText] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const suppressRef = useRef(false);
  const inputRef = useRef(null);
  const [inputWidth, setInputWidth] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  // Track the last query to detect if user is shortening
  const lastQueryRef = useRef("");
  // Track the shortest query that returned no results to avoid redundant API calls
  // e.g., if "abc" returns nothing, "abcd", "abcde" etc. won't trigger API calls
  const noResultPrefixRef = useRef("");
  // Track if the initial value has been set (to prevent search on edit mode load)
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // When value prop changes from parent (e.g., edit mode), set text and suppress search
    if (value) {
      suppressRef.current = true;
    }
    setText(value || "");
    isInitializedRef.current = true;
  }, [value]);

  useLayoutEffect(() => {
    const measure = () => {
      if (inputRef.current) setInputWidth(inputRef.current.offsetWidth || 0);
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, []);

  useEffect(() => {
    const q = (text || "").trim();
    const prevQuery = lastQueryRef.current;
    
    if (suppressRef.current) return;

    // Detect if user is deleting/shortening the query
    const isShortening = q.length < prevQuery.length;

    // If user is shortening the query, reset the no-result prefix if applicable
    // This allows re-searching when user deletes characters
    if (isShortening && noResultPrefixRef.current) {
      // If the new query is shorter than or equal to the no-result prefix,
      // or doesn't start with it anymore, reset the prefix to allow new searches
      if (q.length < noResultPrefixRef.current.length || 
          !q.toLowerCase().startsWith(noResultPrefixRef.current.toLowerCase())) {
        noResultPrefixRef.current = "";
      }
    }

    if (q.length >= 3) {
      // Skip API call if current query extends a known no-result prefix
      // e.g., if "abc" returned nothing, "abcd" won't trigger an API call
      if (noResultPrefixRef.current && 
          q.toLowerCase().startsWith(noResultPrefixRef.current.toLowerCase())) {
        // Don't call API, just ensure suggestions are empty
        setSuggestions([]);
        setShowSuggestions(false);
        lastQueryRef.current = q;
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await searchItems(q);
          let results = [];
          if (Array.isArray(res)) results = res;
          else if (res && Array.isArray(res.data)) results = res.data;
          else if (res && res.success && Array.isArray(res.data)) results = res.data;
          setSuggestions(results || []);
          const has = (results || []).length > 0;
          setShowSuggestions(has);
          lastQueryRef.current = q;

          // If no results, store this query as the no-result prefix
          // to prevent further API calls for extended queries
          if (!results || results.length === 0) {
            noResultPrefixRef.current = q;
          } else {
            // Got results, clear the no-result prefix
            noResultPrefixRef.current = "";
          }

          if (has && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownPos({ top: rect.bottom + 6, left: rect.left, width: rect.width });
          }
        } catch (err) {
          console.error('Item search failed', err);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300);
    } else {
      // Query too short or empty - reset everything
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSuggestions([]);
      setShowSuggestions(false);
      lastQueryRef.current = "";
      // Reset no-result prefix when query is cleared/too short
      noResultPrefixRef.current = "";
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text]);

  // Reposition dropdown when showSuggestions toggles or window scroll/resize
  useEffect(() => {
    if (!showSuggestions) return;
    const reposition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom, left: rect.left, width: rect.width });
      }
    };
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [showSuggestions]);

  const handleSelect = (it) => {
    // prevent further suggestion popups until user types again
    suppressRef.current = true;
    const display = it.itemCode && it.itemName ? `${it.itemCode} - ${it.itemName}` : (it.itemCode || it.itemName || "");
    setText(display);
    setSuggestions([]);
    setShowSuggestions(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (onSelect) onSelect(it);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        className={`form-control form-control-sm ${error ? 'is-invalid' : ''}`}
        placeholder="Search item by name or code"
        value={text}
        disabled={disabled}
        ref={inputRef}
        onChange={(e) => {
          setText(e.target.value);
          suppressRef.current = false;
          if (onChange) onChange(e.target.value);
        }}
        onFocus={() => {
          if (!suppressRef.current && suggestions.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
      />
      {error && (
        <div className="invalid-feedback d-block" style={{ fontSize: '11px' }}>{error}</div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul
          className="dropdown-menu p-12 border bg-base shadow show"
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 9999,
            width: dropdownPos.width || inputWidth || 'auto',
            maxWidth: '90vw',
            boxSizing: 'border-box',
            overflowX: 'hidden',
            overflowY: suggestions.length > 5 ? 'auto' : 'visible',
            maxHeight: suggestions.length > 5 ? 220 : 'none',
            marginTop: 0,
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id ?? i}
              className="dropdown-item"
              style={{ cursor: 'pointer', whiteSpace: 'normal' }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(s)}
            >
              <div>{s.itemCode ? `${s.itemCode} - ${s.itemName}` : s.itemName}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default POLineItemsTable;
