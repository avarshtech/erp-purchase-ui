import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  getCurrentUser,
  getAllPages,
  getAllOperations,
  hasPageAccess,
  hasOperationPermission,
} from "../utils/permissions";
import { switchUserRole } from "../utils/authHelper";

const PermissionsDebug = () => {
  const user = getCurrentUser();
  const pages = getAllPages();
  const operations = getAllOperations();

  const handleSwitchRole = (role) => {
    if (window.confirm(`Switch to ${role} role? The page will reload.`)) {
      switchUserRole(role);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">Permissions Debug Panel</h5>
      </div>
      <div className="card-body">
        {/* Current User Info */}
        <div className="mb-4 p-3 bg-light rounded">
          <h6 className="mb-3">Current User</h6>
          <div className="row">
            <div className="col-md-6">
              <p>
                <strong>Name:</strong> {user.name || "Not logged in"}
              </p>
              <p>
                <strong>Email:</strong> {user.email || "N/A"}
              </p>
            </div>
            <div className="col-md-6">
              <p>
                <strong>Role:</strong>{" "}
                <span className="badge bg-primary">{user.role || "None"}</span>
              </p>
              <p>
                <strong>User ID:</strong> {user.id || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Role Switcher (for testing) */}
        <div className="mb-4">
          <h6 className="mb-3">Switch Role (Testing Only)</h6>
          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleSwitchRole("Admin")}
            >
              Switch to Admin
            </button>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => handleSwitchRole("Manager")}
            >
              Switch to Manager
            </button>
            <button
              className="btn btn-sm btn-info"
              onClick={() => handleSwitchRole("Viewer")}
            >
              Switch to Viewer
            </button>
          </div>
          <p className="text-muted mt-2">
            <Icon icon="mingcute:information-line" className="me-1" />
            Note: Switching roles will reload the page. Make sure you've created
            the Manager and Viewer roles first.
          </p>
        </div>

        {/* Permissions Matrix */}
        <div>
          <h6 className="mb-3">Permissions Matrix</h6>
          <div className="table-responsive">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Page</th>
                  <th className="text-center">Access</th>
                  {operations.map((op) => (
                    <th key={op.id} className="text-center">
                      {op.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => {
                  const access = hasPageAccess(user.permissions, page.id);
                  return (
                    <tr key={page.id}>
                      <td>
                        <Icon icon={page.icon} className="me-2" />
                        {page.name}
                      </td>
                      <td className="text-center">
                        {access ? (
                          <Icon
                            icon="mingcute:check-fill"
                            className="text-success"
                          />
                        ) : (
                          <Icon
                            icon="mingcute:close-fill"
                            className="text-danger"
                          />
                        )}
                      </td>
                      {operations.map((op) => {
                        const hasPermission = hasOperationPermission(
                          user.permissions,
                          page.id,
                          op.id
                        );
                        return (
                          <td key={op.id} className="text-center">
                            {access && hasPermission ? (
                              <Icon
                                icon="mingcute:check-fill"
                                className="text-success"
                              />
                            ) : (
                              <Icon
                                icon="mingcute:close-fill"
                                className="text-muted"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Raw Permissions Data */}
        <div className="mt-4">
          <h6 className="mb-3">Raw Permissions Data</h6>
          <pre
            className="bg-dark text-white p-3 rounded"
            style={{ maxHeight: "400px", overflow: "auto" }}
          >
            {JSON.stringify(user.permissions, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PermissionsDebug;
