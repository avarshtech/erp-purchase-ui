
  import React, { useState, useEffect } from "react";
  import { Icon } from "@iconify/react/dist/iconify.js";
  import { getLocationByPincode } from "../services/pincodeService";
  import {
    getSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  } from "../services/suppliers";
  import OperationControl from "./OperationControl";
  import { getCurrentUser, hasOperationPermission } from "../utils/permissions";
  import "../assets/css/modal.css";


const SupplierModalLayer = () => {
    // --- State for suppliers, modal, edit, delete, pagination, sorting, etc. ---
    const [allSuppliers, setAllSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState(null);
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [originalSupplier, setOriginalSupplier] = useState(null);
    const [formData, setFormData] = useState({
      name: "",
      address: "",
      city: "",
      pincode: "",
      state: "",
      country: "",
      pan: "",
      gstin: "",
      email: "",
      phone: "",
      suppliesFabric: false,
      suppliesTrims: false,
      active: true
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortField, setSortField] = useState("createdDate");
    const [sortDirection, setSortDirection] = useState("desc");
    const [pendingSuccessToast, setPendingSuccessToast] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);

    // --- Permissions (if needed for actions column) ---
    const user = getCurrentUser && getCurrentUser();
    const canUpdate = user?.permissions
      ? hasOperationPermission(user.permissions, "supplier-info", "update")
      : false;
    const canDelete = user?.permissions
      ? hasOperationPermission(user.permissions, "supplier-info", "delete")
      : false;
    const showActionsColumn = canUpdate || canDelete;

    // --- Fetch suppliers on mount ---
    useEffect(() => {
      fetchSuppliers();
    }, []);

    // --- Track form changes for edit mode ---
    useEffect(() => {
      if (isEdit && originalSupplier) {
        const changed = Object.keys(formData).some((key) => {
          return formData[key] !== originalSupplier[key];
        });
        setHasChanges(changed);
      }
    }, [formData, originalSupplier, isEdit]);

    // --- Show pending toast after modal closes ---
    useEffect(() => {
      if (!showModal && pendingSuccessToast) {
        setToastMessage(pendingSuccessToast.message);
        setToastType(pendingSuccessToast.type);
        setShowToast(true);
        setPendingSuccessToast(null);
      }
    }, [showModal, pendingSuccessToast]);

    // --- Filter and sort suppliers ---
    useEffect(() => {
      let filtered = allSuppliers;
      if (searchTerm) {
        filtered = allSuppliers.filter(
          (supplier) =>
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.gstin.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      const sorted = [...filtered].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        if (sortField === "createdDate") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      setFilteredSuppliers(sorted);
      setCurrentPage(1);
    }, [searchTerm, allSuppliers, sortField, sortDirection]);

    // --- Fetch suppliers from API ---
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const response = await getSuppliers();
        const suppliers = Array.isArray(response) ? response : (response.data || []);
        setAllSuppliers(suppliers);
        setFilteredSuppliers(suppliers);
      } catch (err) {
        setAllSuppliers([]);
        setFilteredSuppliers([]);
      } finally {
        setLoading(false);
      }
    };

    // --- Modal handlers ---
    const handleAdd = () => {
      setIsEdit(false);
      setCurrentSupplier(null);
      setFormData({
        name: "",
        address: "",
        city: "",
        pincode: "",
        state: "",
        country: "",
        pan: "",
        gstin: "",
        email: "",
        phone: "",
        suppliesFabric: false,
        suppliesTrims: false,
        active: true
      });
      setPendingSuccessToast(null);
      setShowToast(false);
      setShowModal(true);
    };

    const handleEdit = (supplier) => {
      const foundSupplier = allSuppliers.find((s) => s.id === supplier.id) || supplier;
      setIsEdit(true);
      setCurrentSupplier(foundSupplier);
      setOriginalSupplier(foundSupplier);
      setFormData({
        name: foundSupplier.name,
        address: foundSupplier.address,
        city: foundSupplier.city,
        pincode: foundSupplier.pincode,
        state: foundSupplier.state,
        country: foundSupplier.country,
        pan: foundSupplier.pan,
        gstin: foundSupplier.gstin,
        email: foundSupplier.email,
        phone: foundSupplier.phone,
        suppliesFabric: foundSupplier.suppliesFabric,
        suppliesTrims: foundSupplier.suppliesTrims,
        active: foundSupplier.active,
      });
      setPendingSuccessToast(null);
      setShowToast(false);
      setShowModal(true);
    };

    const handleDelete = (supplier) => {
      setSupplierToDelete(supplier);
      setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
      try {
        await deleteSupplier(supplierToDelete.id);
        setShowDeleteModal(false);
        setSupplierToDelete(null);
        fetchSuppliers();
        // Show success toast after delete
        setToastMessage("Supplier deleted successfully.");
        setToastType("success");
        setShowToast(true);
      } catch (err) {
        setToastMessage(err.errorMessage || "Failed to delete supplier. Please try again.");
        setToastType("error");
        setShowToast(true);
      }
    };

    // --- Submit handler ---
    const handleSubmit = async (e) => {
      if (e) e.preventDefault();
      
      // Field-by-field validation in order of input placement
      // 1. Supplier Name
      if (!(formData.name || '').trim()) {
        setToastMessage("Supplier Name is required.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // 2. Address
      if (!(formData.address || '').trim()) {
        setToastMessage("Address is required.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // 3. City
      if (!(formData.city || '').trim()) {
        setToastMessage("City is required.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // 4. Pincode
      if (!(formData.pincode || '').trim()) {
        setToastMessage("Pincode is required.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // 5. State
      if (!(formData.state || '').trim()) {
        setToastMessage("State is required.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // 6. Country
      if (!(formData.country || '').trim()) {
        setToastMessage("Country is required.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // 7. PAN - Required check first, then format check
      if (!(formData.pan || '').trim()) {
        setToastMessage("PAN is required.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // PAN format: 5 letters + 4 digits + 1 letter (e.g., ABCPD1234E)
      // 4th character must be entity type: C, P, H, F, A, T, B, L, J, G
      const panRegex = /^[A-Z]{3}[PCAFHTBLJG][A-Z][0-9]{4}[A-Z]$/;
      if (!panRegex.test((formData.pan || '').toUpperCase())) {
        setToastMessage("Invalid PAN format. Expected format: ABCPD1234E (4th char must be C/P/H/F/A/T/B/L/J/G)");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // 8. GSTIN - Required check first, then format check
      if (!(formData.gstin || '').trim()) {
        setToastMessage("GSTIN is required.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // GSTIN format: 2 digits (state) + 10 chars (PAN) + 1 char (entity) + Z + 1 check digit
      // Example: 22ABCPD1234E1Z5
      const gstinRegex = /^[0-9]{2}[A-Z]{3}[PCAFHTBLJG][A-Z][0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;
      if (!gstinRegex.test((formData.gstin || '').toUpperCase())) {
        setToastMessage("Invalid GSTIN format. Expected format: 22ABCPD1234E1Z5 (15 characters)");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // 9. Email
      if (!(formData.email || '').trim()) {
        setToastMessage("Email is required.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email || '')) {
        setToastMessage("Invalid email format.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // 10. Phone
      if (!(formData.phone || '').trim()) {
        setToastMessage("Phone Number is required.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // Phone format validation (10 digits)
      if ((formData.phone || '').length !== 10) {
        setToastMessage("Phone Number must be 10 digits.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      // 11. Fabric/Trims
      if (!formData.fabric && !formData.trims) {
        setToastMessage("At least one supply product (Fabric or Trims) must be selected.");
        setToastType("error");
        setShowToast(true);
        return;
      }
      try {
        const supplierData = isEdit ? { ...formData, id: currentSupplier.id } : formData;
        if (isEdit) {
          await updateSupplier(supplierData);
          setPendingSuccessToast({ message: "Supplier updated successfully.", type: "success" });
        } else {
          await createSupplier(supplierData);
          setPendingSuccessToast({ message: "Supplier added successfully.", type: "success" });
        }
        setShowModal(false);
        await fetchSuppliers();
      } catch (err) {
        setToastMessage(err.errorMessage || `Failed to ${isEdit ? "update" : "create"} supplier. Please try again.`);
        setToastType("error");
        setShowToast(true);
        console.error(`Error ${isEdit ? "updating" : "creating"} supplier:`, err);
      }
    };

  // Toast state (must be defined before any use)
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("error");

  // Auto-hide success toast after 2.5 seconds (similar to item toast)
  useEffect(() => {
    let timer;
    if (showToast && toastType === "success") {
      timer = setTimeout(() => {
        setShowToast(false);
      }, 2500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showToast, toastType]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    // Apply field-specific restrictions
    switch (name) {
      case "name":
        newValue = value.replace(/[^a-zA-Z\s]/g, "");
        break;
      case "address":
        newValue = value.replace(/[^a-zA-Z0-9\s\-/]/g, "");
        break;
      case "city":
        newValue = value.replace(/[^a-zA-Z\s]/g, "");
        break;
      case "pincode":
        newValue = value.replace(/[^0-9]/g, "").slice(0, 6);
        break;
      case "state":
        newValue = value.replace(/[^a-zA-Z\s]/g, "");
        break;
      case "country":
        newValue = value.replace(/[^a-zA-Z\s]/g, "");
        break;
      case "pan":
        newValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
        break;
      case "gstin":
        newValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 15);
        break;
      case "email":
        newValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");
        break;
      case "phone":
        newValue = value.replace(/[^0-9]/g, "").slice(0, 10);
        break;
      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // OnBlur handler for pincode to fetch city/state/country
  const handlePincodeBlur = async (e) => {
    const pincode = e.target.value;
    if (pincode.length === 6) {
      const location = await getLocationByPincode(pincode);
      if (location) {
        setFormData((prev) => ({
          ...prev,
          city: location.city,
          state: location.state,
          country: location.country,
        }));
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderSuppliesChips = (supplier) => {
    const chips = [];
    if (supplier.suppliesFabric) {
      chips.push(
        <span
          key="fabric"
          className="px-16 py-4 rounded-pill fw-medium text-sm bg-success-focus text-success-main me-2"
        >
          Fabric
        </span>
      );
    }
    if (supplier.suppliesTrims) {
      chips.push(
        <span
          key="trims"
          className="px-16 py-4 rounded-pill fw-medium text-sm bg-info-focus text-info-main"
        >
          Trims
        </span>
      );
    }
    return chips.length > 0 ? (
      chips
    ) : (
      <span className="text-neutral-500">None</span>
    );
  };

  return (
    <>
      {/* Toast Notification (global, outside modal) */}
      {showToast && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-3"
          style={{ zIndex: 2000 }}
        >
          <div
            className={`toast-custom ${
              toastType === "error" ? "toast-error" : "toast-success"
            }`}
          >
            <span>{toastMessage}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => setShowToast(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <h6 className="page-title">Supplier / Vendor Details</h6>
      <div className="card">
        <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="icon-field position-relative">
              <input
                type="text"
                name="search"
                className="form-control form-control-sm w-auto pe-5"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <span className="icon">
                <Icon icon="ion:search-outline" />
              </span>
              {searchTerm && (
                <button
                  type="button"
                  className="btn position-absolute top-50 end-0 translate-middle-y me-2"
                  onClick={() => setSearchTerm("")}
                >
                  <Icon icon="mingcute:close-line" />
                </button>
              )}
            </div>
          </div>
          <OperationControl pageId="supplier-info" operation="add">
            <button
              type="button"
              className="btn btn-sm btn-primary-600"
              onClick={handleAdd}
            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Add Supplier
            </button>
          </OperationControl>
        </div>
        <div className="card-body">
          {loading ? (
            <div
              className="d-flex align-items-center justify-content-center py-5"
              style={{ minHeight: "200px" }}
            >
              <div className="text-center">
                <div
                  className="spinner-border text-primary mb-3"
                  style={{ width: "3rem", height: "3rem" }}
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h6 className="text-muted">Loading suppliers...</h6>
              </div>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-4">
              <div className="card border">
                <div className="card-body">
                  <h6 className="text-md text-secondary-light mb-16">
                    No Supplier Exists
                  </h6>
                  <button
                    type="button"
                    className="btn btn-primary-600"
                    onClick={handleAdd}
                  >
                    Add Supplier
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table bordered-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: "100px" }}>
                        ID
                      </th>
                      <th
                        scope="col"
                        className="cursor-pointer"
                        onClick={() => handleSort("name")}
                        style={{ width: "280px" }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          Supplier Name
                          {sortField === "name" && (
                            <Icon
                              icon={`mdi:arrow-${
                                sortDirection === "asc" ? "up" : "down"
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th scope="col" style={{ width: "300px" }}>
                        Address
                      </th>
                      <th scope="col" style={{ width: "140px" }}>
                        City
                      </th>
                      <th scope="col" style={{ width: "180px" }}>
                        State
                      </th>
                      <th scope="col" style={{ width: "140px" }}>
                        Country
                      </th>
                      <th scope="col" style={{ width: "260px" }}>
                        Email
                      </th>
                      <th scope="col" style={{ width: "160px" }}>
                        Phone
                      </th>
                      <th scope="col" style={{ width: "160px" }}>
                        PAN
                      </th>
                      <th scope="col" style={{ width: "200px" }}>
                        GSTIN
                      </th>
                      <th
                        scope="col"
                        className="cursor-pointer"
                        onClick={() => handleSort("createdDate")}
                        style={{ width: "200px" }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          Created Date
                          {sortField === "createdDate" && (
                            <Icon
                              icon={`mdi:arrow-${
                                sortDirection === "asc" ? "up" : "down"
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th scope="col" style={{ width: "180px" }}>
                        Supplies
                      </th>
                      {showActionsColumn && (
                        <th scope="col" className="sticky-actions">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentSuppliers.map((supplier, index) => (
                      <tr key={supplier.id}>
                        <td style={{ width: "100px" }}>{supplier.id}</td>
                        <td style={{ width: "280px" }}>{supplier.name}</td>
                        <td style={{ width: "300px" }}>{supplier.address}</td>
                        <td style={{ width: "140px" }}>{supplier.city}</td>
                        <td style={{ width: "180px" }}>{supplier.state}</td>
                        <td style={{ width: "140px" }}>{supplier.country}</td>
                        <td style={{ width: "260px" }}>{supplier.email}</td>
                        <td style={{ width: "160px" }}>{supplier.phone}</td>
                        <td style={{ width: "160px" }}>{supplier.pan}</td>
                        <td style={{ width: "200px" }}>{supplier.gstin}</td>
                        <td style={{ width: "200px" }}>
                          {supplier.createdAt
                            ? new Date(supplier.createdAt).toLocaleDateString("en-CA")
                            : "-"}
                        </td>
                        <td style={{ width: "180px" }}>
                          {renderSuppliesChips(supplier)}
                        </td>
                        {showActionsColumn && (
                          <td className="sticky-actions">
                            <OperationControl
                              pageId="supplier-info"
                              operation="update"
                            >
                              <button
                                type="button"
                                className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                                onClick={() => handleEdit(supplier)}
                              >
                                <Icon icon="lucide:edit" />
                              </button>
                            </OperationControl>
                            <OperationControl
                              pageId="supplier-info"
                              operation="delete"
                            >
                              <button
                                type="button"
                                className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                                onClick={() => handleDelete(supplier)}
                              >
                                <Icon icon="mingcute:delete-2-line" />
                              </button>
                            </OperationControl>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-24">
                <span>
                  Showing {filteredSuppliers.length === 0 ? 0 : startIndex + 1}{" "}
                  to {Math.min(endIndex, filteredSuppliers.length)} of{" "}
                  {filteredSuppliers.length} entries
                  {searchTerm &&
                    ` (filtered from ${allSuppliers.length} total)`}
                </span>
                <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                  <li className="page-item">
                    <button
                      className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px bg-base"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <Icon icon="ep:d-arrow-left" className="text-xl" />
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <li key={page} className="page-item">
                        <button
                          className={`page-link fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px ${
                            currentPage === page
                              ? "bg-primary-600 text-white"
                              : "bg-primary-50 text-secondary-light"
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    )
                  )}
                  <li className="page-item">
                    <button
                      className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px bg-base"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <Icon icon="ep:d-arrow-right" className="text-xl" />
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        style={{
          backgroundColor: showModal ? "rgba(0,0,0,0.5)" : "transparent",
        }}
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
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
              <h1 className="modal-title fs-5" id="supplierModalLabel">
                {isEdit ? "Update Supplier" : "Add Supplier"}
              </h1>
              <button
                type="button"
                className="btn-close"
                onClick={() => {
                  setShowModal(false);
                  setShowToast(false);
                }}
                aria-label="Close"
              />
            </div>
            <div
              className="modal-body p-24"
              style={{ flex: 1, overflowY: "auto" }}
            >
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-12 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Supplier Name{" "}
                      {!isEdit && <span className="text-danger">*</span>}
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control radius-8"
                      placeholder="Enter Supplier Name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isEdit}
                      required
                    />
                  </div>
                  <div className="col-12 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Address <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      className="form-control radius-8"
                      placeholder="Enter Address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      City <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      className="form-control radius-8"
                      placeholder="Enter City"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Pincode <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      className="form-control radius-8"
                      placeholder="Enter Pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      onBlur={handlePincodeBlur}
                      maxLength="6"
                      required
                    />
                  </div>
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      State <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      className="form-control radius-8"
                      placeholder="Enter State"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Country <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      className="form-control radius-8"
                      placeholder="Enter Country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      PAN <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="pan"
                      className="form-control radius-8"
                      placeholder="Enter PAN"
                      value={formData.pan}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      GSTIN <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="gstin"
                      className="form-control radius-8"
                      placeholder="Enter GSTIN"
                      value={formData.gstin}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control radius-8"
                      placeholder="Enter Email"
                      value={formData.email}
                      onChange={handleChange}
                      pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                      required
                    />
                  </div>
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control radius-8"
                      placeholder="Enter Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      pattern="[0-9]{10}"
                      maxLength="10"
                      required
                    />
                  </div>
                  <div className="col-12 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Supplies <span className="text-danger">*</span>
                    </label>
                    <div className="d-flex align-items-center gap-3">
                      <div className="form-check d-flex align-items-center gap-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="fabric"
                          id="fabric"
                          checked={formData.fabric}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label mb-0"
                          htmlFor="fabric"
                        >
                          Fabric
                        </label>
                      </div>
                      <div className="form-check d-flex align-items-center gap-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="trims"
                          id="trims"
                          checked={formData.trims}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label mb-0"
                          htmlFor="trims"
                        >
                          Trims
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div
              className="modal-footer p-24 border border-top border-start-0 border-end-0 border-bottom-0"
              style={{ flexShrink: 0 }}
            >
              <div className="d-flex align-items-center justify-content-center gap-3 w-100">
                <button
                  type="button"
                  className="border border-gray-300 bg-hover-gray-50 text-gray-700 text-md px-40 py-11 radius-8"
                  onClick={() => {
                    setShowModal(false);
                    setShowToast(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary border border-primary-600 text-md px-48 py-12 radius-8"
                  onClick={handleSubmit}
                  disabled={isEdit && !hasChanges}
                >
                  {isEdit ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className={`modal fade ${showDeleteModal ? "show d-block" : ""}`}
        style={{
          backgroundColor: showDeleteModal ? "rgba(0,0,0,0.5)" : "transparent",
        }}
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-sm modal-dialog-centered">
          <div className="modal-content radius-16 bg-base">
            <div className="modal-body p-24 text-center">
              <div className="mb-16">
                <Icon
                  icon="mingcute:delete-2-line"
                  className="text-danger-600 text-4xl"
                />
              </div>
              <h6 className="text-lg text-neutral-900 mb-8">Delete Supplier</h6>
              <p className="text-sm text-neutral-600 mb-24">
                Are you sure you want to delete{" "}
                <strong>{supplierToDelete?.name}</strong>? This action cannot be
                undone.
              </p>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <button
                  type="button"
                  className="border border-neutral-300 bg-hover-neutral-100 text-neutral-600 text-md px-32 py-11 radius-8"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger border border-danger-600 text-md px-32 py-12 radius-8"
                  onClick={confirmDelete}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupplierModalLayer;
