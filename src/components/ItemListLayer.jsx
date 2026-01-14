import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect, useCallback } from "react";
import {
  getItemMasterData,
} from "../services/ItemMaster";
import ItemFormLayer from "./ItemFormLayer";
import OperationControl from "./OperationControl";
import { getCurrentUser, hasOperationPermission } from "../utils/permissions";
import "../assets/css/item-master.css";

const ItemListLayer = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  // Calculate permissions
  const user = getCurrentUser();
  const canUpdate = user?.permissions
    ? hasOperationPermission(user.permissions, "item-master", "update")
    : false;
  const canDelete = user?.permissions
    ? hasOperationPermission(user.permissions, "item-master", "delete")
    : false;
  const showActionsColumn = canUpdate || canDelete;
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
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [allItemTypes, setAllItemTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedItemData, setSelectedItemData] = useState(null);

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
      const response = await getItemMasterData();
      
      // Handle both array response and object response with data property
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data && response.data.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      }

      setAllItems(items);
      setFilteredItems(items);

      // Extract unique categories, subcategories, and item types from items for filters
      const uniqueCategories = [];
      const categoryMap = new Map();
      const uniqueSubcategories = [];
      const subcategoryMap = new Map();
      const uniqueItemTypes = [];
      const itemTypeMap = new Map();

      items.forEach(item => {
        // Extract category
        if (item.categoryId && item.categoryName) {
          if (!categoryMap.has(item.categoryId)) {
            categoryMap.set(item.categoryId, {
              id: item.categoryId,
              name: item.categoryName
            });
            uniqueCategories.push({
              id: item.categoryId,
              name: item.categoryName
            });
          }
        }

        // Extract subcategory
        if (item.subCategoryId && item.subCategoryName) {
          if (!subcategoryMap.has(item.subCategoryId)) {
            subcategoryMap.set(item.subCategoryId, {
              id: item.subCategoryId,
              name: item.subCategoryName,
              categoryId: item.categoryId
            });
            uniqueSubcategories.push({
              id: item.subCategoryId,
              name: item.subCategoryName,
              categoryId: item.categoryId
            });
          }
        }

        // Extract item type
        if (item.itemTypeId && item.itemTypeName) {
          if (!itemTypeMap.has(item.itemTypeId)) {
            itemTypeMap.set(item.itemTypeId, {
              id: item.itemTypeId,
              name: item.itemTypeName,
              subCategoryId: item.subCategoryId
            });
            uniqueItemTypes.push({
              id: item.itemTypeId,
              name: item.itemTypeName,
              subCategoryId: item.subCategoryId
            });
          }
        }
      });

      setCategories(uniqueCategories);
      setAllSubcategories(uniqueSubcategories);
      setAllItemTypes(uniqueItemTypes);
      setSubcategories([]);
      setItemTypes([]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("");
    setSelectedItemType("");
    if (categoryId) {
      // Filter subcategories locally from the loaded data
      const filteredSubcategories = allSubcategories.filter(
        (sub) => sub.categoryId === parseInt(categoryId)
      );
      setSubcategories(filteredSubcategories);
    } else {
      setSubcategories([]);
    }
    setItemTypes([]);
  }, [allSubcategories]);

  const handleSubcategoryChange = useCallback((subCategoryId) => {
    setSelectedSubcategory(subCategoryId);
    setSelectedItemType("");
    if (subCategoryId) {
      // Filter item types locally from the loaded data
      const filteredItemTypes = allItemTypes.filter(
        (itemType) => itemType.subCategoryId === parseInt(subCategoryId)
      );
      setItemTypes(filteredItemTypes);
    } else {
      setItemTypes([]);
    }
  }, [allItemTypes]);

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

    if (selectedStatus) {
      const isActive = selectedStatus === "active";
      filtered = filtered.filter((item) => item.isActive === isActive);
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
    selectedStatus,
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
    setSelectedItemData(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedItemData(null);
  };

  const handleItemSuccess = (message) => {
    setShowModal(false);
    setSelectedItemData(null);
    if (message) {
      triggerToast(message, "success");
    }
    fetchData(); // Refresh the list
  };

  const handleEdit = (item) => {
    setSelectedItemData(item);
    setShowModal(true);
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
    // Use categoryName directly from item if available, otherwise lookup
    if (typeof categoryId === 'string') {
      // categoryName was passed directly
      return categoryId;
    }
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "";
  };

  const getSubcategoryName = (subCategoryId) => {
    // Use subCategoryName directly from item if available, otherwise lookup
    if (typeof subCategoryId === 'string') {
      return subCategoryId;
    }
    const subcategory = subcategories.find((sc) => sc.id === subCategoryId);
    return subcategory ? subcategory.name : "";
  };

  const getItemTypeName = (itemTypeId) => {
    // Use itemTypeName directly from item if available, otherwise lookup
    if (typeof itemTypeId === 'string') {
      return itemTypeId;
    }
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
            <select
              className="form-select form-select-sm w-auto"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <OperationControl pageId="item-master" operation="add">
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
                      <th scope="col" style={{ width: "100px" }}>
                        Status
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
                      {showActionsColumn && (
                        <th scope="col" className="sticky-actions text-center">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.itemCode}</td>
                        <td>{item.itemName}</td>
                        <td>{item.categoryName || getCategoryName(item.categoryId)}</td>
                        <td>{item.subCategoryName || getSubcategoryName(item.subCategoryId)}</td>
                        <td>{item.itemTypeName || getItemTypeName(item.itemTypeId)}</td>
                        <td>{item.uomName || item.uomId}</td>
                        <td>
                          <span
                            className={`badge ${
                              item.isActive
                                ? "bg-success-600"
                                : "bg-neutral-400"
                            }`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                        {showActionsColumn && (
                          <td className="sticky-actions">
                            <div className="d-flex align-items-center justify-content-center gap-2">
                              <OperationControl
                                pageId="item-master"
                                operation="update"
                              >
                                <button
                                  type="button"
                                  className="w-32-px h-32-px bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                                  onClick={() => handleEdit(item)}
                                >
                                  <Icon icon="lucide:edit" />
                                </button>
                              </OperationControl>
                            </div>
                          </td>
                        )}
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
        <div className="modal-dialog modal-xl modal-dialog-centered" style={{ height: '80vh' }}>
          <div
            className="modal-content radius-16 bg-base h-100"
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="modal-header py-16 px-24 border border-top-0 border-start-0 border-end-0"
              style={{ flexShrink: 0 }}
            >
              <h1 className="modal-title fs-5" id="itemModalLabel">
                {selectedItemData?.id ? `Edit Item - ${selectedItemData.itemCode}` : "Add Item"}
              </h1>
              <button
                type="button"
                className="btn-close"
                onClick={handleModalClose}
                aria-label="Close"
              />
            </div>
            <div
              className="modal-body p-24 position-relative"
              style={{ flex: 1, overflowY: "auto" }}
            >
              {showModal && (
                <ItemFormLayer
                  itemId={selectedItemData?.id}
                  itemData={selectedItemData}
                  tableData={allItems}
                  onSuccess={handleItemSuccess}
                  onCancel={handleModalClose}
                  triggerToast={triggerToast}
                />
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default ItemListLayer;
