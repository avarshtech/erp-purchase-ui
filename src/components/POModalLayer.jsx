import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import { makeRequest } from "../mocks/server";
import POHeaderSection from "./child/POHeaderSection";
import POLineItemsTable from "./child/POLineItemsTable";
import POFooterSummary from "./child/POFooterSummary";
import POActionButtons from "./child/POActionButtons";
import "../assets/css/supplier-info.css";

const POModalLayer = ({
  showModal,
  onClose,
  editingPO = null,
  onPOUpdated,
}) => {
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
        qty: 1,
        uom: "",
        unitPrice: 0,
        sgstPercent: 0,
        cgstPercent: 0,
        amount: 0,
      },
    ],
    errors: {},
    isDirty: false,
  });

  // Consolidated master data state
  const [masterData, setMasterData] = useState({
    suppliers: [],
    items: [],
    termsConditions: [],
    filteredSuppliers: [],
    filteredItems: [],
  });

  // Consolidated UI state
  const [uiState, setUiState] = useState({
    loading: false, // false, 'saving', or 'submitting'
    supplierSearch: "",
    showSupplierDropdown: false,
    showConfirmDialog: false,
  });

  // Static options (moved outside state for better performance)
  const taxOptions = [
    { value: 0, label: "0%" },
    { value: 5, label: "5%" },
    { value: 10, label: "10%" },
    { value: 18, label: "18%" },
  ];

  const initializeFormForEdit = useCallback(
    (po) => {
      if (po && masterData.suppliers.length > 0) {
        const selectedSupplier = masterData.suppliers.find(
          (s) => s.id === po.supplierId
        );
        setFormState({
          formData: {
            poNo: po.poNo,
            supplierId: po.supplierId,
            poDate: new Date(po.poDate),
            expectedDeliveryDate: new Date(po.expectedDeliveryDate),
            termsConditionId: po.termsConditionId || "",
            remarks: po.remarks || "",
          },
          lineItems: po.lineItems
            ? po.lineItems.map((item) => ({ ...item, id: uuidv4() }))
            : [],
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
          qty: 1,
          uom: "",
          unitPrice: 0,
          sgstPercent: 0,
          cgstPercent: 0,
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

    generatePONumber();
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
            qty: 1,
            uom: "",
            unitPrice: 0,
            sgstPercent: 0,
            cgstPercent: 0,
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
    }
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

  // Initialize filtered items when items are loaded
  useEffect(() => {
    setMasterData((prev) => ({ ...prev, filteredItems: prev.items }));
  }, [masterData.items]);

  // Auto-calculate amounts when line items change
  useEffect(() => {
    const updatedLineItems = formState.lineItems.map((item) => {
      const totalTaxPercent = item.sgstPercent + item.cgstPercent;
      const amount = parseFloat(
        (item.qty * item.unitPrice * (1 + totalTaxPercent / 100)).toFixed(2)
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
      const [suppliersResponse, itemsResponse, termsConditionsResponse] =
        await Promise.all([
          makeRequest("GET", "/suppliers"),
          makeRequest("GET", "/items"),
          makeRequest("GET", "/terms-conditions"),
        ]);
      setMasterData((prev) => ({
        ...prev,
        suppliers: suppliersResponse.data,
        items: itemsResponse.data,
        termsConditions: termsConditionsResponse.data,
      }));
    } catch (error) {
      toast.error("Failed to load master data");
      console.error("Error loading master data:", error);
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  const generatePONumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const sequence = String(Math.floor(Math.random() * 9999) + 1).padStart(
      4,
      "0"
    );
    const poNo = `PO-${year}${month}${day}-${sequence}`;
    setFormState((prev) => ({
      ...prev,
      formData: { ...prev.formData, poNo },
      // Don't set isDirty: true for auto-generated PO number
    }));
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
      setFormState((prev) => ({
        ...prev,
        lineItems: prev.lineItems.map((item) => {
          if (item.id === id) {
            const updatedItem = { ...item, [field]: value };

            // Auto-fill item details if item is selected
            if (field === "itemId" && value) {
              const selectedItem = masterData.items.find(
                (i) => i.id === parseInt(value)
              );
              if (selectedItem) {
                updatedItem.description = selectedItem.itemName; // Map itemName to description
                updatedItem.uom = selectedItem.uomId; // Map uomId to uom
                updatedItem.unitPrice = selectedItem.unitPrice; // Map unitPrice
              }
            }

            return updatedItem;
          }
          return item;
        }),
        isDirty: true,
      }));
    },
    [masterData.items]
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
          qty: 1,
          uom: "",
          unitPrice: 0,
          sgstPercent: 0,
          cgstPercent: 0,
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
        toast.warning("At least one line item is required");
      }
    },
    [formState.lineItems.length]
  );

  const validateForm = useCallback(
    (isSubmit = false) => {
      const newErrors = {};

      if (!formState.formData.supplierId)
        newErrors.supplierId = "Supplier is required";

      if (!formState.formData.poDate) {
        newErrors.poDate = "PO Date is required";
      } else {
        const poDate = new Date(formState.formData.poDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (poDate < today) {
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
        if (item.qty < 1)
          newErrors[`qty_${index}`] = "Quantity must be at least 1";
        if (item.unitPrice < 0)
          newErrors[`unitPrice_${index}`] = "Unit Price cannot be negative";
      });

      if (
        isSubmit &&
        formState.lineItems.some(
          (item) => !item.itemId || item.qty < 1 || item.unitPrice <= 0
        )
      ) {
        newErrors.lineItems =
          "Please complete all line items with valid quantities and prices";
      }

      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return Object.keys(newErrors).length === 0;
    },
    [formState.formData, formState.lineItems]
  );

  const calculateTotals = useCallback(() => {
    const subtotal = formState.lineItems.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0
    );
    const totalTax = formState.lineItems.reduce((sum, item) => {
      const totalTaxPercent = item.sgstPercent + item.cgstPercent;
      return sum + (item.qty * item.unitPrice * totalTaxPercent) / 100;
    }, 0);
    const grandTotal = subtotal + totalTax;
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(totalTax.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    };
  }, [formState.lineItems]);

  const handleSaveDraft = async () => {
    if (!validateForm(false)) {
      toast.error("Please fix the errors before saving");
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, loading: "saving" }));
      const totals = calculateTotals();
      const poData = {
        ...formState.formData,
        lineItems: formState.lineItems,
        ...totals,
        status: "Draft",
      };

      if (editingPO) {
        await makeRequest("PUT", `/purchase-orders/${editingPO.id}`, poData);
        toast.success("Purchase Order updated as draft");
      } else {
        await makeRequest("POST", "/purchase-orders", poData);
        toast.success("Purchase Order saved as draft");
      }

      // Reset form after successful save
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
            qty: 1,
            uom: "",
            unitPrice: 0,
            sgstPercent: 0,
            cgstPercent: 0,
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

      onPOUpdated();
      onClose();
    } catch (error) {
      toast.error("Failed to save draft");
      console.error("Error saving draft:", error);
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm(true)) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    try {
      setUiState((prev) => ({ ...prev, loading: "submitting" }));
      const totals = calculateTotals();
      const poData = {
        ...formState.formData,
        lineItems: formState.lineItems,
        ...totals,
        status: "Submitted",
      };

      if (editingPO) {
        await makeRequest("PUT", `/purchase-orders/${editingPO.id}`, poData);
        toast.success("Purchase Order updated and submitted for approval");
      } else {
        await makeRequest("POST", "/purchase-orders", poData);
        toast.success("Purchase Order submitted for approval");
      }

      // Reset form after successful submit
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
            qty: 1,
            uom: "",
            unitPrice: 0,
            sgstPercent: 0,
            cgstPercent: 0,
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

      onPOUpdated();
      onClose();
    } catch (error) {
      toast.error("Failed to submit Purchase Order");
      console.error("Error submitting PO:", error);
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
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
      // Reset form before closing
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
            qty: 1,
            uom: "",
            unitPrice: 0,
            sgstPercent: 0,
            cgstPercent: 0,
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

      onClose();
    } else {
      setUiState((prev) => ({ ...prev, showConfirmDialog: false }));
    }
  };

  const selectSupplier = (supplier) => {
    console.log("supplier", supplier);
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
    handleLineItemChange(lineItemId, "itemId", itemId);
  };

  const { subtotal, tax, grandTotal } = calculateTotals();

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
      style={{ backgroundColor: showModal ? "rgba(0,0,0,0.5)" : "transparent" }}
      data-bs-backdrop="static"
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "1400px", width: "95%" }}
      >
        <div
          className="modal-content radius-16 bg-base"
          style={{
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="modal-header py-16 px-24 border border-top-0 border-start-0 border-end-0"
            style={{ flexShrink: 0 }}
          >
            <div className="d-flex align-items-center gap-3">
              <h1 className="modal-title fs-5" id="poModalLabel">
                {editingPO ? "Update Purchase Order" : "New Purchase Order"}
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
          <div
            className="modal-body p-24"
            style={{ flex: 1, overflowY: "auto" }}
          >
            <ToastContainer position="top-right" autoClose={3000} />

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
            />

            <POLineItemsTable
              lineItems={formState.lineItems}
              errors={formState.errors}
              filteredItems={masterData.filteredItems}
              selectItem={selectItem}
              handleLineItemChange={handleLineItemChange}
              addLineItem={addLineItem}
              removeLineItem={removeLineItem}
              taxOptions={taxOptions}
            />

            <POFooterSummary
              subtotal={subtotal}
              tax={tax}
              grandTotal={grandTotal}
            />
          </div>
          <div
            className="modal-footer p-24 border border-top border-start-0 border-end-0 border-bottom-0"
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
    </div>
  );
};

export default POModalLayer;
