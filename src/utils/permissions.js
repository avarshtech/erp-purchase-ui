// Define all pages in the application
export const PAGES = {
  PURCHASE_ORDERS: {
    id: "purchase-orders",
    name: "Purchase Orders",
    path: "/purchase-orders",
    icon: "mingcute:storage-line",
  },
  PO_APPROVAL: {
    id: "po-approval",
    name: "PO Approval",
    path: "/po-approval",
    icon: "mingcute:department-line",
  },
  SUPPLIER_INFO: {
    id: "supplier-info",
    name: "Supplier Info",
    path: "/supplier-info",
    icon: "mingcute:shop-line",
  },
  ITEM_MASTER: {
    id: "item-master",
    name: "Item Master",
    path: "/item-master",
    icon: "mingcute:inventory-line",
  },
  USERS: {
    id: "users",
    name: "Users",
    path: "/users",
    icon: "mingcute:group-3-line",
  },
  ROLES: {
    id: "roles",
    name: "Role & Access",
    path: "/roles",
    icon: "mingcute:user-follow-line",
  },
  PROFILE: {
    id: "profile",
    name: "Profile",
    path: "/profile",
    icon: "solar:user-linear",
  },
};

// Define operations
export const OPERATIONS = {
  VIEW: { id: "view", name: "View" },
  ADD: { id: "add", name: "Add" },
  UPDATE: { id: "update", name: "Update" },
  DELETE: { id: "delete", name: "Delete" },
};

// Get all pages as array
export const getAllPages = () => Object.values(PAGES);

// Get all operations as array
export const getAllOperations = () => Object.values(OPERATIONS);

// Get pages that should appear in sidebar (excluding profile)
export const getSidebarPages = () =>
  getAllPages().filter((page) => page.id !== "profile");

// Default Admin permissions (all access and all operations)
export const getAdminPermissions = () => {
  const permissions = {};
  Object.values(PAGES).forEach((page) => {
    permissions[page.id] = {
      access: true,
      operations: {
        view: true,
        add: true,
        update: true,
        delete: true,
      },
    };
  });
  return permissions;
};

// Create empty permissions structure
export const getEmptyPermissions = () => {
  const permissions = {};
  Object.values(PAGES).forEach((page) => {
    permissions[page.id] = {
      access: false,
      operations: {
        view: false,
        add: false,
        update: false,
        delete: false,
      },
    };
  });
  return permissions;
};

// Check if user has access to a page
export const hasPageAccess = (permissions, pageId) => {
  if (!permissions || !permissions[pageId]) return false;
  return permissions[pageId].access === true;
};

// Check if user has operation permission on a page
export const hasOperationPermission = (permissions, pageId, operationId) => {
  if (!permissions || !permissions[pageId]) return false;
  if (!permissions[pageId].access) return false;
  return permissions[pageId].operations[operationId] === true;
};

// Get user permissions from localStorage (or context in real app)
export const getCurrentUserPermissions = () => {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

  // Admin has all permissions
  if (user.role === "Admin") {
    return getAdminPermissions();
  }

  // For other roles, get from role permissions
  return user.permissions || getEmptyPermissions();
};

// Set current user in localStorage
export const setCurrentUser = (user) => {
  localStorage.setItem("currentUser", JSON.stringify(user));
};

// Get current user
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("currentUser") || "{}");
};
