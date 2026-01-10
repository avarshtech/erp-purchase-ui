import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import { makeRequest } from "../mocks/server";
import POHeaderSection from "./child/POHeaderSection";
import POLineItemsTable from "./child/POLineItemsTable";
import POFooterSummary from "./child/POFooterSummary";
import POActionButtons from "./child/POActionButtons";

const POFormLayer = () => {
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
    loading: false,
    supplierSearch: "",
    showSupplierDropdown: false,
  });

  // Static options (moved outside state for better performance)
  const taxOptions = [
    { value: 0, label: "0%" },
    { value: 5, label: "5%" },
    { value: 10, label: "10%" },
    { value: 18, label: "18%" },
  ];

  // Load master data on component mount
  useEffect(() => {
    loadMasterData();
    generatePONumber();
  }, []);

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

  // Memoize line items dependency for useEffect
  const lineItemsDependency = useMemo(
    () =>
      formState.lineItems
        .map(
          (item) =>
            `${item.qty}-${item.unitPrice}-${item.sgstPercent}-${item.cgstPercent}`
        )
        .join(","),
    [formState.lineItems]
  );

  // Auto-calculate amounts when line items change
  useEffect(() => {
    const updatedLineItems = formState.lineItems.map((item) => {
      const totalTaxPercent = item.sgstPercent + item.cgstPercent;
      const amount = parseFloat(
        (item.qty * item.unitPrice * (1 + totalTaxPercent / 100)).toFixed(2)
      );
      return {
        ...item,
        amount,
      };
    });
    setFormState((prev) => ({ ...prev, lineItems: updatedLineItems }));
  }, [lineItemsDependency, formState.lineItems]);

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
      isDirty: true,
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
                updatedItem.description = selectedItem.description;
                updatedItem.uom = selectedItem.uomId;
                updatedItem.unitPrice = selectedItem.unitPrice;
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
      if (!formState.formData.poDate) newErrors.poDate = "PO Date is required";
      if (
        formState.formData.poDate &&
        formState.formData.poDate < new Date().setHours(0, 0, 0, 0)
      ) {
        newErrors.poDate = "PO Date cannot be in the past";
      }
      if (!formState.formData.expectedDeliveryDate) {
        newErrors.expectedDeliveryDate = "Expected Delivery Date is required";
      }
      if (
        formState.formData.poDate &&
        formState.formData.expectedDeliveryDate &&
        formState.formData.expectedDeliveryDate <= formState.formData.poDate
      ) {
        newErrors.expectedDeliveryDate =
          "Expected Delivery Date must be after PO Date";
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
      setUiState((prev) => ({ ...prev, loading: true }));
      const totals = calculateTotals();
      const poData = {
        ...formState.formData,
        lineItems: formState.lineItems,
        ...totals,
        status: "Draft",
      };

      await makeRequest("POST", "/purchase-orders", poData);
      toast.success("Purchase Order saved as draft");
      setFormState((prev) => ({ ...prev, isDirty: false }));
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
      setUiState((prev) => ({ ...prev, loading: true }));
      const totals = calculateTotals();
      const poData = {
        ...formState.formData,
        lineItems: formState.lineItems,
        ...totals,
        status: "Submitted",
      };

      await makeRequest("POST", "/purchase-orders", poData);
      toast.success("Purchase Order submitted for approval");
      setFormState((prev) => ({ ...prev, isDirty: false }));
      // Reset form or navigate away
    } catch (error) {
      toast.error("Failed to submit Purchase Order");
      console.error("Error submitting PO:", error);
    } finally {
      setUiState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCancel = () => {
    if (formState.isDirty) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to cancel?"
        )
      ) {
        // Reset form or navigate away
        setFormState((prev) => ({ ...prev, isDirty: false }));
      }
    } else {
      // Navigate away or reset form
    }
  };

  const selectSupplier = (supplier) => {
    handleInputChange("supplierId", supplier.id);
    setUiState((prev) => ({
      ...prev,
      supplierSearch: supplier.name,
      showSupplierDropdown: false,
      openItemDropdown: null,
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  return (
    <div className="row gy-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="col-lg-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Create Purchase Order</h5>
          </div>
          <div className="card-body">
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
    </div>
  );
};

export default POFormLayer;
