import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { getUsers, createUser, updateUser, deleteUser, formatCreatedDate } from "../services/users";
import { getRoles } from "../services/roles";
import OperationControl from "../components/OperationControl";
import { getCurrentUser, hasOperationPermission } from "../utils/permissions";
import { generateUsername } from "../utils/usernameGenerator";
import "../assets/css/users-page.css";
import GlobalToast from "../utils/globalToast";

const Users = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Calculate permissions
  const user = getCurrentUser();
  const canUpdate = user?.permissions
    ? hasOperationPermission(user.permissions, "users", "update")
    : false;
  const canDelete = user?.permissions
    ? hasOperationPermission(user.permissions, "users", "delete")
    : false;
  const showActionsColumn = canUpdate || canDelete;
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    email: "",
    roleId: "",
    isActive: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  // Use GlobalToast for notifications
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // GlobalToast handles auto-dismiss

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
    let filtered = allUsers;

    if (searchTerm) {
      filtered = allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.isActive ? "active" : "inactive").includes(searchTerm.toLowerCase())
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

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, allUsers, sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      setAllUsers(users);
      setFilteredUsers(users);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setRolesLoading(true);
      const response = await getRoles();
      // Handle both array response and object response with data property
      const rolesData = Array.isArray(response) ? response : (response.data || []);
      setRoles(rolesData);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEdit(false);
    setCurrentUser(null);
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      email: "",
      roleId: "",
      isActive: true,
    });
    setShowModal(true);
    fetchRoles();
  };

  const handleEdit = (user) => {
    setIsEdit(true);
    setCurrentUser(user);
    // Split name into firstName and lastName
    const nameParts = (user.name || "").trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    setFormData({
      firstName: firstName,
      lastName: lastName,
      username: user.username || "",
      password: "",
      email: user.email,
      roleId: user.roleId ? String(user.roleId) : "",
      isActive: user.isActive,
    });
    setShowModal(true);
    fetchRoles();
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      GlobalToast.success("User deleted successfully");
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      GlobalToast.error(err.errorMessage || "Failed to delete user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim()) {
      GlobalToast.error("First Name is required.");
      return;
    }
    if (!formData.lastName.trim()) {
      GlobalToast.error("Last Name is required.");
      return;
    }
    if (!formData.username.trim()) {
      GlobalToast.error("Username is required.");
      return;
    }
    if (formData.username.length < 3) {
      GlobalToast.error("Username must be at least 3 characters.");
      return;
    }
    if (!isEdit && !formData.password.trim()) {
      GlobalToast.error("Password is required.");
      return;
    }
    if (!isEdit && formData.password.length < 6) {
      GlobalToast.error("Password must be at least 6 characters.");
      return;
    }
    if (!formData.email.trim()) {
      GlobalToast.error("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      GlobalToast.error("Invalid email format.");
      return;
    }
    if (!formData.roleId) {
      GlobalToast.error("Role is required.");
      return;
    }

    try {
      // Construct payload with concatenated name
      const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`;      
      if (isEdit) {
        // Update payload for PUT /users/{id}
        const payload = {
          id: currentUser.id,
          name: name,
          username: formData.username.trim(),
          email: formData.email.trim(),
          roleId: parseInt(formData.roleId),
          isActive: formData.isActive,
        };
        await updateUser(currentUser.id, payload);
        GlobalToast.success("User updated successfully");
      } else {
        // Get roleName from fetched roles for create
        const selectedRole = roles.find(r => String(r.id) === formData.roleId);
        const roleName = selectedRole?.name || "";
        // Create payload without id, use username from form
        const payload = {
          name: name,
          username: formData.username.trim(),
          password: formData.password,
          email: formData.email.trim(),
          roleId: parseInt(formData.roleId),
          roleName: roleName,
          isActive: formData.isActive,
        };
        await createUser(payload);
        GlobalToast.success("User created successfully");
      }
      setShowModal(false);
      await fetchUsers();
    } catch (err) {
      GlobalToast.error(err.errorMessage || `Failed to ${isEdit ? "update" : "create"} user. Please try again.`);
      console.error(`Error ${isEdit ? "updating" : "creating"} user:`, err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation: firstName and lastName should only contain letters and spaces
    if (name === "firstName" || name === "lastName") {
      if (value === "" || /^[a-zA-Z\s]+$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      return;
    }

    // Validation: username should only contain alphanumeric characters and underscores
    if (name === "username") {
      if (value === "" || /^[a-zA-Z0-9_]+$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      return;
    }

    // Handle isActive as boolean
    if (name === "isActive") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "true",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Auto-generate username when both firstName and lastName are filled (only in add mode)
  const handleNameBlur = () => {
    if (!isEdit && formData.firstName.trim() && formData.lastName.trim()) {
      try {
        const generatedUsername = generateUsername(formData.firstName, formData.lastName);
        setFormData((prev) => ({
          ...prev,
          username: generatedUsername,
        }));
      } catch (error) {
        console.error("Error generating username:", error);
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
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      {/* GlobalToast handles notifications */}
      <h6 className="page-title">Users</h6>
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
          <OperationControl pageId="users" operation="add">
            <button
              type="button"
              className="btn btn-sm btn-primary-600"
              onClick={handleAdd}
            >
              <Icon
                icon="ic:baseline-plus"
                className="icon text-xl line-height-1"
              />
              Add User
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
                <h6 className="text-muted">Loading users...</h6>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-4">
              <div className="card border">
                <div className="card-body">
                  <h6 className="text-md text-secondary-light mb-16">
                    No Users Found
                  </h6>
                  <button
                    type="button"
                    className="btn btn-primary-600"
                    onClick={handleAdd}
                  >
                    Add User
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
                      <th scope="col" style={{ width: "150px" }}>
                        UserId
                      </th>
                      <th
                        scope="col"
                        className="cursor-pointer"
                        onClick={() => handleSort("name")}
                        style={{ width: "200px" }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          Name
                          {sortField === "name" && (
                            <Icon
                              icon={`mdi:arrow-${
                                sortDirection === "asc" ? "up" : "down"
                              }`}
                            />
                          )}
                        </div>
                      </th>
                      <th scope="col" style={{ width: "250px" }}>
                        Email
                      </th>
                      <th scope="col" style={{ width: "150px" }}>
                        Role
                      </th>
                      <th scope="col" style={{ width: "120px" }}>
                        Status
                      </th>
                      <th
                        scope="col"
                        className="cursor-pointer"
                        onClick={() => handleSort("createdAt")}
                        style={{ width: "150px" }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          Created Date
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
                        <th scope="col" className="sticky-actions">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.roleName}</td>
                        <td>
                          <span
                            className={`badge ${
                              user.isActive
                                ? "bg-success-focus text-success-main"
                                : "bg-danger-focus text-danger-main"
                            } px-16 py-4 radius-4 fw-medium text-sm`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>{formatCreatedDate(user.createdAt)}</td>
                        {showActionsColumn && (
                          <td className="sticky-actions">
                            {user.roleName !== "Super Admin" && (
                              <>
                                <OperationControl
                                  pageId="users"
                                  operation="update"
                                >
                                  <button
                                    type="button"
                                    className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                                    onClick={() => handleEdit(user)}
                                  >
                                    <Icon icon="lucide:edit" />
                                  </button>
                                </OperationControl>
                                <OperationControl
                                  pageId="users"
                                  operation="delete"
                                >
                                  <button
                                    type="button"
                                    className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                                    onClick={() => handleDelete(user)}
                                  >
                                    <Icon icon="mingcute:delete-2-line" />
                                  </button>
                                </OperationControl>
                              </>
                            )}
                            {user.roleName === "Super Admin" && (
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
                  Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredUsers.length)} of{" "}
                  {filteredUsers.length} entries
                  {searchTerm && ` (filtered from ${allUsers.length} total)`}
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
          <div className="modal-content radius-16 bg-base" style={{ position: 'relative' }}>
            <div className="modal-header py-16 px-24 border border-top-0 border-start-0 border-end-0">
              <h1 className="modal-title fs-5">
                {isEdit ? "Update User" : "Add User"}
              </h1>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              />
            </div>
            
            {/* Loading overlay - covers modal body and footer */}
            {rolesLoading && (
              <div className="modal-loading-overlay">
                <div className="text-center">
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h6>Loading roles...</h6>
                </div>
              </div>
            )}

            <div className="modal-body p-24">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      First Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-control radius-8"
                      placeholder="Enter First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleNameBlur}
                      required
                    />
                  </div>
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-control radius-8"
                      placeholder="Enter Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleNameBlur}
                      required
                    />
                  </div>
                  <div className={`${isEdit ? 'col-12' : 'col-6'} mb-20`}>
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      className="form-control radius-8"
                      placeholder="Enter Username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {!isEdit && (
                    <div className="col-6 mb-20">
                      <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="form-control radius-8"
                        placeholder="Enter Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}
                  <div className="col-12 mb-20">
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
                      required
                    />
                  </div>
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Role <span className="text-danger">*</span>
                    </label>
                    <select
                      name="roleId"
                      className="form-select radius-8"
                      value={formData.roleId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-6 mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Status
                    </label>
                    <select
                      name="isActive"
                      className="form-select radius-8"
                      value={formData.isActive.toString()}
                      onChange={handleChange}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer p-24 border border-top border-start-0 border-end-0 border-bottom-0">
              <div className="d-flex align-items-center justify-content-center gap-3 w-100">
                <button
                  type="button"
                  className="border border-gray-300 bg-hover-gray-50 text-gray-700 text-md px-40 py-11 radius-8"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary border border-primary-600 text-md px-48 py-12 radius-8"
                  onClick={handleSubmit}
                  disabled={rolesLoading}
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
                <h6 className="text-lg text-neutral-900 mb-8">Delete User?</h6>
                <p className="text-sm text-neutral-600 mb-0">
                  Are you sure you want to delete this user? This action cannot
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

export default Users;
