import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  getItemMetaData,
  createItem,
  updateItem,
  searchItems,
} from "../services/ItemMaster";

// Helper function to convert string to camelCase or lowercase
const toCamelCase = (str) => {
  if (!str) return "";

  // Check if the string contains spaces
  if (str.includes(" ")) {
    // Convert to camelCase: "Item Name" -> "itemName"
    return str
      .split(" ")
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join("");
  } else {
    // If no spaces, convert to lowercase: "Color" -> "color"
    return str.toLowerCase();
  }
};

const ItemFormLayer = ({
  itemData,
  tableData,
  onSuccess,
  onCancel,
  triggerToast,
}) => {
  const isEdit = !!itemData;
  const itemId = itemData?.id;

  const [loading, setLoading] = useState(false);

  // New state for full metadata
  const [metaData, setMetaData] = useState([]);
  const [metaDataLoading, setMetaDataLoading] = useState(true);

  // Derived options based on selections
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);

  const [attributes, setAttributes] = useState([]);
  const [formData, setFormData] = useState({
    itemName: "",
    categoryId: "",
    subCategoryId: "",
    itemTypeId: "",
    uomId: "",
    secondaryUomId: "",
    hsnCode: "",
    isActive: true,
    attributes: {},
  });

  // State for UOM options
  const [uomOptions, setUomOptions] = useState([]);

  // Autocomplete / suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const lastQueryRef = useRef("");
  const suppressSuggestionsRef = useRef(false);
  // Track selected item id when editing. In add mode we intentionally keep this null.
  const [selectedItemId, setSelectedItemId] = useState(isEdit ? itemId : null);

  useEffect(() => {
    // Keep selectedItemId in sync when itemData changes (e.g., opening edit dialog)
    setSelectedItemId(isEdit ? itemId : null);
  }, [isEdit, itemId]);

  // Fetch Metadata on Mount
  const fetchMetaData = useCallback(async () => {
    try {
      setMetaDataLoading(true);
      const response = await getItemMetaData();

      // Handle both array response and object response
      let metaDataArray = [];
      if (Array.isArray(response)) {
        metaDataArray = response;
      } else if (response.data && Array.isArray(response.data)) {
        metaDataArray = response.data;
      } else if (response.success && Array.isArray(response.data)) {
        metaDataArray = response.data;
      }

      setMetaData(metaDataArray);
      setCategories(metaDataArray); // Categories are the top level
    } catch (err) {
      console.error("Error fetching item metadata:", err);
    } finally {
      setMetaDataLoading(false);
    }
  }, []);

  const handleCategoryChange = useCallback(
    (categoryId) => {
      const catIdStr = categoryId.toString();
      setFormData((prev) => ({
        ...prev,
        categoryId: catIdStr,
        subCategoryId: "",
        itemTypeId: "",
        uomId: "",
        secondaryUomId: "",
        attributes: {},
      }));

      // Reset downstream options
      setSubcategories([]);
      setItemTypes([]);
      setAttributes([]);
      setUomOptions([]);

      if (catIdStr) {
        // Find category in metadata
        const category = metaData.find((c) => c.id.toString() === catIdStr);
        if (category && category.subCategories) {
          setSubcategories(category.subCategories);
        }
      }
    },
    [metaData]
  );

  const handleSubcategoryChange = useCallback(
    (subCategoryId) => {
      const subIdStr = subCategoryId.toString();
      setFormData((prev) => ({
        ...prev,
        subCategoryId: subIdStr,
        itemTypeId: "",
        uomId: "",
        secondaryUomId: "",
        attributes: {},
      }));

      setItemTypes([]);
      setAttributes([]);
      setUomOptions([]);

      if (subIdStr) {
        // Find subcategory in current list
        const subcategory = subcategories.find(
          (sc) => sc.id.toString() === subIdStr
        );
        if (subcategory && subcategory.itemTypes) {
          setItemTypes(subcategory.itemTypes);
        }
      }
    },
    [subcategories]
  );

  const handleItemTypeChange = useCallback(
    (itemTypeId) => {
      setFormData((prev) => ({
        ...prev,
        itemTypeId,
        uomId: "",
        secondaryUomId: "",
        attributes: {},
      }));
      setAttributes([]);
      setUomOptions([]);
      if (itemTypeId) {
        // Find itemType in current list
        const itemType = itemTypes.find(
          (it) => it.id.toString() === itemTypeId.toString()
        );
        if (itemType) {
          setAttributes(itemType.attributes || []);
          setUomOptions(itemType.uoms || []);
        }
      }
    },
    [itemTypes]
  );

  // Initialize form with item data in Edit mode
  const initializeFormData = useCallback(() => {
    if (!isEdit || !itemData) return;

    // Always set the basic form data first
    setFormData({
      itemName: itemData.itemName || "",
      categoryId: itemData.categoryId?.toString() || "", // Ensure string for select
      subCategoryId: itemData.subCategoryId?.toString() || "",
      itemTypeId: itemData.itemTypeId?.toString() || "",
      uomId: itemData.uomId?.toString() || "", // Ensure string for select
      secondaryUomId: itemData.secondaryUomId?.toString() || "",
      hsnCode: itemData.hsnCode || "",
      isActive: itemData.isActive ?? true,
      attributes: {},
    });

    // 3. Populate Cascading Dropdowns synchronously from Metadata
    const categoryId = parseInt(itemData.categoryId);
    const subCategoryId = parseInt(itemData.subCategoryId);
    const itemTypeId = parseInt(itemData.itemTypeId);

    const category = metaData.find((c) => c.id === categoryId);
    if (category) {
      setSubcategories(category.subCategories || []);
      const subcategory = category.subCategories?.find(
        (sc) => sc.id === subCategoryId
      );
      if (subcategory) {
        setItemTypes(subcategory.itemTypes || []);
        const itemType = subcategory.itemTypes?.find(
          (it) => it.id === itemTypeId
        );
        if (itemType) {
          // Always set attributes from metadata for form rendering
          setAttributes(itemType.attributes || []);
          setUomOptions(itemType.uoms || []);

          // Now populate the attributes with the item data
          const populatedAttributes = {};

          // Check if item has custom attributes (string keys like RAM, Color, etc.)
          const hasCustomAttributes =
            itemData.attributes &&
            Object.keys(itemData.attributes).some((key) =>
              isNaN(parseInt(key))
            );

          if (hasCustomAttributes) {
            // Convert custom attributes to match form attribute IDs
            // This maps custom attribute names to the corresponding attribute IDs from metadata
            itemType.attributes.forEach((attr) => {
              const attributeName = attr.attributeName.toLowerCase();
              // Look for matching custom attribute by name (case-insensitive)
              const customKey = Object.keys(itemData.attributes).find(
                (key) => key.toLowerCase() === attributeName
              );
              if (customKey) {
                populatedAttributes[attr.id] = itemData.attributes[customKey];
              }
            });
          } else {
            // Use the existing numeric attributes directly
            Object.keys(itemData.attributes || {}).forEach((key) => {
              populatedAttributes[key] = itemData.attributes[key];
            });
          }

          // Update form data with populated attributes
          setFormData((prev) => ({
            ...prev,
            attributes: populatedAttributes,
          }));
        }
      }
    }
  }, [isEdit, itemData, metaData]);

  // Initial Data Load
  useEffect(() => {
    fetchMetaData();
  }, [fetchMetaData]);

  // When metadata and itemData are ready, initialize form data
  useEffect(() => {
    if (isEdit && metaData.length > 0) {
      initializeFormData();
    }
  }, [isEdit, metaData, initializeFormData]);

  // Effect to populate dropdowns when form data changes in edit mode
  useEffect(() => {
    if (isEdit && metaData.length > 0 && formData.categoryId) {
      // Populate subcategories
      const category = metaData.find(
        (c) => c.id.toString() === formData.categoryId
      );
      if (category) {
        setSubcategories(category.subCategories || []);

        // If subcategory is set, populate item types
        if (formData.subCategoryId) {
          const subcategory = category.subCategories?.find(
            (sc) => sc.id.toString() === formData.subCategoryId
          );
          if (subcategory) {
            setItemTypes(subcategory.itemTypes || []);

            // If item type is set, populate attributes and UOMs
            if (formData.itemTypeId) {
              const itemType = subcategory.itemTypes?.find(
                (it) => it.id.toString() === formData.itemTypeId
              );
              if (itemType) {
                setAttributes(itemType.attributes || []);
                setUomOptions(itemType.uoms || []);
              }
            }
          }
        }
      }
    }
  }, [
    isEdit,
    metaData,
    formData.categoryId,
    formData.subCategoryId,
    formData.itemTypeId,
  ]);

  const handleAttributeChange = (attributeId, value) => {
    setFormData((prev) => ({
      ...prev,
      attributes: { ...prev.attributes, [attributeId]: value },
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      // If user edits the itemName, allow suggestions again
      if (field === "itemName" && prev.itemName !== value) {
        suppressSuggestionsRef.current = false;
        // Allow searching again even if the query matches the last one
        lastQueryRef.current = "";
        setSuggestions([]);
        setShowSuggestions(false);
      }
      return { ...prev, [field]: value };
    });
  };

  const validateForm = () => {
    if (!formData.categoryId) {
      if (triggerToast) triggerToast("Category is required", "error");
      return false;
    }
    if (!formData.subCategoryId) {
      if (triggerToast) triggerToast("Subcategory is required", "error");
      return false;
    }
    if (!formData.itemTypeId) {
      if (triggerToast) triggerToast("Item Type is required", "error");
      return false;
    }
    if (!formData.itemName.trim()) {
      if (triggerToast) triggerToast("Item Name is required", "error");
      return false;
    }
    if (!formData.uomId) {
      if (triggerToast) triggerToast("UOM is required", "error");
      return false;
    }
    // If secondary UOM provided, it cannot be same as primary
    if (formData.secondaryUomId && formData.secondaryUomId === formData.uomId) {
      if (triggerToast) triggerToast("Primary and Secondary UOM cannot be same", "error");
      return false;
    }
    if (!formData.hsnCode.trim()) {
      if (triggerToast) triggerToast("HSN Code is required", "error");
      return false;
    }

    // Validate mandatory attributes
    for (const attr of attributes) {
      if (!formData.attributes[attr.id]) {
        if (triggerToast)
          triggerToast(`${attr.attributeName} is required`, "error");
        return false;
      }
    }

    return true;
  };

  // Apply selected item from suggestions into the form
  const applySelectedItem = (item) => {
    if (!item) return;

    // Set basic form fields
    setFormData((prev) => ({
      ...prev,
      itemName: item.itemName || "",
      categoryId: item.categoryId?.toString() || "",
      subCategoryId: item.subCategoryId?.toString() || "",
      itemTypeId: item.itemTypeId?.toString() || "",
      uomId: item.uomId?.toString() || "",
      secondaryUomId: item.secondaryUomId?.toString() || "",
      hsnCode: item.hsnCode || "",
      isActive: item.isActive ?? true,
      attributes: {},
    }));

    // Populate cascading dropdowns and attributes from metadata
    const categoryId = parseInt(item.categoryId);
    const subCategoryId = parseInt(item.subCategoryId);
    const itemTypeId = parseInt(item.itemTypeId);

    const category = metaData.find((c) => c.id === categoryId);
    if (category) {
      setSubcategories(category.subCategories || []);
      const subcategory = category.subCategories?.find(
        (sc) => sc.id === subCategoryId
      );
      if (subcategory) {
        setItemTypes(subcategory.itemTypes || []);
        const itemType = subcategory.itemTypes?.find(
          (it) => it.id === itemTypeId
        );
        if (itemType) {
          setAttributes(itemType.attributes || []);
          setUomOptions(itemType.uoms || []);

          // Populate attributes values
          const populatedAttributes = {};
          // If API returned attributes as object with string keys, try to map
          if (item.attributes && Object.keys(item.attributes).length > 0) {
            const hasCustomAttributes = Object.keys(item.attributes).some(
              (k) => isNaN(parseInt(k))
            );
            if (hasCustomAttributes) {
              itemType.attributes.forEach((attr) => {
                const attrName = (attr.attributeName || "").toLowerCase();
                const matchKey = Object.keys(item.attributes).find(
                  (k) => k.toLowerCase() === attrName
                );
                if (matchKey) populatedAttributes[attr.id] = item.attributes[matchKey];
              });
            } else {
              Object.keys(item.attributes).forEach((k) => {
                populatedAttributes[k] = item.attributes[k];
              });
            }
          }

          setFormData((prev) => ({ ...prev, attributes: populatedAttributes }));
        }
      }
    }

    // Hide suggestions after selection
    setSuggestions([]);
    setShowSuggestions(false);
    // Clear any pending debounce so pending searches won't repopulate suggestions
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    // Prevent showing suggestions again on focus until user changes input
    suppressSuggestionsRef.current = true;

    // Preserve selected item id only in edit mode. In add mode we do not preserve id.
    if (isEdit && item && item.id) {
      setSelectedItemId(item.id);
    } else {
      setSelectedItemId(null);
    }
  };

  // Debounced search for item names when user types 3+ chars
  useEffect(() => {
    const query = (formData.itemName || "").trim();

    // If suggestions are suppressed (user selected an item), do nothing
    if (suppressSuggestionsRef.current) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (query.length >= 3) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          // Avoid repeating same query
          if (lastQueryRef.current === query) return;
          const res = await searchItems(query);
          let results = [];
          if (Array.isArray(res)) results = res;
          else if (res && Array.isArray(res.data)) results = res.data;
          else if (res && res.success && Array.isArray(res.data)) results = res.data;

          setSuggestions(results || []);
          setShowSuggestions((results || []).length > 0);
          lastQueryRef.current = query;
        } catch (err) {
          console.error('Item search failed', err);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, 300);
    } else {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSuggestions([]);
      setShowSuggestions(false);
      lastQueryRef.current = "";
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.itemName]);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    // Duplicate checks are handled by the API (backend). Proceed to submit.

    try {
      setLoading(true);
      const attributeObject = {};
      attributes.forEach((attr) => {
        attributeObject[toCamelCase(attr.attributeName)] =
          formData.attributes[attr.id] || "";
      });

      const itemDataPayload = {
        itemName: formData.itemName,
        categoryId: parseInt(formData.categoryId),
        subCategoryId: parseInt(formData.subCategoryId),
        itemTypeId: parseInt(formData.itemTypeId),
        uomId: formData.uomId,
        // Map secondary UOM fields as requested
        secondaryUomId: formData.secondaryUomId
          ? parseInt(formData.secondaryUomId)
          : null,
        secondaryUomName: formData.secondaryUomId
          ? (uomOptions.find(
              (opt) => opt.id.toString() === formData.secondaryUomId.toString()
            )?.name || null)
          : null,
        hsnCode: formData.hsnCode,
        isActive: formData.isActive,
        attributes: attributeObject,
      };

      if (isEdit) {
        const idToUse = selectedItemId || itemId;
        await updateItem({ id: idToUse, ...itemDataPayload });
        if (onSuccess) onSuccess("Item updated successfully");
      } else {
        await createItem(itemDataPayload);
        if (onSuccess) onSuccess("Item created successfully");
      }
    } catch (err) {
      if (triggerToast) triggerToast(err.errorMessage || "Failed to save item", "error");
      console.error("Error saving item:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderAttributeField = (attr) => {
    const value = formData.attributes[attr.id] || "";
    const type = (attr.dataType || "").toString().trim().toLowerCase();

    switch (type) {
      case "number":
        return (
          <input
            type="number"
            className="form-control radius-8 number-input-dark"
            placeholder={`Enter ${attr.attributeName}`}
            value={value}
            onChange={(e) => {
              // Filter out special characters and non-numeric
              const filteredValue = e.target.value.replace(/[^0-9.]/g, "");
              handleAttributeChange(attr.id, filteredValue);
            }}
            onKeyPress={(e) => {
              // Only allow numbers, decimal point, and control keys
              if (
                !/[0-9.]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "Tab"
              ) {
                e.preventDefault();
              }
            }}
            style={{
              // Dark mode styling for number input spinners
              "--webkit-appearance": "none",
              appearance: "textfield",
            }}
          />
        );
      case "text":
      case "string":
        return (
          <input
            type="text"
            className="form-control radius-8"
            placeholder={`Enter ${attr.attributeName}`}
            value={value}
            onChange={(e) => {
              // Filter out special characters and numbers, allow letters, spaces and hyphen
              const filteredValue = e.target.value.replace(/[^a-zA-Z\s-]/g, "");
              handleAttributeChange(attr.id, filteredValue);
            }}
            onKeyPress={(e) => {
              // Only allow letters, spaces, and control keys
              if (
                !/[a-zA-Z\s-]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "Tab"
              ) {
                e.preventDefault();
              }
            }}
          />
        );
      default:
        return (
          <input
            type="text"
            className="form-control radius-8"
            placeholder={`Enter ${attr.attributeName}`}
            value={value}
            onChange={(e) => {
              // Filter out special characters but allow hyphen
              const filteredValue = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, "");
              handleAttributeChange(attr.id, filteredValue);
            }}
            onKeyPress={(e) => {
              // Only allow letters, numbers, spaces, and control keys
              if (
                !/[a-zA-Z0-9\s-]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "Tab"
              ) {
                e.preventDefault();
              }
            }}
          />
        );
    }
  };

  // Disable modal scroll when loading spinner is active
  useEffect(() => {
    const modalRoot = document.querySelector('.modal.show.d-block');
    if ((metaDataLoading || loading) && modalRoot) {
      modalRoot.style.overflow = 'hidden';
    } else if (modalRoot) {
      modalRoot.style.overflow = '';
    }
    return () => {
      if (modalRoot) modalRoot.style.overflow = '';
    };
  }, [metaDataLoading, loading]);

  return (
    <div style={{ position: 'relative', minHeight: '200px' }}>
      {/* Loading overlay - covers only the form/dialog body */}
      {(metaDataLoading || loading) && (
        <div className="item-form-loading-overlay">
          <div className="text-center">
            <div
              className="spinner-border text-primary mb-3"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h6>
              {metaDataLoading ? "Loading form data..." : "Saving..."}
            </h6>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row gy-4">
          <div className="col-md-6 mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Category <span className="text-danger">*</span>
            </label>
            <select
              className="form-select radius-8"
              style={{ paddingRight: "2.5rem" }}
              value={formData.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Subcategory <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select radius-8 ${
                !formData.categoryId ? "bg-light opacity-50" : ""
              }`}
              style={{ paddingRight: "2.5rem" }}
              value={formData.subCategoryId}
              onChange={(e) => handleSubcategoryChange(e.target.value)}
              disabled={!formData.categoryId}
            >
              <option value="">Select Subcategory</option>
              {subcategories.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Item Type <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select radius-8 ${
                !formData.subCategoryId ? "bg-light opacity-50" : ""
              }`}
              style={{ paddingRight: "2.5rem" }}
              value={formData.itemTypeId}
              onChange={(e) => handleItemTypeChange(e.target.value)}
              disabled={!formData.subCategoryId}
            >
              <option value="">Select Item Type</option>
              {itemTypes.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Item Name <span className="text-danger">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control radius-8"
                placeholder="Enter Item Name"
                value={formData.itemName}
                onChange={(e) => handleInputChange("itemName", e.target.value)}
                onFocus={() => {
                  if (
                    !suppressSuggestionsRef.current &&
                    suggestions &&
                    suggestions.length >= 1 &&
                    formData.itemName?.length >= 3
                  ) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
              />

              {showSuggestions && suggestions.length > 0 && (
                <ul
                  className="dropdown-menu p-12 border bg-base shadow show"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 2000,
                    maxHeight: 220,
                    overflowY: 'auto',
                    marginTop: 6,
                  }}
                >
                  {suggestions.map((s, idx) => (
                    <li
                      key={s.id ?? idx}
                      className="dropdown-item"
                      style={{ cursor: 'pointer' }}
                      onMouseDown={(e) => {
                        // prevent blur from hiding before click
                        e.preventDefault();
                      }}
                      onClick={() => applySelectedItem(s)}
                    >
                      {s.itemName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="col-md-6 mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Primary UOM <span className="text-danger">*</span>
            </label>
            <select
              className={`form-select radius-8 ${
                !formData.itemTypeId ? "bg-light opacity-50" : ""
              }`}
              style={{ paddingRight: "2.5rem" }}
              value={(formData.uomId || "").toString()}
              onChange={(e) => handleInputChange("uomId", e.target.value)}
              disabled={!formData.itemTypeId}
            >
              <option value="">Select Primary UOM</option>
              {uomOptions.map((opt) => (
                <option key={opt.id} value={opt.id.toString()}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6 mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Secondary UOM
            </label>
            <select
              className={`form-select radius-8 ${
                !formData.itemTypeId ? "bg-light opacity-50" : ""
              }`}
              style={{ paddingRight: "2.5rem" }}
              value={(formData.secondaryUomId || "").toString()}
              onChange={(e) => handleInputChange("secondaryUomId", e.target.value)}
              disabled={!formData.itemTypeId}
            >
              <option value="">Select Secondary UOM (optional)</option>
              {uomOptions.map((opt) => (
                <option key={opt.id} value={opt.id.toString()}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              HSN Code <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control radius-8"
              placeholder="Enter HSN Code"
              value={formData.hsnCode}
              onChange={(e) => handleInputChange("hsnCode", e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">
              Active
            </label>
            <div className="form-check d-flex align-items-center gap-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.checked)
                }
              />
              <label className="form-check-label mb-0" htmlFor="isActive">
                Is Active
              </label>
            </div>
          </div>
          {/* Always render form-based attributes section */}
          {attributes.length > 0 && (
            <div className="col-12 mb-20">
              <h5 className="fw-bold text-primary-light mb-16">Attributes</h5>
              <div className="row">
                {attributes.map((attr) => (
                  <div key={attr.id} className="col-md-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      {attr.attributeName}{" "}
                      <span className="text-danger">*</span>
                    </label>
                    {renderAttributeField(attr)}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="col-12 mb-20">
            <div className="card border-0 shadow-sm bg-base radius-12">
              <div
                className="card-header border-0 py-16 px-20"
                style={{
                  background:
                    "linear-gradient(135deg, var(--bs-primary, #6366f1) 0%, var(--bs-primary-dark, #4f46e5) 100%)",
                  borderRadius: "12px 12px 0 0",
                }}
              >
                <h5 className="card-title mb-0 text-white d-flex align-items-center gap-2">
                  <Icon
                    icon="mdi:file-document-outline"
                    width="24"
                    height="24"
                  />
                  {isEdit
                    ? `Preview Summary - ${itemData.itemCode || "Item Code"}`
                    : "Preview Summary"}
                </h5>
              </div>
              <div className="card-body p-20">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3 p-12 rounded bg-base-2 border border-neutral-200">
                      <Icon
                        icon="mdi:folder-outline"
                        width="20"
                        height="20"
                        className="text-primary-600 mt-1"
                      />
                      <div className="flex-grow-1">
                        <div className="text-neutral-600 text-xs mb-1">
                          Category
                        </div>
                        <div className="fw-semibold text-neutral-900">
                          {categories.find(
                            (c) => c.id === parseInt(formData.categoryId)
                          )?.name || (
                            <span className="text-neutral-500 fst-italic">
                              Not selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3 p-12 rounded bg-base-2 border border-neutral-200">
                      <Icon
                        icon="mdi:folder-multiple-outline"
                        width="20"
                        height="20"
                        className="text-primary-600 mt-1"
                      />
                      <div className="flex-grow-1">
                        <div className="text-neutral-600 text-xs mb-1">
                          Subcategory
                        </div>
                        <div className="fw-semibold text-neutral-900">
                          {subcategories.find(
                            (sc) => sc.id === parseInt(formData.subCategoryId)
                          )?.name || (
                            <span className="text-neutral-500 fst-italic">
                              Not selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3 p-12 rounded bg-base-2 border border-neutral-200">
                      <Icon
                        icon="mdi:tag-outline"
                        width="20"
                        height="20"
                        className="text-primary-600 mt-1"
                      />
                      <div className="flex-grow-1">
                        <div className="text-neutral-600 text-xs mb-1">
                          Item Type
                        </div>
                        <div className="fw-semibold text-neutral-900">
                          {itemTypes.find(
                            (it) => it.id === parseInt(formData.itemTypeId)
                          )?.name || (
                            <span className="text-neutral-500 fst-italic">
                              Not selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3 p-12 rounded bg-base-2 border border-neutral-200">
                      <Icon
                        icon="mdi:package-variant"
                        width="20"
                        height="20"
                        className="text-primary-600 mt-1"
                      />
                      <div className="flex-grow-1">
                        <div className="text-neutral-600 text-xs mb-1">
                          Item Name
                        </div>
                        <div className="fw-semibold text-neutral-900">
                          {formData.itemName || (
                            <span className="text-neutral-500 fst-italic">
                              Not entered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3 p-12 rounded bg-base-2 border border-neutral-200">
                      <Icon
                        icon="mdi:scale-balance"
                        width="20"
                        height="20"
                        className="text-primary-600 mt-1"
                      />
                      <div className="flex-grow-1">
                        <div className="text-neutral-600 text-xs mb-1">UOM</div>
                        <div className="fw-semibold text-neutral-900">
                          {uomOptions.find(
                            (opt) =>
                              opt.id.toString() ===
                              (formData.uomId || "").toString()
                          )?.name ||
                            formData.uomId || (
                              <span className="text-neutral-500 fst-italic">
                                Not selected
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3 p-12 rounded bg-base-2 border border-neutral-200">
                      <Icon
                        icon="mdi:scale-balance"
                        width="20"
                        height="20"
                        className="text-primary-600 mt-1"
                      />
                      <div className="flex-grow-1">
                        <div className="text-neutral-600 text-xs mb-1">Secondary UOM</div>
                        <div className="fw-semibold text-neutral-900">
                          {uomOptions.find(
                            (opt) =>
                              opt.id.toString() ===
                              (formData.secondaryUomId || "").toString()
                          )?.name ||
                            formData.secondaryUomId || (
                              <span className="text-neutral-500 fst-italic">
                                Not selected
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="d-flex align-items-start gap-3 p-12 rounded bg-base-2 border border-neutral-200">
                      <Icon
                        icon="mdi:barcode"
                        width="20"
                        height="20"
                        className="text-primary-600 mt-1"
                      />
                      <div className="flex-grow-1">
                        <div className="text-neutral-600 text-xs mb-1">
                          HSN Code
                        </div>
                        <div className="fw-semibold text-neutral-900">
                          {formData.hsnCode || (
                            <span className="text-neutral-500 fst-italic">
                              Not entered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="d-flex align-items-start gap-3 p-12 rounded bg-base-2 border border-neutral-200">
                      <Icon
                        icon="mdi:toggle-switch-outline"
                        width="20"
                        height="20"
                        className="text-primary-600 mt-1"
                      />
                      <div className="flex-grow-1">
                        <div className="text-neutral-600 text-xs mb-1">
                          Status
                        </div>
                        <div>
                          <span
                            className={`badge ${
                              formData.isActive
                                ? "bg-success-600"
                                : "bg-neutral-400"
                            }`}
                          >
                            {formData.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Always show form-based attributes preview */}
                  {attributes.length > 0 && (
                    <div className="col-12">
                      <div className="p-12 rounded bg-base-2 border border-neutral-200">
                        <div className="d-flex align-items-center gap-2 mb-12">
                          <Icon
                            icon="mdi:format-list-bulleted"
                            width="20"
                            height="20"
                            className="text-primary-600"
                          />
                          <div className="fw-semibold text-neutral-900">
                            Attributes
                          </div>
                        </div>
                        <div className="row g-2">
                          {attributes.map((attr) => (
                            <div key={attr.id} className="col-md-6">
                              <div className="d-flex justify-content-between align-items-center py-2 px-3 rounded bg-base border border-neutral-100">
                                <span className="text-neutral-600 text-sm">
                                  {attr.attributeName}:
                                </span>
                                <span className="fw-medium text-neutral-900 text-sm">
                                  {formData.attributes[attr.id] || (
                                    <span className="text-neutral-500 fst-italic">
                                      Not entered
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Button styling matches Supplier Info dialog */}
        <div className="d-flex align-items-center justify-content-center gap-3 w-100 mt-24">
          <button
            type="button"
            className="border border-gray-300 bg-hover-gray-50 text-gray-700 text-md px-40 py-11 radius-8"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary border border-primary-600 text-md px-48 py-12 radius-8"
            disabled={loading}
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Save"}
          </button>
        </div>
      </form>

      
    </div>
  );
};

export default ItemFormLayer;
