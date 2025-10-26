import React, { createContext, useContext, useState, useEffect } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

// Create context for user authentication and role management
const AuthContext = createContext();

// Mock user roles and permissions
const USER_ROLES = {
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    permissions: ['view_po', 'approve_po', 'reject_po', 'bulk_approve', 'bulk_reject', 'export_data', 'view_audit_trail', 'manage_users']
  },
  MANAGER: {
    id: 'manager',
    name: 'Manager',
    permissions: ['view_po', 'approve_po', 'reject_po', 'bulk_approve', 'bulk_reject', 'export_data', 'view_audit_trail']
  },
  FINANCE_MANAGER: {
    id: 'finance_manager',
    name: 'Finance Manager',
    permissions: ['view_po', 'approve_po', 'reject_po', 'bulk_approve', 'bulk_reject', 'export_data', 'view_audit_trail']
  },
  DEPARTMENT_HEAD: {
    id: 'dept_head',
    name: 'Department Head',
    permissions: ['view_po', 'approve_po', 'reject_po', 'export_data', 'view_audit_trail']
  },
  VIEWER: {
    id: 'viewer',
    name: 'Viewer',
    permissions: ['view_po', 'export_data']
  }
};

// Mock current user (in real app, this would come from authentication system)
const MOCK_CURRENT_USER = {
  id: 201,
  name: 'Sarah Johnson',
  email: 'sarah.johnson@company.com',
  role: 'FINANCE_MANAGER',
  avatar: 'assets/images/avatar/avatar2.png',
  department: 'Finance',
  lastLogin: new Date().toISOString()
};

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(MOCK_CURRENT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!isAuthenticated || !currentUser) return false;
    const userRole = USER_ROLES[currentUser.role];
    return userRole?.permissions?.includes(permission) || false;
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions) => {
    if (!isAuthenticated || !currentUser) return false;
    const userRole = USER_ROLES[currentUser.role];
    return permissions.some(permission => userRole?.permissions?.includes(permission));
  };

  // Check if user can perform action on specific PO
  const canPerformAction = (action, po) => {
    if (!hasPermission(action)) return false;
    
    // Additional business logic based on PO status and user role
    switch (action) {
      case 'approve_po':
      case 'reject_po':
        return po.status === 'Pending';
      case 'bulk_approve':
      case 'bulk_reject':
        return hasPermission(action);
      default:
        return true;
    }
  };

  // Get user role information
  const getUserRole = () => {
    return USER_ROLES[currentUser?.role] || null;
  };

  // Login function (mock)
  const login = async (credentials) => {
    setLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentUser(MOCK_CURRENT_USER);
      setIsAuthenticated(true);
      return { success: true, user: MOCK_CURRENT_USER };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    hasPermission,
    hasAnyPermission,
    canPerformAction,
    getUserRole,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Access Control Wrapper Component
export const AccessControlWrapper = ({ 
  children, 
  permission, 
  permissions = [], 
  fallback = null,
  po = null 
}) => {
  const { hasPermission, hasAnyPermission, canPerformAction } = useAuth();

  // Check if user has access
  const hasAccess = permission 
    ? po ? canPerformAction(permission, po) : hasPermission(permission)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
};

// Role-based UI Component
export const RoleBasedUI = ({
  adminComponent,
  managerComponent,
  financeManagerComponent,
  deptHeadComponent,
  viewerComponent,
  defaultComponent
}) => {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role;

  const roleComponents = {
    ADMIN: adminComponent,
    MANAGER: managerComponent,
    FINANCE_MANAGER: financeManagerComponent,
    DEPT_HEAD: deptHeadComponent,
    VIEWER: viewerComponent
  };

  return roleComponents[userRole] || defaultComponent || null;
};

// Access Denied Component
export const AccessDenied = ({ message = "You don't have permission to access this resource." }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <Icon 
        icon="mdi:shield-off-outline" 
        className="text-danger mb-3" 
        style={{ fontSize: '4rem' }}
      />
      <h4 className="text-danger mb-2">Access Denied</h4>
      <p className="text-muted text-center">{message}</p>
      <button 
        className="btn btn-primary mt-3"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
    </div>
  );
};

// Protected Route Component
export const ProtectedRoute = ({ 
  children, 
  permission, 
  permissions = [], 
  fallback 
}) => {
  const { isAuthenticated, hasPermission, hasAnyPermission } = useAuth();

  if (!isAuthenticated) {
    return <AccessDenied message="Please log in to access this page." />;
  }

  const hasAccess = permission 
    ? hasPermission(permission)
    : hasAnyPermission(permissions);

  if (!hasAccess) {
    return fallback || <AccessDenied />;
  }

  return <>{children}</>;
};

// Accessibility Helper Component
export const AccessibilityHelper = () => {
  useEffect(() => {
    // Add ARIA live region for notifications
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'accessibility-live-region';
    document.body.appendChild(liveRegion);

    // Add skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-main';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #007bff;
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Cleanup
    return () => {
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
      if (document.body.contains(skipLink)) {
        document.body.removeChild(skipLink);
      }
    };
  }, []);

  // Function to announce screen reader messages
  const announceToScreenReader = (message) => {
    const liveRegion = document.getElementById('accessibility-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  // Make function globally available
  useEffect(() => {
    window.announceToScreenReader = announceToScreenReader;
  }, []);

  return null;
};

// Keyboard Navigation Helper
export const useKeyboardNavigation = (callbacks = {}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Handle common keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'a':
            if (callbacks.selectAll) {
              event.preventDefault();
              callbacks.selectAll();
            }
            break;
          case 'e':
            if (callbacks.export) {
              event.preventDefault();
              callbacks.export();
            }
            break;
          case 'f':
            if (callbacks.search) {
              event.preventDefault();
              callbacks.search();
            }
            break;
          default:
            // No action for other keys
            break;
        }
      }

      // Handle escape key
      if (event.key === 'Escape' && callbacks.escape) {
        callbacks.escape();
      }

      // Handle help key
      if (event.key === 'F1' && callbacks.help) {
        event.preventDefault();
        callbacks.help();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};

// Focus Management Helper
export const useFocusManagement = (initialFocusRef) => {
  const setFocus = (elementRef) => {
    if (elementRef && elementRef.current) {
      elementRef.current.focus();
    }
  };

  const trapFocus = (containerRef) => {
    if (!containerRef || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Set initial focus
    if (initialFocusRef && initialFocusRef.current) {
      initialFocusRef.current.focus();
    } else if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return { setFocus, trapFocus };
};

export default AuthProvider;