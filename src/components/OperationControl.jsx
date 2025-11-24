import React from "react";
import { getCurrentUser, hasOperationPermission } from "../utils/permissions";

/**
 * Higher-order component that conditionally renders children based on operation permission
 * @param {Object} props - Component props
 * @param {string} props.pageId - The page ID to check permission for
 * @param {string} props.operation - The operation to check (view, add, update, delete)
 * @param {React.ReactNode} props.children - The children to render if permission is granted
 * @param {React.ReactNode} props.fallback - Optional fallback to render if permission is denied
 */
const OperationControl = ({ pageId, operation, children, fallback = null }) => {
  const user = getCurrentUser();

  // Admin always has all permissions
  if (user.role === "Admin") {
    return <>{children}</>;
  }

  // Check if user has the specific operation permission
  if (
    user.permissions &&
    hasOperationPermission(user.permissions, pageId, operation)
  ) {
    return <>{children}</>;
  }

  // Return fallback or null
  return fallback;
};

export default OperationControl;
