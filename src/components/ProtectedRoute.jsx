import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser, hasPageAccess } from "../utils/permissions";

/**
 * ProtectedRoute component that checks if the user has access to a page
 * @param {Object} props - Component props
 * @param {string} props.pageId - The page ID to check access for
 * @param {React.Component} props.children - The children components to render if access is granted
 */
const ProtectedRoute = ({ pageId, children }) => {
  const user = getCurrentUser();

  // If no user is logged in, redirect to login
  if (!user || !user.role) {
    console.warn("No user found. Redirecting to login page.");
    return <Navigate to="/login" replace />;
  }

  // Admin always has access
  if (user && user.role === "Admin") {
    return children;
  }

  // Check if user has access to this page
  if (user && user.permissions && hasPageAccess(user.permissions, pageId)) {
    return children;
  }

  // If no access, redirect to unauthorized page
  console.log(
    `User "${user.name}" (${user.role}) does not have access to page: ${pageId}`
  );
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
