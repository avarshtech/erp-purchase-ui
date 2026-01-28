import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { v4 as uuidv4 } from "uuid";
import { createPurchaseOrder, updatePurchaseOrder } from "../services/purchaseOrders";
import { getSuppliers } from "../services/suppliers";
import { getItemsByIds } from "../services/ItemMaster";
import axiosInstance from "../services/axiosInstance";
import POHeaderSection from "./child/POHeaderSection";
import POLineItemsTable from "./child/POLineItemsTable";
import POFooterSummary from "./child/POFooterSummary";
import POActionButtons from "./child/POActionButtons";
import POPreviewDialog from "./child/POPreviewDialog";
import VariantSelectionModal from "./child/VariantSelectionModal";
import "../assets/css/purchase-order.css";
import GlobalToast from "../utils/globalToast";

const POModalLayer = ({
  showModal,
  onClose,
  editingPO = null,
  onPOUpdated,
}) => {
  console.log("POModalLayer render", editingPO);
  // Consolidated form state
  const [formState, setFormState] = useState({
    formData: {
      poNo: "",
      supplierId: "",
      poDate: new Date(),
      expectedDeliveryDate: null,
      termsConditionId: "",
      remarks: "",
    },
    lineItems: [
      {
        id: uuidv4(),
        itemId: "",
        description: "",
        qty: "",
        uom: "",
        unitPrice: "",
        gstPercent: 0,
        amount: 0,
      },
    ],
    errors: {},
    isDirty: false,
  });

  // Consolidated master data state
  const [masterData, setMasterData] = useState({
    suppliers: [],
    termsConditions: [],
    filteredSuppliers: [],
  });

  // Consolidated UI state
  const [uiState, setUiState] = useState({
    loading: false, // false, 'saving', or 'submitting'
    supplierSearch: "",
    showSupplierDropdown: false,
    showConfirmDialog: false,
    showPreviewDialog: false,
  });

  // Variant selection modal state
  const [variantModalState, setVariantModalState] = useState({
    show: false,
    pendingItem: null, // Full item object from search
    pendingLineId: null, // The line item ID this variant is for
    isChange: false, // Whether this is changing an existing variant
  });

  // Items with their variants (keyed by itemId) - used in edit mode
  const [itemsWithVariants, setItemsWithVariants] = useState({});

  // Use global toast utility instead of local toast state
  const [pendingSuccessToast, setPendingSuccessToast] = useState(null);

  useEffect(() => {
    if (!showModal && pendingSuccessToast) {
      if (pendingSuccessToast.type === "success") {
        GlobalToast.success(pendingSuccessToast.message);
      } else if (pendingSuccessToast.type === "warning") {
        GlobalToast.warning(pendingSuccessToast.message);
      } else if (pendingSuccessToast.type === "info") {
        GlobalToast.info(pendingSuccessToast.message);
      } else {
        GlobalToast.error(pendingSuccessToast.message);
      }
      setPendingSuccessToast(null);
    }
  }, [showModal, pendingSuccessToast]);

  // Static options (moved outside state for better performance)
  const taxOptions = [
    { value: 0, label: "0%" },
    { value: 12, label: "12%" },
    { value: 18, label: "18%" },
  ];

  const initializeFormForEdit = useCallback(
    (po) => {
      if (po && masterData.suppliers.length > 0) {
        const selectedSupplier = masterData.suppliers.find(
          (s) => s.id === po.supplierId
        );

        const termsId =
          po.termsConditionId ?? po.termsConditionsId ?? po.terms_conditions_id ?? "";
        const remarks = po.remarks ?? po.remark ?? po.notes ?? "";

        // Map line items from backend shape to form shape
        const mappedLineItems = (po.lineItems || []).map((item) => {
          // quantity may be named `quantity` or `qty`
          const qtyRaw = item.quantity ?? item.qty ?? item.Qty ?? 0;
          const unitPriceRaw =
            item.unitPrice ?? item.unit_price ?? item.price ?? 0;

          // GST may be split into cgst/sgst or provided as gstPercent
          const cgst = item.cgst ?? item.CGST ?? 0;
          const sgst = item.sgst ?? item.SGST ?? 0;
          const gstPercentRaw =
            item.gstPercent ?? item.gst_percent ?? (cgst || sgst ? cgst + sgst : 0);

          const amountRaw =
            item.totalAmount ?? item.total_amount ?? item.amount ?? item.total ?? 0;

          return {
            id: uuidv4(),
              itemId: item.itemId ?? item.item_id ?? (item.id ?? item.itemId)?.toString?.() ?? "",
              // preserve separate code/name for child component display
              itemCode: item.itemCode ?? item.item_code ?? item.code ?? "",
              itemName: item.itemName ?? item.item_name ?? item.name ?? "",
              description: item.description ?? item.itemName ?? item.item_name ?? "",
              qty: String(qtyRaw ?? ""),
              // UOM fields - keep both id and name for dropdown building
              uom: item.uomName ?? item.uom ?? item.uom_name ?? "",
              uomId: item.uomId ?? item.uom_id ?? null,
              primaryUom: item.uomName ?? item.uom ?? item.uom_name ?? "",
              primaryUomId: item.uomId ?? item.uom_id ?? null,
              secondaryUom: item.secondaryUomName ?? item.secondaryUom ?? item.secondary_uom_name ?? "",
              secondaryUomId: item.secondaryUomId ?? item.secondary_uom_id ?? null,
              unitPrice: Number(unitPriceRaw) || 0,
              gstPercent: Number(gstPercentRaw) || 0,
              amount: Number(amountRaw) || 0,
              // Variant fields
              variantId: item.variantId ?? item.variant_id ?? null,
              variantAttributes: item.variantAttributes ?? item.variant_attributes ?? null,
          };
        });

        // Note: Items with variants are fetched in loadMasterData in parallel with suppliers/terms

        setFormState({
          formData: {
            poNo: po.poNo ?? po.poNumber ?? po.po_number ?? "",
            supplierId: po.supplierId ?? po.supplier_id ?? "",
            poDate: po.poDate ?? null,
            expectedDeliveryDate: po.deliveryDate ?? null,
            termsConditionId: termsId,
            remarks: remarks,
          },
          lineItems: mappedLineItems.length > 0 ? mappedLineItems : [
            {
              id: uuidv4(),
              itemId: "",
              description: "",
              qty: "",
              uom: "",
              unitPrice: 0,
              gstPercent: 0,
              amount: 0,
            },
          ],
          errors: {},
          isDirty: false, // Start with isDirty as false for edit mode
        });

        if (selectedSupplier) {
          setUiState((prev) => ({
            ...prev,
            supplierSearch: selectedSupplier.name,
            showSupplierDropdown: false,
          }));
        }
      }
    },
    [masterData.suppliers]
  );

  const initializeFormForNew = useCallback(() => {
    setFormState({
      formData: {
        // poNo removed for new PO, will be set by API
        supplierId: "",
        poDate: new Date(),
        expectedDeliveryDate: null,
        termsConditionId: "",
        remarks: "",
      },
      lineItems: [
        {
          id: uuidv4(),
          itemId: "",
          description: "",
          qty: "",
          uom: "",
          unitPrice: "",
          gstPercent: 0,
          amount: 0,
        },
      ],
      errors: {},
      isDirty: false, // Start with isDirty as false for new form
    });

    setUiState((prev) => ({
      ...prev,
      supplierSearch: "",
      showSupplierDropdown: false,
      openItemDropdown: null,
    }));
    // No PO number generation for new PO; API will handle it
  }, []);

  // Load master data when modal opens
  useEffect(() => {
    if (showModal) {
      loadMasterData();
    } else {
      // Reset form when modal closes
      setFormState({
        formData: {
          poNo: "",
          supplierId: "",
          poDate: new Date(),
          expectedDeliveryDate: null,
          termsConditionId: "",
          remarks: "",
        },
        lineItems: [
          {
            id: uuidv4(),
            itemId: "",
            description: "",
            qty: "",
            uom: "",
            unitPrice: "",
            gstPercent: 0,
            amount: 0,
          },
        ],
        errors: {},
        isDirty: false,
      });

      setUiState((prev) => ({
        ...prev,
        supplierSearch: "",
        showSupplierDropdown: false,
        showConfirmDialog: false,
      }));

      // Reset variant-related state
      setItemsWithVariants({});
      setVariantModalState({
        show: false,
        pendingItem: null,
        pendingLineId: null,
        isChange: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  // Initialize form when master data is loaded and modal is open
  useEffect(() => {
    if (showModal && masterData.suppliers.length > 0) {
      if (editingPO) {
        initializeFormForEdit(editingPO);
      } else {
        initializeFormForNew();
      }
    }
  }, [
    showModal,
    masterData.suppliers.length,
    editingPO,
    initializeFormForEdit,
    initializeFormForNew,
  ]);

  // Global toasts handle timing and auto-dismiss; pending success handled inline when needed

  // Filter suppliers based on search
  useEffect(() => {
    if (uiState.supplierSearch) {
      const filtered = masterData.suppliers.filter(
        (supplier) =>
          (supplier.name &&
            supplier.name
              .toLowerCase()
              .includes(uiState.supplierSearch.toLowerCase())) ||
          (supplier.code &&
            supplier.code
              .toLowerCase()
              .includes(uiState.supplierSearch.toLowerCase()))
      );
      setMasterData((prev) => ({ ...prev, filteredSuppliers: filtered }));
    } else {
      setMasterData((prev) => ({ ...prev, filteredSuppliers: prev.suppliers }));
    }
  }, [uiState.supplierSearch, masterData.suppliers]);

  // Note: items are fetched by the line-level search component; do not keep items/filteredItems in parent state.

  // Auto-calculate amounts when line items change
  useEffect(() => {
    const updatedLineItems = formState.lineItems.map((item) => {
      const qty = parseFloat(item.qty) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const gstPercent = item.gstPercent || 0;
      const amount = parseFloat(
        (qty * unitPrice * (1 + gstPercent / 100)).toFixed(2)
      );

      // Only update if the amount actually changed
      if (Math.abs(item.amount - amount) > 0.01) {
        return {
          ...item,
          amount,
        };
      }
      return item;
    });

    // Check if any items were actually updated
    const hasChanges = updatedLineItems.some(
      (updatedItem, index) =>
        updatedItem.amount !== formState.lineItems[index].amount
    );

    if (hasChanges) {
      setFormState((prev) => ({ ...prev, lineItems: updatedLineItems }));
    }
  }, [formState.lineItems]);

  const loadMasterData = async () => {
    try {
      setUiState((prev) => ({ ...prev, loading: true }));
      
      // Build list of API calls - always include suppliers and terms
      const apiCalls = [
        getSuppliers(),
        axiosInstance.get("/terms-conditions"),
      ];
      
      // If editing a PO, also fetch items with variants in parallel
      let itemIdsToFetch = [];
      if (editingPO?.lineItems?.length > 0) {
        itemIdsToFetch = [...new Set(
          editingPO.lineItems
            .map(li => li.itemId ?? li.item_id)
            .filter(id => id)
        )];
        if (itemIdsToFetch.length > 0) {
          apiCalls.push(getItemsByIds(itemIdsToFetch));
        }
      }
      
      const responses = await Promise.all(apiCalls);
      const [suppliersResponse, termsConditionsResponse] = responses;
      
      // Handle items response if we fetched items
      if (itemIdsToFetch.length > 0 && responses[2]) {
        const itemsResponse = responses[2];
        const itemsData = Array.isArray(itemsResponse) 
          ? itemsResponse 
          : (itemsResponse?.data || itemsResponse?.content || []);
        
        const itemsMap = {};
        itemsData.forEach(item => {
          itemsMap[item.id] = item;
        });
        setItemsWithVariants(itemsMap);
      }

      setMasterData((prev) => ({
        ...prev,
        suppliers: suppliersResponse.content || suppliersResponse.data || suppliersResponse || [],
        // Do NOT load items here. Items will be fetched via search when user types.
        termsConditions: termsConditionsResponse.data?.content || termsConditionsResponse.data?.data || termsConditionsResponse.data || [],
      }));
    } catch (error) {
      GlobalToast.error("Failed to load master data. Please try again.");
      console.error("Error loading master data:", error);
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };


  const handleInputChange = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: "" },
    }));
  }, []);

  const handleLineItemChange = useCallback(
    (id, field, value) => {
      setFormState((prev) => {
        // Find the index of the item being changed to clear its error
        const itemIndex = prev.lineItems.findIndex(item => item.id === id);
        
        // Determine which error key to clear based on the field
        let errorKeyToClear = null;
        if (field === "itemId") {
          errorKeyToClear = `item_${itemIndex}`;
        } else if (field === "qty") {
          errorKeyToClear = `qty_${itemIndex}`;
        } else if (field === "unitPrice") {
          errorKeyToClear = `unitPrice_${itemIndex}`;
        }
        
        // Create new errors object without the cleared error
        const newErrors = { ...prev.errors };
        if (errorKeyToClear && newErrors[errorKeyToClear]) {
          delete newErrors[errorKeyToClear];
        }
        // Also clear the general lineItems error if any field is being filled
        if (newErrors.lineItems) {
          delete newErrors.lineItems;
        }
        
        return {
          ...prev,
          lineItems: prev.lineItems.map((item) => {
            if (item.id === id) {
              // Only set the field value here; full item metadata should come from the child's select callback (`selectItem`)
              const updatedItem = { ...item, [field]: value };
              return updatedItem;
            }
            return item;
          }),
          isDirty: true,
          errors: newErrors,
        };
      });
    },
    []
  );

  const addLineItem = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: uuidv4(),
          itemId: "",
          description: "",
          qty: "",
          uom: "",
          unitPrice: "",
          gstPercent: 0,
          amount: 0,
        },
      ],
    }));
  }, []);

  const removeLineItem = useCallback(
    (id) => {
      if (formState.lineItems.length > 1) {
        setFormState((prev) => ({
          ...prev,
          lineItems: prev.lineItems.filter((item) => item.id !== id),
        }));
      } else {
        GlobalToast.error("At least one line item is required.");
      }
    },
    [formState.lineItems.length]
  );

  const validateForm = useCallback(
    (isSubmit = false) => {
      const newErrors = {};

      if (!formState.formData.supplierId)
        newErrors.supplierId = "Supplier is required";

      if (!formState.formData.termsConditionId)
        newErrors.termsConditionId = "Terms and Conditions is required";

      if (!formState.formData.poDate) {
        newErrors.poDate = "PO Date is required";
      } else {
        const poDate = new Date(formState.formData.poDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Allow past PO dates when editing an existing PO (user may have created it earlier).
        // In add mode the datepicker prevents past selection, so only validate for new PO.
        if (!editingPO && poDate < today) {
          newErrors.poDate = "PO Date cannot be in the past";
        }
      }

      if (!formState.formData.expectedDeliveryDate) {
        newErrors.expectedDeliveryDate = "Expected Delivery Date is required";
      } else {
        const poDate = new Date(formState.formData.poDate);
        const deliveryDate = new Date(formState.formData.expectedDeliveryDate);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        // Check if delivery date is in the future (at least tomorrow)
        if (deliveryDate < tomorrow) {
          newErrors.expectedDeliveryDate =
            "Expected Delivery Date must be in the future";
        } else if (formState.formData.poDate && deliveryDate <= poDate) {
          newErrors.expectedDeliveryDate =
            "Expected Delivery Date must be after PO Date";
        }
      }

      if (
        formState.formData.remarks &&
        formState.formData.remarks.length > 500
      ) {
        newErrors.remarks = "Remarks cannot exceed 500 characters";
      }

      // Validate line items
      formState.lineItems.forEach((item, index) => {
        if (!item.itemId) newErrors[`item_${index}`] = "Item is required";
        const qty = parseFloat(item.qty);
        const unitPrice = parseFloat(item.unitPrice);
        if (item.qty === "" || isNaN(qty) || qty < 1)
          newErrors[`qty_${index}`] = "Quantity must be at least 1";
        if (item.unitPrice === "" || isNaN(unitPrice) || unitPrice < 0.01)
          newErrors[`unitPrice_${index}`] = "Unit Price must be at least 0.01";
      });

      if (
        isSubmit &&
        formState.lineItems.some(
          (item) => {
            const qty = parseFloat(item.qty);
            const unitPrice = parseFloat(item.unitPrice);
            return !item.itemId || item.qty === "" || isNaN(qty) || qty < 1 || item.unitPrice === "" || isNaN(unitPrice) || unitPrice < 0.01;
          }
        )
      ) {
        newErrors.lineItems =
          "Please complete all line items with valid quantities and prices";
      }

      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return Object.keys(newErrors).length === 0;
    },
    [formState.formData, formState.lineItems, editingPO]
  );

  const calculateTotals = useCallback(() => {
    const subtotal = formState.lineItems.reduce(
      (sum, item) => sum + (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0),
      0
    );
    const totalTax = formState.lineItems.reduce((sum, item) => {
      const gstPercent = item.gstPercent || 0;
      return sum + ((parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0) * gstPercent) / 100;
    }, 0);
    const grandTotal = subtotal + totalTax;
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(totalTax.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  }, [formState.lineItems]);

  const resetForm = () => {
    setFormState({
      formData: {
        poNo: "",
        supplierId: "",
        poDate: new Date(),
        expectedDeliveryDate: null,
        termsConditionId: "",
        remarks: "",
      },
      lineItems: [
        {
          id: uuidv4(),
          itemId: "",
          description: "",
          qty: "",
          uom: "",
          unitPrice: "",
          gstPercent: 0,
          amount: 0,
        },
      ],
      errors: {},
      isDirty: false,
    });

    setUiState((prev) => ({
      ...prev,
      supplierSearch: "",
      showSupplierDropdown: false,
    }));
  };

  const handleSaveDraft = async () => {
    // For draft saving, use comprehensive validation but show specific error messages
    if (!validateForm(false)) {
      GlobalToast.error("Please fix the validation errors before saving as draft.");
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, loading: "saving" }));
      const totals = calculateTotals();

      // Get supplier details
      const selectedSupplier = masterData.suppliers.find(
        (s) => s.id === formState.formData.supplierId
      );

      // Get terms and conditions details
      const selectedTerms = masterData.termsConditions.find(
        (tc) => tc.id === parseInt(formState.formData.termsConditionId)
      );

      // Format line items to match API structure (include tax percentages and values)
      // Determine if IGST is applicable based on selected supplier
      const supplierForDraft = masterData.suppliers.find(
        (s) => s.id === formState.formData.supplierId
      );
      const isIgstForDraft = supplierForDraft?.igstApplicable || false;

      const formattedLineItems = formState.lineItems.map((item) => {
        // Prefer uomId/uom set on the line (populated by child `selectItem`); fallback to secondaryUomId if needed
        const chosenUomName = item.uom || item.uomName || "";
        let chosenUomId = (item.uomId !== undefined && item.uomId !== null)
          ? item.uomId
          : (item.secondaryUomId !== undefined && item.secondaryUomId !== null) ? item.secondaryUomId : 0;

        // If line explicitly set secondaryUomId and the chosen name matches secondary, prefer secondary id
        if ((item.secondaryUomId !== undefined && item.secondaryUomId !== null) && item.secondaryUom && chosenUomName === item.secondaryUom) {
          chosenUomId = item.secondaryUomId;
        }

        const gstPercent = parseFloat(item.gstPercent || 0) || 0;
        const quantity = parseFloat(item.qty) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const taxableBase = quantity * unitPrice;

        let cgst = 0, sgst = 0, igst = 0;
        let cgstValue = 0, sgstValue = 0, igstValue = 0;

        if (isIgstForDraft) {
          // IGST: full GST percentage
          igst = gstPercent;
          igstValue = +(taxableBase * gstPercent / 100) || 0;
        } else {
          // SGST/CGST: split GST percentage by 2
          const halfGstPercent = gstPercent / 2;
          cgst = halfGstPercent;
          sgst = halfGstPercent;
          cgstValue = +(taxableBase * halfGstPercent / 100) || 0;
          sgstValue = +(taxableBase * halfGstPercent / 100) || 0;
        }

        const taxValue = +(cgstValue + sgstValue + igstValue) || 0;

        return {
          itemId: parseInt(item.itemId) || 0,
          itemCode: item.itemCode || "",
          itemName: item.itemName || "",
          uomId: parseInt(chosenUomId) || 0,
          uomName: chosenUomName || "",
          description: item.description || "",
          quantity: quantity,
          unitPrice: unitPrice,
          cgst: isIgstForDraft ? null : cgst,
          sgst: isIgstForDraft ? null : sgst,
          igst: isIgstForDraft ? igst : null,
          cgstValue: isIgstForDraft ? null : parseFloat(cgstValue.toFixed(2)),
          sgstValue: isIgstForDraft ? null : parseFloat(sgstValue.toFixed(2)),
          igstValue: isIgstForDraft ? parseFloat(igstValue.toFixed(2)) : null,
          taxValue: parseFloat(taxValue.toFixed(2)),
          totalAmount: parseFloat((item.amount || 0).toFixed(2)),
          // Variant fields
          variantId: item.variantId || null,
          variantAttributes: item.variantAttributes || null,
        };
      });

      // Format dates to YYYY-MM-DD
      const formatDateForAPI = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      // Compute total IGST for order level
      const totalIgstValue = isIgstForDraft
        ? formattedLineItems.reduce((sum, item) => sum + (item.igstValue || 0), 0)
        : 0;

      const poData = {
        supplierId: formState.formData.supplierId || 0,
        supplierName: selectedSupplier?.name || "",
        poDate: formatDateForAPI(formState.formData.poDate),
        deliveryDate: formatDateForAPI(formState.formData.expectedDeliveryDate),
        status: "Draft",
        subtotal: totals.subtotal,
        tax: totals.tax, // backend expects `tax`
        // Include order-level SGST/CGST/IGST values
        sgstValue: isIgstForDraft ? null : parseFloat(taxBreakdown.sgst.toFixed(2)),
        cgstValue: isIgstForDraft ? null : parseFloat(taxBreakdown.cgst.toFixed(2)),
        igstValue: isIgstForDraft ? parseFloat(totalIgstValue.toFixed(2)) : null,
        grandTotal: totals.grandTotal,
        lineItems: formattedLineItems,
        termsConditionsId: parseInt(formState.formData.termsConditionId) || 0,
        termsConditionsTitle: selectedTerms?.name || "",
        remarks: formState.formData.remarks || "",
      };

      if (editingPO) {
        await updatePurchaseOrder(editingPO.id, { ...poData, poNumber: formState.formData.poNo });
        setPendingSuccessToast({ message: "Purchase Order updated as draft.", type: "success" });
      } else {
        // Do not send poNumber for create
        await createPurchaseOrder(poData);
        setPendingSuccessToast({ message: "Purchase Order saved as draft.", type: "success" });
      }

      resetForm();
      onPOUpdated();
      onClose();
    } catch (error) {
      GlobalToast.error("Failed to save draft. Please try again.");
      console.error("Error saving draft:", error);
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Validate and show preview dialog
  const handleSubmit = () => {
    // Field-by-field validation in order of input placement (similar to supplier dialog)

    // 1. Supplier
    if (!formState.formData.supplierId) {
      GlobalToast.error("Supplier is required.");
      return;
    }

    // 2. PO Date
    if (!formState.formData.poDate) {
      GlobalToast.error("PO Date is required.");
      return;
    } else {
      const poDate = new Date(formState.formData.poDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Allow past PO dates while editing existing PO; enforce only when creating new PO
        if (!editingPO && poDate < today) {
          GlobalToast.error("PO Date cannot be in the past.");
          return;
        }
    }

    // 3. Expected Delivery Date
    if (!formState.formData.expectedDeliveryDate) {
      GlobalToast.error("Expected Delivery Date is required.");
      return;
    } else {
      const poDate = new Date(formState.formData.poDate);
      const deliveryDate = new Date(formState.formData.expectedDeliveryDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      // Check if delivery date is in the future (at least tomorrow)
        if (deliveryDate < tomorrow) {
          GlobalToast.error("Expected Delivery Date must be in the future.");
          return;
        } else if (formState.formData.poDate && deliveryDate <= poDate) {
          GlobalToast.error("Expected Delivery Date must be after PO Date");
          return;
        }
    }

    // 4. Terms & Conditions
    if (!formState.formData.termsConditionId) {
      GlobalToast.error("Terms and Conditions is required.");
      return;
    }

    // 5. Remarks validation
    if (
      formState.formData.remarks &&
      formState.formData.remarks.length > 500
    ) {
      GlobalToast.error("Remarks cannot exceed 500 characters.");
      return;
    }

    // 6. Line items validation
    for (let index = 0; index < formState.lineItems.length; index++) {
      const item = formState.lineItems[index];
      const qty = parseFloat(item.qty);
      const unitPrice = parseFloat(item.unitPrice);
      if (!item.itemId) {
        GlobalToast.error(`Line item ${index + 1}: Item is required.`);
        return;
      }
      if (item.qty === "" || isNaN(qty) || qty < 1) {
        GlobalToast.error(`Line item ${index + 1}: Quantity must be at least 1.`);
        return;
      }
      if (item.unitPrice === "" || isNaN(unitPrice) || unitPrice < 0.01) {
        GlobalToast.error(`Line item ${index + 1}: Unit Price must be at least 0.01.`);
        return;
      }
    }

    // All validations passed, show preview dialog
    setUiState((prev) => ({ ...prev, showPreviewDialog: true }));
  };

  // Confirm and submit from preview dialog
  const confirmSubmit = async () => {
    try {
      setUiState((prev) => ({ ...prev, loading: "submitting" }));
      const totals = calculateTotals();

      // Get supplier details
      const selectedSupplier = masterData.suppliers.find(
        (s) => s.id === formState.formData.supplierId
      );

      // Get terms and conditions details
      const selectedTerms = masterData.termsConditions.find(
        (tc) => tc.id === parseInt(formState.formData.termsConditionId)
      );

      // Format line items to match API structure (include tax percentages and values)
      // Determine if IGST is applicable based on selected supplier
      const isIgstForSubmit = selectedSupplier?.igstApplicable || false;

      const formattedLineItems = formState.lineItems.map((item) => {
        // Prefer uomId/uom set on the line (populated by child `selectItem`); fallback to secondaryUomId if needed
        const chosenUomName = item.uom || item.uomName || "";
        let chosenUomId = (item.uomId !== undefined && item.uomId !== null)
          ? item.uomId
          : (item.secondaryUomId !== undefined && item.secondaryUomId !== null) ? item.secondaryUomId : 0;

        if ((item.secondaryUomId !== undefined && item.secondaryUomId !== null) && item.secondaryUom && chosenUomName === item.secondaryUom) {
          chosenUomId = item.secondaryUomId;
        }

        const gstPercent = parseFloat(item.gstPercent || 0) || 0;
        const quantity = parseFloat(item.qty) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const taxableBase = quantity * unitPrice;

        let cgst = 0, sgst = 0, igst = 0;
        let cgstValue = 0, sgstValue = 0, igstValue = 0;

        if (isIgstForSubmit) {
          // IGST: full GST percentage
          igst = gstPercent;
          igstValue = +(taxableBase * gstPercent / 100) || 0;
        } else {
          // SGST/CGST: split GST percentage by 2
          const halfGstPercent = gstPercent / 2;
          cgst = halfGstPercent;
          sgst = halfGstPercent;
          cgstValue = +(taxableBase * halfGstPercent / 100) || 0;
          sgstValue = +(taxableBase * halfGstPercent / 100) || 0;
        }

        const taxValue = +(cgstValue + sgstValue + igstValue) || 0;

        return {
          itemId: parseInt(item.itemId) || 0,
          itemCode: item.itemCode || "",
          itemName: item.itemName || "",
          uomId: parseInt(chosenUomId) || 0,
          uomName: chosenUomName || "",
          description: item.description || "",
          quantity: quantity,
          unitPrice: unitPrice,
          cgst: isIgstForSubmit ? null : cgst,
          sgst: isIgstForSubmit ? null : sgst,
          igst: isIgstForSubmit ? igst : null,
          cgstValue: isIgstForSubmit ? null : parseFloat(cgstValue.toFixed(2)),
          sgstValue: isIgstForSubmit ? null : parseFloat(sgstValue.toFixed(2)),
          igstValue: isIgstForSubmit ? parseFloat(igstValue.toFixed(2)) : null,
          taxValue: parseFloat(taxValue.toFixed(2)),
          totalAmount: parseFloat((item.amount || 0).toFixed(2)),
          // Variant fields
          variantId: item.variantId || null,
          variantAttributes: item.variantAttributes || null,
        };
      });

      // Format dates to YYYY-MM-DD
      const formatDateForAPI = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().split('T')[0];
      };

      // Compute total IGST for order level
      const totalIgstValue = isIgstForSubmit
        ? formattedLineItems.reduce((sum, item) => sum + (item.igstValue || 0), 0)
        : 0;

      const poData = {
        supplierId: formState.formData.supplierId || 0,
        supplierName: selectedSupplier?.name || "",
        poDate: formatDateForAPI(formState.formData.poDate),
        deliveryDate: formatDateForAPI(formState.formData.expectedDeliveryDate),
        status: "AwaitApproval",
        subtotal: totals.subtotal,
        tax: totals.tax,
        sgstValue: isIgstForSubmit ? null : parseFloat(taxBreakdown.sgst.toFixed(2)),
        cgstValue: isIgstForSubmit ? null : parseFloat(taxBreakdown.cgst.toFixed(2)),
        igstValue: isIgstForSubmit ? parseFloat(totalIgstValue.toFixed(2)) : null,
        grandTotal: totals.grandTotal,
        lineItems: formattedLineItems,
        termsConditionsId: parseInt(formState.formData.termsConditionId) || 0,
        termsConditionsTitle: selectedTerms?.name || "",
        remarks: formState.formData.remarks || "",
      };

      if (editingPO && editingPO.id) {
        // Ensure update is called for existing PO
        await updatePurchaseOrder(editingPO.id, { ...poData, poNumber: formState.formData.poNo });
        GlobalToast.success("Purchase Order updated and submitted for approval.");
      } else {
        // Create new PO when not editing
        await createPurchaseOrder(poData);
        GlobalToast.success("Purchase Order submitted for approval.");
      }

      // Close both dialogs and reset
      setUiState((prev) => ({ ...prev, showPreviewDialog: false }));
      resetForm();
      onPOUpdated();
      onClose();
    } catch (error) {
      GlobalToast.error("Failed to submit Purchase Order. Please try again.");
      console.error("Error submitting PO:", error);
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Helper to enrich line items with itemName and itemCode
  const getLineItemsWithNames = (lineItems) => {
    return lineItems.map((item) => ({
      ...item,
      itemCode: item.itemCode || "",
      itemName: item.itemName || "",
    }));
  };

  // Close preview dialog
  const closePreviewDialog = () => {
    setUiState((prev) => ({ ...prev, showPreviewDialog: false }));
  };

  const handleCancel = () => {
    if (formState.isDirty) {
      setUiState((prev) => ({ ...prev, showConfirmDialog: true }));
    } else {
      onClose();
    }
  };

  const handleCloseModal = () => {
    if (formState.isDirty) {
      setUiState((prev) => ({ ...prev, showConfirmDialog: true }));
    } else {
      onClose();
    }
  };

  const handleConfirmDialog = (confirmed) => {
    if (confirmed) {
      resetForm();
      setUiState((prev) => ({ ...prev, showConfirmDialog: false }));
      onClose();
    } else {
      setUiState((prev) => ({ ...prev, showConfirmDialog: false }));
    }
  };

  const selectSupplier = (supplier) => {
    handleInputChange("supplierId", supplier.id);
    setUiState((prev) => ({
      ...prev,
      supplierSearch: supplier.name,
      showSupplierDropdown: false,
    }));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".position-relative")) {
        setUiState((prev) => ({
          ...prev,
          showSupplierDropdown: false,
        }));
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showModal]);

  const selectItem = (itemId, lineItemId) => {
    // deprecated signature: if called with primitive id, set only itemId
    if (typeof itemId !== 'object') {
      handleLineItemChange(lineItemId, "itemId", itemId);
      return;
    }

    // When passed full item object, check if it has variants
    const item = itemId;
    const variants = (item.variants || []).filter(v => v.isActive !== false);
    
    // Always store item in itemsWithVariants for "Change Variant" functionality
    setItemsWithVariants(prev => ({
      ...prev,
      [item.id]: item
    }));
    
    // If item has multiple variants, show variant selection modal
    if (variants.length > 1) {
      // Show variant selection modal
      setVariantModalState({
        show: true,
        pendingItem: item,
        pendingLineId: lineItemId,
        isChange: false,
      });
      return;
    }
    
    // If item has exactly one variant, auto-select it
    const selectedVariant = variants.length === 1 ? variants[0] : null;
    
    // Populate line item with item and variant data
    populateLineItemWithVariant(lineItemId, item, selectedVariant);
  };

  // Helper function to populate line item after variant selection
  const populateLineItemWithVariant = (lineItemId, item, variant) => {
    handleLineItemChange(lineItemId, "itemId", item.id);
    // Also store display code/name for child input value and future edits
    handleLineItemChange(lineItemId, "itemCode", item.itemCode ?? item.code ?? "");
    handleLineItemChange(lineItemId, "itemName", item.itemName ?? item.name ?? "");
    
    // Store variant info
    handleLineItemChange(lineItemId, "variantId", variant?.id ?? null);
    handleLineItemChange(lineItemId, "variantAttributes", variant?.attributes ?? null);
    
    // Build description including variant attributes
    const descriptionParts = [];
    if (item.itemName) descriptionParts.push(item.itemName);
    const categoryInfo = [];
    if (item.subCategoryName) categoryInfo.push(item.subCategoryName);
    if (item.itemTypeName) categoryInfo.push(item.itemTypeName);
    if (categoryInfo.length > 0) descriptionParts.push(`(${categoryInfo.join(" - ")})`);

    // Include variant attributes in description
    const attrs = variant?.attributes || item.attributes;
    if (attrs && typeof attrs === 'object') {
      const attributeStrings = Object.entries(attrs)
        .filter(([key, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => {
          const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
          return `${formattedKey}: ${value}`;
        });
      if (attributeStrings.length > 0) descriptionParts.push(`[${attributeStrings.join(', ')}]`);
    }

    handleLineItemChange(lineItemId, "description", descriptionParts.join(' '));
    // Store master primary/secondary UOMs on the line (preserve originals)
    handleLineItemChange(lineItemId, "primaryUom", item.uomName || item.uom || "");
    handleLineItemChange(lineItemId, "primaryUomId", item.uomId !== undefined ? item.uomId : null);
    handleLineItemChange(lineItemId, "secondaryUom", item.secondaryUomName || item.secondaryUom || "");
    handleLineItemChange(lineItemId, "secondaryUomId", item.secondaryUomId !== undefined ? item.secondaryUomId : null);
    // Set the chosen UOM (defaults to primary)
    handleLineItemChange(lineItemId, "uom", item.uomName || item.uom || "");
    handleLineItemChange(lineItemId, "uomId", item.uomId !== undefined ? item.uomId : null);
    // unitPrice may be provided under different keys
    handleLineItemChange(lineItemId, "unitPrice", item.unitPrice ?? item.price ?? item.rate ?? 0);
    // gstPercent may be provided or may need to be derived from cgst+sgst
    const gst = item.gstPercent ?? item.gst ?? ((item.cgst || 0) + (item.sgst || 0));
    handleLineItemChange(lineItemId, "gstPercent", gst || 0);
    // Recalculate amount will run in existing effect
  };

  // Handle variant selection from modal
  const handleVariantSelect = (item, variant) => {
    if (variantModalState.pendingLineId) {
      populateLineItemWithVariant(variantModalState.pendingLineId, item, variant);
    }
    // Close the modal
    setVariantModalState({
      show: false,
      pendingItem: null,
      pendingLineId: null,
      isChange: false,
    });
  };

  // Handle closing variant modal (cancel selection)
  const handleVariantModalClose = () => {
    setVariantModalState({
      show: false,
      pendingItem: null,
      pendingLineId: null,
      isChange: false,
    });
  };

  // Handle "Change Variant" button click from POLineItemsTable
  const handleChangeVariant = (lineId, itemId) => {
    const item = itemsWithVariants[itemId];
    if (!item) {
      console.warn("Item not found in itemsWithVariants for changing variant");
      return;
    }
    
    // Find current variantId for this line
    const lineItem = formState.lineItems.find(li => li.id === lineId);
    const currentVariantId = lineItem?.variantId;
    
    setVariantModalState({
      show: true,
      pendingItem: item,
      pendingLineId: lineId,
      isChange: true,
      currentVariantId,
    });
  };

  const { subtotal, grandTotal } = calculateTotals();

  // Compute SGST/CGST breakdown separately for the footer (keep calculateTotals for compatibility)
  const taxBreakdown = formState.lineItems.reduce(
    (acc, item) => {
      const qty = parseFloat(item.qty) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const base = qty * unitPrice;
      // Prefer explicit sgst/cgst percents if present, otherwise split gstPercent evenly
      const sgstPercent =
        item.sgstPercent !== undefined && item.sgstPercent !== null
          ? parseFloat(item.sgstPercent) || 0
          : null;
      const cgstPercent =
        item.cgstPercent !== undefined && item.cgstPercent !== null
          ? parseFloat(item.cgstPercent) || 0
          : null;

      let sgstAmount = 0;
      let cgstAmount = 0;

      if (sgstPercent !== null || cgstPercent !== null) {
        sgstAmount = (base * (sgstPercent || 0)) / 100;
        cgstAmount = (base * (cgstPercent || 0)) / 100;
      } else {
        const gstPercent = parseFloat(item.gstPercent || 0) || 0;
        sgstAmount = (base * gstPercent) / 200; // half
        cgstAmount = (base * gstPercent) / 200; // half
      }

      acc.sgst += sgstAmount;
      acc.cgst += cgstAmount;
      return acc;
    },
    { sgst: 0, cgst: 0 }
  );

  // Determine if IGST is applicable based on selected supplier
  const selectedSupplierForIgst = masterData.suppliers.find(
    (s) => s.id === formState.formData.supplierId
  );
  const isIgstApplicable = selectedSupplierForIgst?.igstApplicable || false;

  // Helper functions for child components
  const setSupplierSearch = useCallback((value) => {
    setUiState((prev) => ({ ...prev, supplierSearch: value }));
  }, []);

  const setShowSupplierDropdown = useCallback((value) => {
    setUiState((prev) => ({ ...prev, showSupplierDropdown: value }));
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div
      className={`modal fade ${showModal ? "show d-block" : ""}`}
      style={{
        backgroundColor: showModal ? "rgba(0,0,0,0.5)" : "transparent",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
        overflowY: "auto"
      }}
      data-bs-backdrop="static"
    >
      <div
        className="modal-dialog"
        style={{ maxWidth: "1700px", width: "98%", height: "85vh", maxHeight: "85vh" }}
      >
        <div
          className="modal-content radius-16 bg-base h-100"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="modal-header py-12 px-20 border border-top-0 border-start-0 border-end-0"
            style={{ flexShrink: 0 }}
          >
            <div className="d-flex align-items-center gap-3">
              <h1 className="modal-title fs-5" id="poModalLabel">
                {editingPO ? (editingPO.poNo || editingPO.poNumber || "PO") : "New Purchase Order"}
              </h1>
              {editingPO && editingPO.status && (
                <span
                  className={`px-12 py-4 rounded-pill fw-bold text-xs ${
                    editingPO.status === "Draft"
                      ? "bg-primary-300 text-info-main"
                      : editingPO.status === "Rejected"
                      ? "bg-danger-300 text-danger-main"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {editingPO.status}
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={handleCloseModal}
              aria-label="Close"
            />
          </div>

          {/* Container for body and footer with relative positioning for overlay */}
          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {/* Loading overlay - covers only body and footer (skip when submitting from preview) */}
            {uiState.loading && uiState.loading !== "submitting" && (
              <div className="po-modal-loading-overlay">
                <div className="text-center">
                  <div
                    className="spinner-border text-primary mb-3"
                    style={{ width: "3rem", height: "3rem" }}
                    role="status"
                  >
                    <span className="visually-hidden">
                      {uiState.loading === "saving" ? "Saving draft..." : "Loading..."}
                    </span>
                  </div>
                  <h6 className="text-muted">
                    {uiState.loading === "saving"
                      ? "Saving draft..."
                      : uiState.loading === true
                      ? "Loading master data..."
                      : "Please wait..."}
                  </h6>
                </div>
              </div>
            )}

            <div
              className="modal-body p-20"
              style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
            >
              <POHeaderSection
                formData={formState.formData}
                errors={formState.errors}
                supplierSearch={uiState.supplierSearch}
                setSupplierSearch={setSupplierSearch}
                showSupplierDropdown={uiState.showSupplierDropdown}
                setShowSupplierDropdown={setShowSupplierDropdown}
                filteredSuppliers={masterData.filteredSuppliers}
                selectSupplier={selectSupplier}
                handleInputChange={handleInputChange}
                termsConditions={masterData.termsConditions}
                loading={uiState.loading}
              />
              <POLineItemsTable
                lineItems={formState.lineItems}
                errors={formState.errors}
                filteredItems={[]}
                itemsMaster={[]}
                selectItem={selectItem}
                handleLineItemChange={handleLineItemChange}
                addLineItem={addLineItem}
                removeLineItem={removeLineItem}
                taxOptions={taxOptions}
                loading={uiState.loading}
                isIgstApplicable={isIgstApplicable}
                onChangeVariant={handleChangeVariant}
                itemsWithVariants={itemsWithVariants}
              />
              <POFooterSummary
                subtotal={subtotal}
                sgst={taxBreakdown.sgst}
                cgst={taxBreakdown.cgst}
                grandTotal={grandTotal}
                lineItems={formState.lineItems}
                isIgstApplicable={isIgstApplicable}
              />
            </div>
            <div
              className="modal-footer p-16 border border-top border-start-0 border-end-0 border-bottom-0"
              style={{ flexShrink: 0 }}
            >
              <POActionButtons
                loading={uiState.loading}
                handleCancel={handleCancel}
                handleSaveDraft={handleSaveDraft}
                handleSubmit={handleSubmit}
                isDirty={formState.isDirty}
              />
            </div>
          </div>

          {/* Confirmation Dialog */}
          {uiState.showConfirmDialog && (
            <div
              className="modal fade show d-block"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-sm modal-dialog-centered">
                <div className="modal-content radius-16 bg-base">
                  <div className="modal-body p-24 text-center">
                    <div className="mb-16">
                      <Icon
                        icon="mingcute:alert-line"
                        className="text-warning text-4xl"
                      />
                    </div>
                    <h6 className="text-lg text-neutral-900 mb-8">
                      Unsaved Changes
                    </h6>
                    <p className="text-sm text-neutral-600 mb-24">
                      You have unsaved changes. Are you sure you want to cancel?
                    </p>
                    <div className="d-flex align-items-center justify-content-center gap-3">
                      <button
                        type="button"
                        className="border border-neutral-300 bg-hover-neutral-100 text-neutral-600 text-md px-32 py-11 radius-8"
                        onClick={() => handleConfirmDialog(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger border border-danger-600 text-md px-32 py-12 radius-8"
                        onClick={() => handleConfirmDialog(true)}
                      >
                        Proceed
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Dialog */}
            <POPreviewDialog
            show={uiState.showPreviewDialog}
            onClose={closePreviewDialog}
            onSubmit={confirmSubmit}
            editingPO={editingPO}
            formData={formState.formData}
              lineItems={getLineItemsWithNames(formState.lineItems)}
            suppliers={masterData.suppliers}
            termsConditions={masterData.termsConditions}
            totals={calculateTotals()}
            loading={uiState.loading === "submitting"}
            isIgstApplicable={isIgstApplicable}
          />

          {/* Variant Selection Modal */}
          <VariantSelectionModal
            show={variantModalState.show}
            item={variantModalState.pendingItem}
            onSelect={handleVariantSelect}
            onClose={handleVariantModalClose}
            selectedVariantId={variantModalState.isChange ? variantModalState.currentVariantId : null}
          />

          {/* GlobalToast handles toasts centrally */}
        </div>
      </div>
    </div>
  );
};

export default POModalLayer;
