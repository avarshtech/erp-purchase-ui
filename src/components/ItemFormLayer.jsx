import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  getItemMetaData,
  createItem,
  updateItem,
  searchItems,
} from "../services/ItemMaster";
import { COLOR_PALETTE } from "../utils/colorConstants";

// Color Picker Input Component
const ColorPickerInput = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter colors based on search text
  const filteredColors = COLOR_PALETTE.filter((color) =>
    color.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Find the selected color object
  const selectedColor = COLOR_PALETTE.find(
    (c) => c.name.toLowerCase() === (value || "").toLowerCase()
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchText("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (colorName) => {
    onChange(colorName);
    setIsOpen(false);
    setSearchText("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchText("");
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filteredColors.length === 1) {
      handleSelect(filteredColors[0].name);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchText("");
    }
  };

  // Render color swatch (handles gradients for multi-colors)
  const renderSwatch = (hex, size = 20) => {
    const isGradient = hex.includes("gradient");
    return (
      <span
        style={{
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: "4px",
          background: isGradient ? hex : hex,
          backgroundColor: !isGradient ? hex : undefined,
          border: "1px solid rgba(0,0,0,0.15)",
          flexShrink: 0,
        }}
      />
    );
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Main input display */}
      <div
        className={`form-control radius-8 d-flex align-items-center gap-2 ${isOpen ? "border-primary" : ""}`}
        style={{
          cursor: "pointer",
          minHeight: "38px",
          paddingRight: value ? "60px" : "32px",
        }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
      >
        {selectedColor && renderSwatch(selectedColor.hex)}
        <span className={value ? "" : "text-muted"}>
          {value || placeholder || "Select Color"}
        </span>
        
        {/* Clear button */}
        {value && (
          <button
            type="button"
            className="btn btn-sm p-0 position-absolute"
            style={{ right: "32px", top: "50%", transform: "translateY(-50%)" }}
            onClick={handleClear}
            title="Clear"
          >
            <Icon icon="mdi:close-circle" width="18" height="18" className="text-neutral-400" />
          </button>
        )}
        
        {/* Dropdown arrow */}
        <Icon
          icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
          width="20"
          height="20"
          className="text-neutral-500 position-absolute"
          style={{ right: "8px", top: "50%", transform: "translateY(-50%)" }}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="dropdown-menu show p-0 shadow-lg border"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 2100,
            marginTop: "4px",
            maxHeight: "320px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search input */}
          <div className="p-2 border-bottom bg-light">
            <div className="position-relative">
              <Icon
                icon="mdi:magnify"
                width="18"
                height="18"
                className="position-absolute text-neutral-400"
                style={{ left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              />
              <input
                ref={inputRef}
                type="text"
                className="form-control form-control-sm"
                placeholder="Search colors..."
                value={searchText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                style={{ paddingLeft: "38px" }}
              />
            </div>
          </div>

          {/* Color list */}
          <div style={{ overflowY: "auto", maxHeight: "260px" }}>
            {filteredColors.length > 0 ? (
              filteredColors.map((color, idx) => (
                <div
                  key={`${color.name}-${idx}`}
                  className={`dropdown-item d-flex align-items-center gap-2 py-2 px-3 ${
                    value?.toLowerCase() === color.name.toLowerCase() ? "active bg-primary-100" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSelect(color.name)}
                >
                  {renderSwatch(color.hex, 22)}
                  <span className="flex-grow-1">{color.name}</span>
                  {value?.toLowerCase() === color.name.toLowerCase() && (
                    <Icon icon="mdi:check" width="18" height="18" className="text-primary" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-muted">
                <Icon icon="mdi:palette-outline" width="32" height="32" className="mb-2 text-neutral-300" />
                <div className="text-sm">No colors found</div>
                <div className="text-xs text-neutral-400">Try a different search term</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
    hsnCode: "",
    isActive: true,
    attributes: {},
  });

  // State for UOM options
  const [uomOptions, setUomOptions] = useState([]);

  // Variants management state
  const [variants, setVariants] = useState([]); // Array of variant objects
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [duplicateVariantIndex, setDuplicateVariantIndex] = useState(null);
  const variantRefs = useRef([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const lastQueryRef = useRef("");
  const suppressSuggestionsRef = useRef(false);
  // Track the shortest query that returned no results to avoid redundant API calls
  // e.g., if "abc" returns nothing, "abcd", "abcde" etc. won't trigger API calls
  const noResultPrefixRef = useRef("");
  const [initialSnapshot, setInitialSnapshot] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  // Track selected item id when editing. In add mode we intentionally keep this null.
  const [selectedItemId, setSelectedItemId] = useState(isEdit ? itemId : null);

  useEffect(() => {
    // Keep selectedItemId in sync when itemData changes (e.g., opening edit dialog)
  }, [isEdit, itemId]);

  // Helper to build a normalized snapshot string for comparison
  const buildSnapshotString = useCallback((formObj, variantsArr) => {
    try {
      const form = {
        itemName: (formObj.itemName || "").trim(),
        categoryId: formObj.categoryId || "",
        subCategoryId: formObj.subCategoryId || "",
        itemTypeId: formObj.itemTypeId || "",
        uomId: formObj.uomId || "",
        secondaryUomId: formObj.secondaryUomId || "",
        hsnCode: formObj.hsnCode || "",
        isActive: !!formObj.isActive,
      };

      const variantsNormalized = (variantsArr || []).map((v) => {
        // map attribute values explicitly so order/stable structure
        const attrs = {};
        attributes.forEach((attr) => {
          attrs[attr.id] = (v[attr.id] || "")?.toString?.().trim() || "";
        });
        return {
          id: v.id ?? null,
          itemId: v.itemId ?? null,
          isActive: v.isActive !== false,
          attributes: attrs,
        };
      });

      return JSON.stringify({ form, variants: variantsNormalized, selectedItemId });
    } catch (e) {
      return null;
    }
  }, [attributes, selectedItemId]);

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
      // Reset variants when category changes
      setVariants([]);
      setActiveVariantIndex(0);
      setDuplicateVariantIndex(null);

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
      // Reset variants when subcategory changes
      setVariants([]);
      setActiveVariantIndex(0);
      setDuplicateVariantIndex(null);

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
      // Reset variants when item type changes
      setVariants([]);
      setActiveVariantIndex(0);
      setDuplicateVariantIndex(null);
      
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

          // Initialize variants array from new API structure
          if (itemData.variants && Array.isArray(itemData.variants) && itemData.variants.length > 0) {
            // Load variants with new structure (id, itemId, itemCode, itemName, attributes, isActive)
            const loadedVariants = itemData.variants.map((variant) => {
              const variantObj = {
                // Preserve variant metadata
                id: variant.id,
                itemId: variant.itemId,
                isActive: variant.isActive ?? true,
              };
              
              // Map attributes from the variant.attributes object
              if (variant.attributes && typeof variant.attributes === 'object') {
                itemType.attributes.forEach((attr) => {
                  const attrName = attr.attributeName.toLowerCase();
                  // Look for matching key in variant.attributes (case-insensitive)
                  const matchKey = Object.keys(variant.attributes).find(
                    (k) => k.toLowerCase() === attrName
                  );
                  if (matchKey) {
                    variantObj[attr.id] = variant.attributes[matchKey];
                  } else if (variant.attributes[attr.id] !== undefined) {
                    variantObj[attr.id] = variant.attributes[attr.id];
                  } else {
                    variantObj[attr.id] = "";
                  }
                });
              } else {
                // Fallback: check variant object directly for attribute values
                itemType.attributes.forEach((attr) => {
                  const attrName = attr.attributeName.toLowerCase();
                  const matchKey = Object.keys(variant).find(
                    (k) => k.toLowerCase() === attrName
                  );
                  if (matchKey) {
                    variantObj[attr.id] = variant[matchKey];
                  } else if (variant[attr.id] !== undefined) {
                    variantObj[attr.id] = variant[attr.id];
                  } else {
                    variantObj[attr.id] = "";
                  }
                });
              }
              
              return variantObj;
            });
            setVariants(loadedVariants);
            // Set active index to first active variant
            const firstActiveIdx = loadedVariants.findIndex(v => v.isActive !== false);
            setActiveVariantIndex(firstActiveIdx >= 0 ? firstActiveIdx : 0);

            // Set initial snapshot for edit mode
            const snapshot = buildSnapshotString({
              itemName: itemData.itemName || "",
              categoryId: itemData.categoryId?.toString() || "",
              subCategoryId: itemData.subCategoryId?.toString() || "",
              itemTypeId: itemData.itemTypeId?.toString() || "",
              uomId: itemData.uomId?.toString() || "",
              secondaryUomId: itemData.secondaryUomId?.toString() || "",
              hsnCode: itemData.hsnCode || "",
              isActive: itemData.isActive ?? true,
            }, loadedVariants);
            setInitialSnapshot(snapshot);
          } else {
            // No variants exist, create single variant from attributes (legacy support)
            const defaultVariant = { ...populatedAttributes, isActive: true };
            setVariants([defaultVariant]);
            setActiveVariantIndex(0);

            const snapshot = buildSnapshotString({
              itemName: itemData.itemName || "",
              categoryId: itemData.categoryId?.toString() || "",
              subCategoryId: itemData.subCategoryId?.toString() || "",
              itemTypeId: itemData.itemTypeId?.toString() || "",
              uomId: itemData.uomId?.toString() || "",
              secondaryUomId: itemData.secondaryUomId?.toString() || "",
              hsnCode: itemData.hsnCode || "",
              isActive: itemData.isActive ?? true,
            }, [defaultVariant]);
            setInitialSnapshot(snapshot);
          }

          // Update form data with populated attributes
          setFormData((prev) => ({
            ...prev,
            attributes: populatedAttributes,
          }));
          // When opening in edit mode, suppress suggestions until user interacts
          suppressSuggestionsRef.current = true;
          // Remember last queried name to avoid immediate repeat searches
          lastQueryRef.current = (itemData.itemName || "").trim();
        }
      }
    }
  }, [isEdit, itemData, metaData, buildSnapshotString]);

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

  

  // Variant management handlers
  const createEmptyVariant = useCallback(() => {
    const emptyVariant = {
      // id and itemId are not set for new variants
      isActive: true,
    };
    attributes.forEach((attr) => {
      emptyVariant[attr.id] = "";
    });
    return emptyVariant;
  }, [attributes]);

  const handleVariantAttributeChange = (variantIndex, attributeId, value) => {
    setDuplicateVariantIndex(null); // Clear duplicate highlight on change
    setVariants((prev) => {
      const updated = [...prev];
      // Preserve existing variant metadata (id, itemId, isActive) when updating attributes
      updated[variantIndex] = {
        ...updated[variantIndex],
        [attributeId]: value,
      };
      return updated;
    });
  };

  const addVariant = () => {
    // Get only active variants for validation
    const activeVariants = variants.filter(v => v.isActive !== false);
    
    // Check if current active variant has any values before adding new one
    if (activeVariants.length > 0) {
      const activeVariantIndices = variants.map((v, idx) => v.isActive !== false ? idx : -1).filter(idx => idx !== -1);
      const currentActiveIdx = activeVariantIndices.find(idx => idx === activeVariantIndex);
      if (currentActiveIdx !== undefined) {
        const currentVariant = variants[currentActiveIdx];
        const hasAnyValue = attributes.some((attr) => 
          currentVariant[attr.id] && currentVariant[attr.id].toString().trim() !== ""
        );
        if (!hasAnyValue) {
          if (triggerToast) triggerToast("Please fill at least one attribute before adding a new variant", "error");
          return;
        }
      }
    }
    
    const newVariant = createEmptyVariant();
    setVariants((prev) => [...prev, newVariant]);
    // Set active index to the new variant (last in array)
    setActiveVariantIndex(variants.length);
  };

  const deleteVariant = (indexToDelete) => {
    // Count only active variants
    const activeVariantsCount = variants.filter(v => v.isActive !== false).length;
    
    if (activeVariantsCount <= 1) {
      if (triggerToast) triggerToast("At least one variant is required", "error");
      return;
    }
    
    const variantToDelete = variants[indexToDelete];
    
    // If variant has an id (exists in DB), soft delete by setting isActive: false
    // Otherwise, remove it from the array entirely
    if (variantToDelete.id) {
      setVariants((prev) => {
        const updated = [...prev];
        updated[indexToDelete] = {
          ...updated[indexToDelete],
          isActive: false,
        };
        return updated;
      });
    } else {
      // New variant (no id), remove from array
      setVariants((prev) => prev.filter((_, idx) => idx !== indexToDelete));
    }
    
    setDuplicateVariantIndex(null);
    
    // Find next active variant to set as active
    const remainingActiveIndices = variants
      .map((v, idx) => (idx !== indexToDelete && v.isActive !== false) ? idx : -1)
      .filter(idx => idx !== -1);
    
    if (remainingActiveIndices.length > 0) {
      // Find the closest active variant
      const newActiveIdx = remainingActiveIndices.find(idx => idx > indexToDelete) 
        ?? remainingActiveIndices[remainingActiveIndices.length - 1];
      setActiveVariantIndex(newActiveIdx);
    } else {
      setActiveVariantIndex(0);
    }
  };

  const checkDuplicateVariants = () => {
    // Only check active variants (isActive !== false)
    const activeVariantsWithIndex = variants
      .map((v, idx) => ({ variant: v, originalIndex: idx }))
      .filter(item => item.variant.isActive !== false);
    
    for (let i = 0; i < activeVariantsWithIndex.length; i++) {
      for (let j = i + 1; j < activeVariantsWithIndex.length; j++) {
        const variant1 = activeVariantsWithIndex[i].variant;
        const variant2 = activeVariantsWithIndex[j].variant;
        
        // Check if all attribute values are the same
        const allSame = attributes.every((attr) => {
          const val1 = (variant1[attr.id] || "").toString().trim().toLowerCase();
          const val2 = (variant2[attr.id] || "").toString().trim().toLowerCase();
          return val1 === val2;
        });
        
        if (allSame) {
          return { 
            isDuplicate: true, 
            index1: activeVariantsWithIndex[i].originalIndex, 
            index2: activeVariantsWithIndex[j].originalIndex 
          };
        }
      }
    }
    return { isDuplicate: false, index1: -1, index2: -1 };
  };

  // Helper to find deleted variant with matching attributes for reactivation
  const findMatchingDeletedVariant = (attributeValues) => {
    return variants.findIndex((v) => {
      if (v.isActive !== false) return false; // Only check deleted variants
      
      const allMatch = attributes.every((attr) => {
        const val1 = (v[attr.id] || "").toString().trim().toLowerCase();
        const val2 = (attributeValues[attr.id] || "").toString().trim().toLowerCase();
        return val1 === val2;
      });
      
      return allMatch;
    });
  };

  // Reactivate a deleted variant by index
  const reactivateVariant = (variantIndex) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex] = {
        ...updated[variantIndex],
        isActive: true,
      };
      return updated;
    });
    setActiveVariantIndex(variantIndex);
  };

  // Initialize variants when attributes change or in edit mode
  useEffect(() => {
    // Check if there are any active variants
    const hasActiveVariants = variants.some(v => v.isActive !== false);
    if (attributes.length > 0 && !hasActiveVariants) {
      // Initialize with one empty variant if no active variants exist
      setVariants([createEmptyVariant()]);
      setActiveVariantIndex(0);
    }
  }, [attributes, variants, createEmptyVariant]);

  // For new add-mode forms, capture the initial snapshot once variants are initialized
  useEffect(() => {
    if (!isEdit && !selectedItemId && !initialSnapshot && variants.length > 0) {
      const snapshot = buildSnapshotString(formData, variants);
      setInitialSnapshot(snapshot);
    }
  }, [isEdit, selectedItemId, initialSnapshot, variants, formData, buildSnapshotString]);

  // Update isDirty flag by comparing current state snapshot with initialSnapshot
  useEffect(() => {
    if (!initialSnapshot) {
      // If no snapshot yet, consider form pristine only if it's empty/new
      setIsDirty(true);
      return;
    }
    const current = buildSnapshotString(formData, variants);
    setIsDirty(current !== initialSnapshot);
  }, [formData, variants, selectedItemId, initialSnapshot, buildSnapshotString]);

  // Ensure activeVariantIndex always points to an active variant
  useEffect(() => {
    if (variants.length > 0) {
      const currentVariant = variants[activeVariantIndex];
      // If current activeVariantIndex points to an inactive or non-existent variant, find first active one
      if (!currentVariant || currentVariant.isActive === false) {
        const firstActiveIdx = variants.findIndex(v => v.isActive !== false);
        if (firstActiveIdx >= 0 && firstActiveIdx !== activeVariantIndex) {
          setActiveVariantIndex(firstActiveIdx);
        }
      }
    }
  }, [variants, activeVariantIndex]);

  // Ensure modal scroll is at top when the form mounts or when item/mode changes
  useEffect(() => {
    // run after render so modal DOM exists
    const id = setTimeout(() => {
      const modalBody = document.querySelector('.modal.show.d-block .modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      } else {
        // fallback to window
        try { window.scrollTo?.({ top: 0 }); } catch (e) {}
      }
    }, 0);
    return () => clearTimeout(id);
  }, [itemData?.id, isEdit]);

  // Sync formData.attributes with active variant for backward compatibility
  useEffect(() => {
    if (variants.length > 0 && activeVariantIndex < variants.length) {
      const activeVariant = variants[activeVariantIndex];
      // Only sync if the current variant is active
      if (activeVariant && activeVariant.isActive !== false) {
        setFormData((prev) => ({
          ...prev,
          attributes: activeVariant || {},
        }));
      }
    }
  }, [variants, activeVariantIndex]);

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
      focusFieldById('category');
      return false;
    }
    if (!formData.subCategoryId) {
      if (triggerToast) triggerToast("Subcategory is required", "error");
      focusFieldById('subcategory');
      return false;
    }
    if (!formData.itemTypeId) {
      if (triggerToast) triggerToast("Item Type is required", "error");
      focusFieldById('itemType');
      return false;
    }
    if (!formData.itemName.trim()) {
      if (triggerToast) triggerToast("Item Name is required", "error");
      focusFieldById('itemName');
      return false;
    }
    if (!formData.uomId) {
      if (triggerToast) triggerToast("UOM is required", "error");
      focusFieldById('uomId');
      return false;
    }
    // If secondary UOM provided, it cannot be same as primary
    if (formData.secondaryUomId && formData.secondaryUomId === formData.uomId) {
      if (triggerToast) triggerToast("Primary and Secondary UOM cannot be same", "error");
      focusFieldById('secondaryUomId');
      return false;
    }
    if (!formData.hsnCode.trim()) {
      if (triggerToast) triggerToast("HSN Code is required", "error");
      focusFieldById('hsnCode');
      return false;
    }

    // Get only active variants for validation (isActive !== false)
    const activeVariants = variants
      .map((v, idx) => ({ variant: v, originalIndex: idx }))
      .filter(item => item.variant.isActive !== false);

    // Validate variants - at least one active variant must exist
    if (activeVariants.length === 0) {
      if (triggerToast) triggerToast("At least one variant is required", "error");
      // Focus the item name as an anchor for adding variants
      focusFieldById('itemName');
      return false;
    }

    // Validate mandatory attributes for each active variant only
    for (const { variant, originalIndex } of activeVariants) {
      for (const attr of attributes) {
        if (!variant[attr.id] || variant[attr.id].toString().trim() === "") {
          // Calculate display index (1-based, only counting active variants)
          const displayIdx = activeVariants.findIndex(av => av.originalIndex === originalIndex) + 1;
          if (triggerToast) {
            triggerToast(`${attr.attributeName} is required in Variant ${displayIdx}`, "error");
          }
          setActiveVariantIndex(originalIndex);
          // Try to focus the specific input for this attribute
          try {
            const selector = `[data-variant-index="${originalIndex}"][data-attr-id="${attr.id}"]`;
            const attrEl = document.querySelector(selector);
            if (attrEl) {
              attrEl.focus && attrEl.focus();
              attrEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (variantRefs.current[originalIndex]) {
              variantRefs.current[originalIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } catch (e) {
            // ignore
          }
          return false;
        }
      }
    }

    // Check if any active variant matches a deleted variant (for swap scenario)
    // If a new active variant (no id) matches a deleted variant, swap flags
    let swappedVariants = false;
    for (const { variant, originalIndex } of activeVariants) {
      // Only process new variants (no id) for swap check
      if (variant.id !== undefined && variant.id !== null) continue;
      
      const matchingDeletedIdx = findMatchingDeletedVariant(variant);
      if (matchingDeletedIdx >= 0 && matchingDeletedIdx !== originalIndex) {
        // Found a matching deleted variant - reactivate it and remove the new duplicate
        // Use reactivateVariant helper to mark the deleted variant active
        reactivateVariant(matchingDeletedIdx);
        // Remove the newly added variant (which has no id)
        setVariants((prev) => prev.filter((_, idx) => idx !== originalIndex));
        swappedVariants = true;
      }
    }
    
    // If we swapped variants, re-validate after state updates
    if (swappedVariants) {
      // Let the state update and user can re-submit
      if (triggerToast) triggerToast("Variant matched an existing deleted variant and was restored", "info");
      return false;
    }

    // Check for duplicate variants (already filters to active only)
    const duplicateCheck = checkDuplicateVariants();
    if (duplicateCheck.isDuplicate) {
      setDuplicateVariantIndex(duplicateCheck.index2);
      setActiveVariantIndex(duplicateCheck.index2);
      // Scroll to the duplicate variant
      if (variantRefs.current[duplicateCheck.index2]) {
        variantRefs.current[duplicateCheck.index2].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
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

          // Populate attributes values (for legacy support / fallback)
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

          // Initialize variants with new API structure (id, itemId, itemCode, itemName, attributes, isActive)
          if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
            const loadedVariants = item.variants.map((variant) => {
              const variantObj = {
                // Preserve variant metadata for update flow
                id: variant.id,
                itemId: variant.itemId,
                isActive: variant.isActive ?? true,
              };
              
              // Map attributes from variant.attributes object
              if (variant.attributes && typeof variant.attributes === 'object') {
                itemType.attributes.forEach((attr) => {
                  const attrName = attr.attributeName.toLowerCase();
                  const matchKey = Object.keys(variant.attributes).find(
                    (k) => k.toLowerCase() === attrName
                  );
                  if (matchKey) {
                    variantObj[attr.id] = variant.attributes[matchKey];
                  } else if (variant.attributes[attr.id] !== undefined) {
                    variantObj[attr.id] = variant.attributes[attr.id];
                  } else {
                    variantObj[attr.id] = "";
                  }
                });
              } else {
                // Fallback: check variant object directly
                itemType.attributes.forEach((attr) => {
                  const attrName = attr.attributeName.toLowerCase();
                  const matchKey = Object.keys(variant).find(
                    (k) => k.toLowerCase() === attrName
                  );
                  if (matchKey) {
                    variantObj[attr.id] = variant[matchKey];
                  } else if (variant[attr.id] !== undefined) {
                    variantObj[attr.id] = variant[attr.id];
                  } else {
                    variantObj[attr.id] = "";
                  }
                });
              }
              
              return variantObj;
            });
            setVariants(loadedVariants);
            // Set active index to first active variant
            const firstActiveIdx = loadedVariants.findIndex(v => v.isActive !== false);
            setActiveVariantIndex(firstActiveIdx >= 0 ? firstActiveIdx : 0);
          } else {
            // No variants, create single variant from populated attributes (legacy support)
            setVariants([{ ...populatedAttributes, isActive: true }]);
            setActiveVariantIndex(0);
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

    // When user selects an existing item in add mode, it becomes an update scenario
    // Set selectedItemId to the selected item's id to treat it as update
    if (item && item.id) {
      setSelectedItemId(item.id);
    } else {
      setSelectedItemId(null);
    }

    // Build and set initial snapshot for selected item (treat as baseline)
    // We need to schedule the snapshot capture after state updates settle
    // Use the newly loaded itemType.attributes and construct variants the same way as loadedVariants
    setTimeout(() => {
      try {
        // Re-find the itemType to get the correct attributes (since state may not be updated yet)
        const cat = metaData.find((c) => c.id === categoryId);
        const subcat = cat?.subCategories?.find((sc) => sc.id === subCategoryId);
        const iType = subcat?.itemTypes?.find((it) => it.id === itemTypeId);
        const freshAttributes = iType?.attributes || [];

        const itemVariants = (item.variants && Array.isArray(item.variants) && item.variants.length > 0)
          ? item.variants.map((v) => {
              const obj = { id: v.id ?? null, itemId: v.itemId ?? null, isActive: v.isActive ?? true };
              if (v.attributes && typeof v.attributes === 'object') {
                freshAttributes.forEach((attr) => {
                  const attrName = attr.attributeName.toLowerCase();
                  const matchKey = Object.keys(v.attributes).find(k => k.toLowerCase() === attrName);
                  if (matchKey) {
                    obj[attr.id] = v.attributes[matchKey];
                  } else if (v.attributes[attr.id] !== undefined) {
                    obj[attr.id] = v.attributes[attr.id];
                  } else {
                    obj[attr.id] = "";
                  }
                });
              } else {
                freshAttributes.forEach((attr) => {
                  const attrName = attr.attributeName.toLowerCase();
                  const matchKey = Object.keys(v).find(k => k.toLowerCase() === attrName);
                  if (matchKey) {
                    obj[attr.id] = v[matchKey];
                  } else if (v[attr.id] !== undefined) {
                    obj[attr.id] = v[attr.id];
                  } else {
                    obj[attr.id] = "";
                  }
                });
              }
              return obj;
            })
          : [{ isActive: true }];

        // Build snapshot using a custom inline approach that uses freshAttributes
        const formSnapshot = {
          itemName: (item.itemName || "").trim(),
          categoryId: item.categoryId?.toString() || "",
          subCategoryId: item.subCategoryId?.toString() || "",
          itemTypeId: item.itemTypeId?.toString() || "",
          uomId: item.uomId?.toString() || "",
          secondaryUomId: item.secondaryUomId?.toString() || "",
          hsnCode: item.hsnCode || "",
          isActive: item.isActive ?? true,
        };

        const variantsNormalized = itemVariants.map((v) => {
          const attrs = {};
          freshAttributes.forEach((attr) => {
            attrs[attr.id] = (v[attr.id] || "")?.toString?.().trim() || "";
          });
          return {
            id: v.id ?? null,
            itemId: v.itemId ?? null,
            isActive: v.isActive !== false,
            attributes: attrs,
          };
        });

        const snapshot = JSON.stringify({ form: formSnapshot, variants: variantsNormalized, selectedItemId: item.id });
        setInitialSnapshot(snapshot);
      } catch (e) {
        // ignore
      }
    }, 0);
  };

  // Helper to focus a field by id and scroll it into view
  const focusFieldById = (id) => {
    try {
      const el = document.getElementById(id);
      if (el) {
        el.focus && el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (e) {
      // ignore
    }
  };

  // Debounced search for item names when user types 3+ chars
  useEffect(() => {
    const query = (formData.itemName || "").trim();
    const prevQuery = lastQueryRef.current;

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

    // Detect if user is deleting/shortening the query
    const isShortening = query.length < prevQuery.length;

    // If user is shortening the query, reset the no-result prefix if applicable
    // This allows re-searching when user deletes characters
    if (isShortening && noResultPrefixRef.current) {
      // If the new query is shorter than or equal to the no-result prefix,
      // or doesn't start with it anymore, reset the prefix to allow new searches
      if (query.length < noResultPrefixRef.current.length || 
          !query.toLowerCase().startsWith(noResultPrefixRef.current.toLowerCase())) {
        noResultPrefixRef.current = "";
      }
    }

    if (query.length >= 3) {
      // Skip API call if current query extends a known no-result prefix
      // e.g., if "abc" returned nothing, "abcd" won't trigger an API call
      if (noResultPrefixRef.current && 
          query.toLowerCase().startsWith(noResultPrefixRef.current.toLowerCase())) {
        // Don't call API, just ensure suggestions are empty
        setSuggestions([]);
        setShowSuggestions(false);
        lastQueryRef.current = query;
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
          debounceRef.current = null;
        }
        return;
      }

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

          // If no results, store this query as the no-result prefix
          // to prevent further API calls for extended queries
          if (!results || results.length === 0) {
            noResultPrefixRef.current = query;
          } else {
            // Got results, clear the no-result prefix
            noResultPrefixRef.current = "";
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
  }, [formData.itemName]);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) return;

    // Duplicate checks are handled by the API (backend). Proceed to submit.

    try {
      setLoading(true);
      
      // Determine if this is an update operation
      // Update if: isEdit mode OR user selected an existing item in add mode
      const isUpdateOperation = isEdit || !!selectedItemId;
      const idToUse = selectedItemId || itemId;
      
      // Convert variants to new API format with proper structure
      const variantsPayload = variants.map((variant) => {
        // Build attributes object with camelCase keys
        const attributeObject = {};
        attributes.forEach((attr) => {
          attributeObject[toCamelCase(attr.attributeName)] = variant[attr.id] || "";
        });
        
        // Build variant object for API
        const variantObj = {
          // itemCode and itemName are same as item's values
          itemCode: isUpdateOperation ? (itemData?.itemCode || "") : undefined,
          itemName: formData.itemName,
          attributes: attributeObject,
          isActive: variant.isActive ?? true,
        };
        
        // Include id only if it exists (update scenario for existing variant)
        if (variant.id !== undefined && variant.id !== null) {
          variantObj.id = variant.id;
        }
        
        // Include itemId only in update flow for new variants added to existing item
        if (isUpdateOperation && idToUse && variant.id === undefined) {
          variantObj.itemId = parseInt(idToUse);
        }
        // For existing variants, preserve their itemId
        if (variant.itemId !== undefined && variant.itemId !== null) {
          variantObj.itemId = variant.itemId;
        }
        
        return variantObj;
      });

      const itemDataPayload = {
        itemName: formData.itemName,
        categoryId: parseInt(formData.categoryId),
        subCategoryId: parseInt(formData.subCategoryId),
        itemTypeId: parseInt(formData.itemTypeId),
        uomId: parseInt(formData.uomId),
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
        // Send as variants array with new structure
        variants: variantsPayload,
      };

      if (isUpdateOperation) {
        await updateItem({ id: parseInt(idToUse), ...itemDataPayload });
        if (onSuccess) onSuccess("Item updated successfully");
      } else {
        // For create, remove itemCode from variants as it's not needed for new items
        itemDataPayload.variants = variantsPayload.map(v => {
          const { itemCode, itemId, ...rest } = v;
          return rest;
        });
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

  

  // Render attribute field for a specific variant
  const renderVariantAttributeField = (attr, variantIndex) => {
    const variant = variants[variantIndex] || {};
    const value = variant[attr.id] || "";
    const type = (attr.dataType || "").toString().trim().toLowerCase();
    const attrNameLower = (attr.attributeName || "").toLowerCase();

    const handleChange = (newValue) => {
      handleVariantAttributeChange(variantIndex, attr.id, newValue);
    };

    // Check if this is a color attribute (by name containing "color" or "colour")
    const isColorAttribute = attrNameLower.includes("color") || attrNameLower.includes("colour");

    if (isColorAttribute) {
      return (
        <ColorPickerInput
          value={value}
          onChange={handleChange}
          placeholder={`Select ${attr.attributeName}`}
        />
      );
    }

    switch (type) {
      case "number":
        return (
          <input
            type="number"
            className="form-control radius-8 number-input-dark"
            placeholder={`Enter ${attr.attributeName}`}
            value={value}
            onChange={(e) => {
              const filteredValue = e.target.value.replace(/[^0-9.]/g, "");
              handleChange(filteredValue);
            }}
            onKeyPress={(e) => {
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
              const filteredValue = e.target.value.replace(/[^a-zA-Z\s-]/g, "");
              handleChange(filteredValue);
            }}
            onKeyPress={(e) => {
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
              const filteredValue = e.target.value.replace(/[^a-zA-Z0-9\s-]/g, "");
              handleChange(filteredValue);
            }}
            onKeyPress={(e) => {
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
              id="category"
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
              id="subcategory"
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
              id="itemType"
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
                id="itemName"
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
              id="uomId"
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
              id="secondaryUomId"
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
              id="hsnCode"
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
          {/* Item Variants Section */}
          {attributes.length > 0 && (() => {
            // Filter to only show active variants in the UI
            const activeVariantsWithIndex = variants
              .map((v, idx) => ({ variant: v, originalIndex: idx }))
              .filter(item => item.variant.isActive !== false);
            const activeVariantsCount = activeVariantsWithIndex.length;
            
            return (
            <div className="col-12 mb-20">
              <div className="variant-section">
                <div className="d-flex align-items-center justify-content-between mb-16">
                  <h5 className="fw-bold text-primary-light mb-0 d-flex align-items-center gap-2">
                    <Icon icon="mdi:palette-swatch-variant" width="24" height="24" />
                    Item Variants ({activeVariantsCount})
                  </h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                    onClick={addVariant}
                  >
                    <Icon icon="mdi:plus" width="18" height="18" />
                    Add Variant
                  </button>
                </div>

                {/* Variant Tabs - only show active variants */}
                <div className="variant-tabs-container mb-16">
                  <div className="variant-tabs d-flex flex-wrap gap-2">
                    {activeVariantsWithIndex.map(({ originalIndex }, displayIndex) => (
                      <button
                        key={originalIndex}
                        type="button"
                        ref={(el) => (variantRefs.current[originalIndex] = el)}
                        className={`variant-tab ${
                          activeVariantIndex === originalIndex ? "active" : ""
                        } ${duplicateVariantIndex === originalIndex ? "duplicate" : ""}`}
                        onClick={() => {
                          setActiveVariantIndex(originalIndex);
                          setDuplicateVariantIndex(null);
                        }}
                      >
                        <span className="variant-tab-label">Variant {displayIndex + 1}</span>
                        {activeVariantsCount > 1 && (
                          <span
                            className="variant-tab-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteVariant(originalIndex);
                            }}
                            title="Delete variant"
                          >
                            <Icon icon="mdi:close" width="14" height="14" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Variant Fields */}
                {activeVariantsCount > 0 && variants[activeVariantIndex]?.isActive !== false && (
                  <div 
                    className={`variant-form-container p-16 rounded border ${
                      duplicateVariantIndex === activeVariantIndex 
                        ? "border-danger bg-danger-50" 
                        : "border-neutral-200 bg-base-2"
                    }`}
                  >
                    {duplicateVariantIndex === activeVariantIndex && (
                      <div className="alert alert-danger d-flex align-items-center gap-2 mb-16 py-8 px-12">
                        <Icon icon="mdi:alert-circle" width="20" height="20" />
                        <span className="text-sm">
                          This variant has duplicate attribute values. Please update at least one attribute.
                        </span>
                      </div>
                    )}
                    <div className="row">
                      {attributes.map((attr) => (
                        <div key={attr.id} className="col-md-6 mb-20">
                          <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                            {attr.attributeName}{" "}
                            <span className="text-danger">*</span>
                          </label>
                          {renderVariantAttributeField(attr, activeVariantIndex)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Variant Summary - only show active variants */}
                {activeVariantsCount > 1 && (
                  <div className="variant-summary mt-16">
                    <h6 className="text-sm fw-semibold text-neutral-600 mb-12">
                      Quick Summary - All Variants
                    </h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-0 variant-summary-table">
                        <thead>
                          <tr>
                            <th className="text-center" style={{ width: "80px" }}>#</th>
                            {attributes.map((attr) => (
                              <th key={attr.id}>{attr.attributeName}</th>
                            ))}
                            <th className="text-center" style={{ width: "80px" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeVariantsWithIndex.map(({ variant, originalIndex }, displayIndex) => (
                            <tr 
                              key={originalIndex}
                              className={`${
                                activeVariantIndex === originalIndex ? "table-primary" : ""
                              } ${duplicateVariantIndex === originalIndex ? "table-danger" : ""}`}
                            >
                              <td className="text-center">
                                <span className="badge bg-neutral-200 text-neutral-700">
                                  {displayIndex + 1}
                                </span>
                              </td>
                              {attributes.map((attr) => (
                                <td key={attr.id}>
                                  {variant[attr.id] || (
                                    <span className="text-neutral-400 fst-italic">—</span>
                                  )}
                                </td>
                              ))}
                              <td className="text-center">
                                <div className="d-flex align-items-center justify-content-center gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-ghost p-4"
                                    onClick={() => setActiveVariantIndex(originalIndex)}
                                    title="Edit variant"
                                  >
                                    <Icon icon="mdi:pencil" width="16" height="16" className="text-primary-600" />
                                  </button>
                                  {activeVariantsCount > 1 && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-ghost p-4"
                                      onClick={() => deleteVariant(originalIndex)}
                                      title="Delete variant"
                                    >
                                      <Icon icon="mdi:trash-can" width="16" height="16" className="text-danger" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
          })()}
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

                  {/* Variants Preview - only show active variants */}
                  {attributes.length > 0 && variants.length > 0 && (() => {
                    const previewActiveVariants = variants
                      .map((v, idx) => ({ variant: v, originalIndex: idx }))
                      .filter(item => item.variant.isActive !== false);
                    
                    if (previewActiveVariants.length === 0) return null;
                    
                    return (
                    <div className="col-12">
                      <div className="p-12 rounded bg-base-2 border border-neutral-200">
                        <div className="d-flex align-items-center justify-content-between mb-12">
                          <div className="d-flex align-items-center gap-2">
                            <Icon
                              icon="mdi:palette-swatch-variant"
                              width="20"
                              height="20"
                              className="text-primary-600"
                            />
                            <div className="fw-semibold text-neutral-900">
                              Item Variants ({previewActiveVariants.length})
                            </div>
                          </div>
                        </div>
                        
                        {/* Variants table preview */}
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered mb-0 variant-preview-table">
                            <thead>
                              <tr className="bg-neutral-100">
                                <th className="text-center text-xs py-8" style={{ width: "60px" }}>
                                  Variant
                                </th>
                                {attributes.map((attr) => (
                                  <th key={attr.id} className="text-xs py-8">
                                    {attr.attributeName}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewActiveVariants.map(({ variant }, displayIndex) => (
                                <tr key={displayIndex}>
                                  <td className="text-center py-8">
                                    <span className="badge bg-primary-100 text-primary-700 text-xs">
                                      #{displayIndex + 1}
                                    </span>
                                  </td>
                                  {attributes.map((attr) => (
                                    <td key={attr.id} className="text-sm py-8">
                                      {variant[attr.id] || (
                                        <span className="text-neutral-400 fst-italic text-xs">
                                          —
                                        </span>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    );
                  })()}
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
            disabled={loading || !isDirty}
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Save"}
          </button>
        </div>
      </form>

      
    </div>
  );
};

export default ItemFormLayer;
