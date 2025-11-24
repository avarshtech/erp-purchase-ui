import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { getRoles, createRole, updateRole, deleteRole } from "../mocks/server";
import {
  getAllPages,
  getAllOperations,
  getAdminPermissions,
  getEmptyPermissions,
  getCurrentUser,
  hasOperationPermission,
} from "../utils/permissions";
import OperationControl from "../components/OperationControl";
import "../assets/css/role-access.css";

const RoleAccess = () => {
  const [allRoles, setAllRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);

  // Calculate permissions
  const user = getCurrentUser();
  const canUpdate = user?.permissions
    ? hasOperationPermission(user.permissions, "roles", "update")
    : false;
  const canDelete = user?.permissions
    ? hasOperationPermission(user.permissions, "roles", "delete")
    : false;
  const showActionsColumn = canUpdate || canDelete;
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
    permissions: getEmptyPermissions(),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("createdDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("error");

  useEffect(() => {
    fetchRoles();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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

  useEffect(() => {
    let filtered = allRoles;

    if (searchTerm) {
      filtered = allRoles.filter(
        (role) =>
          role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
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

    setFilteredRoles(filtered);
    setCurrentPage(1);
  }, [searchTerm, allRoles, sortField, sortDirection]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles();
      setAllRoles(response.data);
      setFilteredRoles(response.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEdit(false);
    setCurrentRole(null);
    setFormData({
      name: "",
      description: "",
      status: "Active",
      permissions: getEmptyPermissions(),
    });
    setShowModal(true);
  };

  const handleEdit = (role) => {
    setIsEdit(true);
    setCurrentRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      status: role.status,
      permissions: role.permissions || getEmptyPermissions(),
    });
    setShowModal(true);
  };

  const handleDelete = (role) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteRole(roleToDelete.id);
      setShowDeleteModal(false);
      setRoleToDelete(null);
      setToastMessage("Role deleted successfully");
      setToastType("success");
      setShowToast(true);
      fetchRoles();
    } catch (err) {
      console.error("Error deleting role:", err);
      setToastMessage("Failed to delete role");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setToastMessage("Role Name is required.");
      setToastType("error");
      setShowToast(true);
      return;
    }
    if (!formData.description.trim()) {
      setToastMessage("Description is required.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    try {
      if (isEdit) {
        await updateRole(currentRole.id, formData);
        setToastMessage("Role updated successfully");
      } else {
        await createRole(formData);
        setToastMessage("Role created successfully");
      }
      setToastType("success");
      setShowToast(true);
      setShowModal(false);
      await fetchRoles();
    } catch (err) {
      setToastMessage(
        `Failed to ${isEdit ? "update" : "create"} role. Please try again.`
      );
      setToastType("error");
      setShowToast(true);
      console.error(`Error ${isEdit ? "updating" : "creating"} role:`, err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation: Name should only contain letters and spaces
    if (name === "name") {
      if (value === "" || /^[a-zA-Z\s]+$/.test(value)) {
        setFormData((prev) => {
          const newFormData = {
            ...prev,
            [name]: value,
          };

          // If role name is "Admin", set all permissions
          if (value === "Admin") {
            newFormData.permissions = getAdminPermissions();
          }

          return newFormData;
        });
      }
      return;
    }

    // Validation: Description should not contain special characters (alphanumeric and spaces only)
    if (name === "description") {
      if (value === "" || /^[a-zA-Z0-9\s]+$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  // Permission management handlers
  const handlePageAccessToggle = (pageId) => {
    setFormData((prev) => {
      const newPermissions = { ...prev.permissions };
      const currentAccess = newPermissions[pageId]?.access || false;

      // Toggle access
      newPermissions[pageId] = {
        ...newPermissions[pageId],
        access: !currentAccess,
        operations: {
          view: !currentAccess,
          add: false,
          update: false,
          delete: false,
        },
      };

      return { ...prev, permissions: newPermissions };
    });
  };

  const handleOperationToggle = (pageId, operationId) => {
    setFormData((prev) => {
      const newPermissions = { ...prev.permissions };

      // Ensure the page has access before toggling operations
      if (!newPermissions[pageId]?.access) {
        return prev;
      }

      const currentValue =
        newPermissions[pageId].operations[operationId] || false;

      newPermissions[pageId] = {
        ...newPermissions[pageId],
        operations: {
          ...newPermissions[pageId].operations,
          [operationId]: !currentValue,
        },
      };

      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSelectAllAccess = () => {
    const allPages = getAllPages();
    setFormData((prev) => {
      const newPermissions = {};
      const allSelected = allPages.every(
        (page) => prev.permissions[page.id]?.access
      );

      allPages.forEach((page) => {
        newPermissions[page.id] = {
          access: !allSelected,
          operations: {
            view: !allSelected,
            add: false,
            update: false,
            delete: false,
          },
        };
      });

      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSelectAllOperations = (pageId) => {
    setFormData((prev) => {
      const newPermissions = { ...prev.permissions };

      if (!newPermissions[pageId]?.access) {
        return prev;
      }

      const allOperations = getAllOperations();
      const allSelected = allOperations.every(
        (op) => newPermissions[pageId].operations[op.id]
      );

      newPermissions[pageId] = {
        ...newPermissions[pageId],
        operations: {
          view: true, // View should always be true if access is granted
          add: !allSelected,
          update: !allSelected,
          delete: !allSelected,
        },
      };

      return { ...prev, permissions: newPermissions };
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      <h6 className="page-title">Role & Access</h6>
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
          <OperationControl pageId="roles" operation="add">
            <button
              type="button"
              className="btn btn-sm btn-primary-600"
              onClick={handleAdd}
            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Add Role
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
                <h6 className="text-muted">Loading roles...</h6>
              </div>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-4">
              <div className="card border">
                <div className="card-body">
                  <h6 className="text-md text-secondary-light mb-16">
                    No Roles Found
                  </h6>
                  <button
                    type="button"
                    className="btn btn-primary-600"
                    onClick={handleAdd}
                  >
                    Add Role
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
                        style={{ width: "200px" }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          Role Name
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
                        Description
                      </th>
                      <th scope="col" style={{ width: "120px" }}>
                        Status
                      </th>
                      <th
                        scope="col"
                        className="cursor-pointer"
                        onClick={() => handleSort("createdDate")}
                        style={{ width: "150px" }}
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
                      {showActionsColumn && (
                        <th scope="col" className="sticky-actions">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentRoles.map((role) => (
                      <tr key={role.id}>
                        <td>{role.id}</td>
                        <td>{role.name}</td>
                        <td>{role.description}</td>
                        <td>
                          <span
                            className={`badge ${
                              role.status === "Active"
                                ? "bg-success-focus text-success-main"
                                : "bg-danger-focus text-danger-main"
                            } px-16 py-4 radius-4 fw-medium text-sm`}
                          >
                            {role.status}
                          </span>
                        </td>
                        <td>{role.createdDate}</td>
                        {showActionsColumn && (
                          <td className="sticky-actions">
                            {role.name !== "Admin" && (
                              <>
                                <OperationControl
                                  pageId="roles"
                                  operation="update"
                                >
                                  <button
                                    type="button"
                                    className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                                    onClick={() => handleEdit(role)}
                                  >
                                    <Icon icon="lucide:edit" />
                                  </button>
                                </OperationControl>
                                <OperationControl
                                  pageId="roles"
                                  operation="delete"
                                >
                                  <button
                                    type="button"
                                    className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                                    onClick={() => handleDelete(role)}
                                  >
                                    <Icon icon="mingcute:delete-2-line" />
                                  </button>
                                </OperationControl>
                              </>
                            )}
                            {role.name === "Admin" && (
                              <span className="text-muted text-sm">
                                Protected
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-24">
                <span>
                  Showing {filteredRoles.length === 0 ? 0 : startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredRoles.length)} of{" "}
                  {filteredRoles.length} entries
                  {searchTerm && ` (filtered from ${allRoles.length} total)`}
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
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content radius-16 bg-base">
            <div className="modal-header py-16 px-24 border border-top-0 border-start-0 border-end-0">
              <h1 className="modal-title fs-5">
                {isEdit ? "Update Role" : "Add Role"}
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
            <div className="modal-body p-24">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-12 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Role Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control radius-8"
                      placeholder="Enter Role Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="description"
                      className="form-control radius-8"
                      placeholder="Enter Description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      required
                    />
                  </div>
                  <div className="col-12 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Status
                    </label>
                    <select
                      name="status"
                      className="form-control radius-8"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Permissions Section */}
                  <div className="col-12 mb-20">
                    <div className="d-flex align-items-center justify-content-between mb-12">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-0">
                        Page Access & Operations{" "}
                        <span className="text-danger">*</span>
                      </label>
                      {formData.name !== "Admin" && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary-600"
                          onClick={handleSelectAllAccess}
                        >
                          <Icon
                            icon="ic:baseline-select-all"
                            className="icon me-1"
                          />
                          Toggle All Access
                        </button>
                      )}
                    </div>

                    {formData.name === "Admin" && (
                      <div className="alert alert-info mb-12">
                        <Icon
                          icon="mingcute:information-line"
                          className="me-2"
                        />
                        Admin role has full access to all pages and operations
                        by default.
                      </div>
                    )}

                    <div
                      className="table-responsive"
                      style={{ maxHeight: "400px", overflowY: "auto" }}
                    >
                      <table className="table bordered-table mb-0">
                        <thead
                          style={{
                            position: "sticky",
                            top: 0,
                            backgroundColor: "#fff",
                            zIndex: 10,
                          }}
                        >
                          <tr>
                            <th scope="col" style={{ width: "200px" }}>
                              Page
                            </th>
                            <th
                              scope="col"
                              className="text-center"
                              style={{ width: "100px" }}
                            >
                              Access
                            </th>
                            <th
                              scope="col"
                              className="text-center"
                              style={{ width: "80px" }}
                            >
                              View
                            </th>
                            <th
                              scope="col"
                              className="text-center"
                              style={{ width: "80px" }}
                            >
                              Add
                            </th>
                            <th
                              scope="col"
                              className="text-center"
                              style={{ width: "80px" }}
                            >
                              Update
                            </th>
                            <th
                              scope="col"
                              className="text-center"
                              style={{ width: "80px" }}
                            >
                              Delete
                            </th>
                            <th
                              scope="col"
                              className="text-center"
                              style={{ width: "100px" }}
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getAllPages().map((page) => {
                            const pagePermissions = formData.permissions[
                              page.id
                            ] || {
                              access: false,
                              operations: {
                                view: false,
                                add: false,
                                update: false,
                                delete: false,
                              },
                            };
                            const isDisabled = formData.name === "Admin";
                            const hasAccess =
                              isDisabled || pagePermissions.access;

                            return (
                              <tr key={page.id}>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <Icon
                                      icon={page.icon}
                                      className="text-xl"
                                    />
                                    <span className="fw-medium">
                                      {page.name}
                                    </span>
                                  </div>
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={hasAccess}
                                    disabled={isDisabled}
                                    onChange={() =>
                                      handlePageAccessToggle(page.id)
                                    }
                                  />
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={
                                      isDisabled ||
                                      (hasAccess &&
                                        pagePermissions.operations.view)
                                    }
                                    disabled={isDisabled || !hasAccess}
                                    onChange={() =>
                                      handleOperationToggle(page.id, "view")
                                    }
                                  />
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={
                                      isDisabled ||
                                      (hasAccess &&
                                        pagePermissions.operations.add)
                                    }
                                    disabled={isDisabled || !hasAccess}
                                    onChange={() =>
                                      handleOperationToggle(page.id, "add")
                                    }
                                  />
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={
                                      isDisabled ||
                                      (hasAccess &&
                                        pagePermissions.operations.update)
                                    }
                                    disabled={isDisabled || !hasAccess}
                                    onChange={() =>
                                      handleOperationToggle(page.id, "update")
                                    }
                                  />
                                </td>
                                <td className="text-center">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={
                                      isDisabled ||
                                      (hasAccess &&
                                        pagePermissions.operations.delete)
                                    }
                                    disabled={isDisabled || !hasAccess}
                                    onChange={() =>
                                      handleOperationToggle(page.id, "delete")
                                    }
                                  />
                                </td>
                                <td className="text-center">
                                  {!isDisabled && hasAccess && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() =>
                                        handleSelectAllOperations(page.id)
                                      }
                                      title="Toggle All Operations"
                                    >
                                      <Icon icon="ic:baseline-select-all" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer p-24 border border-top border-start-0 border-end-0 border-bottom-0">
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
            <div className="modal-body p-24">
              <div className="text-center mb-24">
                <Icon
                  icon="mingcute:alert-line"
                  className="text-danger-600 text-4xl mb-16"
                />
                <h6 className="text-lg text-neutral-900 mb-8">Delete Role?</h6>
                <p className="text-sm text-neutral-600 mb-0">
                  Are you sure you want to delete this role? This action cannot
                  be undone.
                </p>
              </div>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <button
                  type="button"
                  className="border border-gray-300 bg-hover-gray-50 text-gray-700 text-md px-24 py-10 radius-8"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger text-md px-24 py-10 radius-8"
                  onClick={confirmDelete}
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

export default RoleAccess;
