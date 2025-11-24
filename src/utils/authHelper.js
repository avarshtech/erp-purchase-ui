import { setCurrentUser, getAdminPermissions } from "../utils/permissions";
import { getRoles } from "../mocks/server";

/**
 * Initialize a default user for development/testing
 * In production, this would come from authentication
 */
export const initializeDefaultUser = () => {
  // Check if a user is already set
  const existingUser = localStorage.getItem("currentUser");

  if (!existingUser) {
    // Set default Admin user for development
    const defaultUser = {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      role: "Admin",
      permissions: getAdminPermissions(),
    };

    setCurrentUser(defaultUser);
    console.log("Default Admin user initialized");
  }
};

/**
 * Switch to a different user (for testing purposes)
 * @param {string} roleName - Role name to switch to
 */
export const switchUserRole = async (roleName) => {
  try {
    // Fetch roles from the server
    const response = await getRoles();
    const roles = response.data;

    // Find the role by name
    const role = roles.find((r) => r.name === roleName);

    if (!role) {
      console.error(`Role "${roleName}" not found`);
      alert(
        `Role "${roleName}" not found. Please create it first in Role & Access page.`
      );
      return;
    }

    // Create user with the role's permissions
    const user = {
      id: role.id,
      name: `${roleName} User`,
      email: `${roleName.toLowerCase()}@example.com`,
      role: roleName,
      permissions: role.permissions || {},
    };

    setCurrentUser(user);
    console.log(`Switched to ${roleName}`, user);

    // Reload the page to apply new permissions
    window.location.reload();
  } catch (error) {
    console.error("Error switching role:", error);
    alert("Failed to switch role. Please try again.");
  }
};
