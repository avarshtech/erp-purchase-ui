import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import {
  getItems,
  getCategories,
  getSubcategories,
  getItemTypes,
  deleteItem,
} from "../mocks/server";
import ItemFormLayer from "./ItemFormLayer";
import "../assets/css/item-master.css";

const ItemListLayer = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Filters
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("error");

  // Auto-dismiss toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const triggerToast = (message, type = "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, categoriesResponse] = await Promise.all([
        getItems(),
        getCategories(),
      ]);
      setAllItems(itemsResponse.data);
      setFilteredItems(itemsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = useCallback(async (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("");
    setSelectedItemType("");
    if (categoryId) {
      try {
        const response = await getSubcategories(categoryId);
        setSubcategories(response.data);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    } else {
      setSubcategories([]);
    }
    setItemTypes([]);
  }, []);

  const handleSubcategoryChange = useCallback(async (subCategoryId) => {
    setSelectedSubcategory(subCategoryId);
    setSelectedItemType("");
    if (subCategoryId) {
      try {
        const response = await getItemTypes(subCategoryId);
        setItemTypes(response.data);
      } catch (err) {
        console.error("Error fetching item types:", err);
      }
    } else {
      setItemTypes([]);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      handleCategoryChange(selectedCategory);
    } else {
      setSubcategories([]);
      setItemTypes([]);
    }
  }, [selectedCategory, handleCategoryChange]);

  useEffect(() => {
    if (selectedSubcategory) {
      handleSubcategoryChange(selectedSubcategory);
    } else {
      setItemTypes([]);
    }
  }, [selectedSubcategory, handleSubcategoryChange]);

  // Handle backdrop click to close modal
  useEffect(() => {
    const handleBackdropClick = (e) => {
      if (showModal && e.target.classList.contains("modal")) {
        handleModalClose();
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleBackdropClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleBackdropClick);
    };
  }, [showModal]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  useEffect(() => {
    let filtered = allItems;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => item.categoryId === parseInt(selectedCategory)
      );
    }

    if (selectedSubcategory) {
      filtered = filtered.filter(
        (item) => item.subCategoryId === parseInt(selectedSubcategory)
      );
    }

    if (selectedItemType) {
      filtered = filtered.filter(
        (item) => item.itemTypeId === parseInt(selectedItemType)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt") {
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

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [
    searchTerm,
    allItems,
    sortField,
    sortDirection,
    selectedCategory,
    selectedSubcategory,
    selectedItemType,
  ]);

  const handleItemTypeChange = (itemTypeId) => {
    setSelectedItemType(itemTypeId);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleAdd = () => {
    setSelectedItemId(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedItemId(null);
  };

  const handleItemSuccess = (message) => {
    setShowModal(false);
    setSelectedItemId(null);
    if (message) {
      triggerToast(message, "success");
    }
    fetchData(); // Refresh the list
  };

  const handleEdit = (item) => {
    setSelectedItemId(item.id);
    setShowModal(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteItem(itemToDelete.id);
      setShowDeleteModal(false);
      setItemToDelete(null);
      triggerToast("Item deleted successfully", "success");
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Error deleting item:", err);
      triggerToast("Failed to delete item", "error");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "";
  };

  const getSubcategoryName = (subCategoryId) => {
    const subcategory = subcategories.find((sc) => sc.id === subCategoryId);
    return subcategory ? subcategory.name : "";
  };

  const getItemTypeName = (itemTypeId) => {
    const itemType = itemTypes.find((it) => it.id === itemTypeId);
    return itemType ? itemType.name : "";
  };

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4"
          style={{ zIndex: 9999 }}
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

      <h6 className="page-title">Item Master</h6>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
            <select
              className="form-select form-select-sm w-auto"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              className="form-select form-select-sm w-auto"
              value={selectedSubcategory}
              onChange={(e) => handleSubcategoryChange(e.target.value)}
            >
              <option value="">All Subcategories</option>
              {subcategories.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
            <select
              className="form-select form-select-sm w-auto"
              value={selectedItemType}
              onChange={(e) => handleItemTypeChange(e.target.value)}
            >
              <option value="">All Item Types</option>
              {itemTypes.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-primary-600"
            onClick={handleAdd}
          >
            <Icon
              icon="ic:baseline-plus"
              className="icon text-xl line-height-1"
            />
            Add Item
          </button>
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
                <h6 className="text-muted">Loading items...</h6>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-4">
              <div className="card border">
                <div className="card-body">
                  <h6 className="text-md text-secondary-light mb-16">
                    No Items Exist
                  </h6>
                  <button
                    type="button"
                    className="btn btn-primary-600"
                    onClick={handleAdd}
                  >
                    Add Item
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
                      <th scope="col" style={{ width: "200px" }}>
                        Item Code
                      </th>
                      <th
                        scope="col"
                        className="cursor-pointer"
                        onClick={() => handleSort("itemName")}
                        style={{ width: "300px" }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          Item Name
                          {sortField === "itemName" && (
                            <Icon
                              icon={`mdi:arrow-${
                                sortDirection === "asc" ? "up" : "down"
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th scope="col" style={{ width: "250px" }}>
                        Category
                      </th>
                      <th scope="col" style={{ width: "250px" }}>
                        Subcategory
                      </th>
                      <th scope="col" style={{ width: "200px" }}>
                        Item Type
                      </th>
                      <th scope="col" style={{ width: "150px" }}>
                        UOM
                      </th>
                      <th
                        scope="col"
                        className="cursor-pointer"
                        onClick={() => handleSort("createdAt")}
                        style={{ width: "200px" }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          Created At
                          {sortField === "createdAt" && (
                            <Icon
                              icon={`mdi:arrow-${
                                sortDirection === "asc" ? "up" : "down"
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th scope="col" className="sticky-actions text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.itemCode}</td>
                        <td>{item.itemName}</td>
                        <td>{getCategoryName(item.categoryId)}</td>
                        <td>{getSubcategoryName(item.subCategoryId)}</td>
                        <td>{getItemTypeName(item.itemTypeId)}</td>
                        <td>{item.uomId}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="sticky-actions">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <button
                              type="button"
                              className="w-32-px h-32-px bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                              onClick={() => handleEdit(item)}
                            >
                              <Icon icon="lucide:edit" />
                            </button>
                            <button
                              type="button"
                              className="w-32-px h-32-px bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                              onClick={() => handleDeleteClick(item)}
                            >
                              <Icon icon="mingcute:delete-2-line" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-24">
                <span>
                  Showing {filteredItems.length === 0 ? 0 : startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredItems.length)} of{" "}
                  {filteredItems.length} entries
                  {searchTerm && ` (filtered from ${allItems.length} total)`}
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

      {/* Add Item Modal */}
      <div
        className={`modal fade ${showModal ? "show d-block" : ""}`}
        style={{
          backgroundColor: showModal ? "rgba(0,0,0,0.5)" : "transparent",
        }}
        data-bs-backdrop="static"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
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
              <h1 className="modal-title fs-5" id="itemModalLabel">
                {selectedItemId ? "Edit Item" : "Add Item"}
              </h1>
              <button
                type="button"
                className="btn-close"
                onClick={handleModalClose}
                aria-label="Close"
              />
            </div>
            <div
              className="modal-body p-24"
              style={{ flex: 1, overflowY: "auto" }}
            >
              {showModal && (
                <ItemFormLayer
                  itemId={selectedItemId}
                  onSuccess={handleItemSuccess}
                  onCancel={handleModalClose}
                  triggerToast={triggerToast}
                />
              )}
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
              <h6 className="text-lg text-neutral-900 mb-8">Delete Item</h6>
              <p className="text-sm text-neutral-600 mb-24">
                Are you sure you want to delete this item?
              </p>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <button
                  type="button"
                  className="border border-neutral-300 bg-hover-neutral-100 text-neutral-600 text-md px-32 py-11 radius-8"
                  onClick={handleDeleteCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger border border-danger-600 text-md px-32 py-12 radius-8"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemListLayer;
