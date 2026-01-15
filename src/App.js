import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import MasterLayout from "./masterLayout/MasterLayout";

import PurchaseOrders from "./pages/PurchaseOrders";
import POApproval from "./pages/POApproval";
import POApprovalTestPage from "./pages/POApprovalTestPage";
import SupplierInfo from "./pages/SupplierInfo";
import ItemMaster from "./pages/ItemMaster";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import MasterDataEntry from "./pages/MasterDataEntry";

import RoleAccess from "./pages/RoleAccess";
import Unauthorized from "./pages/Unauthorized";
import PermissionsDebug from "./pages/PermissionsDebug";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { initializeDefaultUser, isAuthenticated } from "./utils/authHelper";

// Auth wrapper component to handle authentication redirects
function AuthWrapper({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize and check auth
    initializeDefaultUser();
    // Check auth status (not storing in state as we use navigate)
    isAuthenticated();
    setLoading(false);

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      const isAuth = isAuthenticated();

      // If user logged out, redirect to login
      if (!isAuth && location.pathname !== "/login") {
        navigate("/login");
      }
      // If user logged in and on login page, redirect to purchase orders
      if (isAuth && location.pathname === "/login") {
        navigate("/purchase-orders");
      }
    };

    // Custom event for auth changes
    window.addEventListener("authChange", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("authChange", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return null;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes with MasterLayout */}
          <Route
            path="/*"
            element={
              <MasterLayout>
                <Routes>
                  <Route
                    exact
                    path="/"
                    element={<Navigate to="/purchase-orders" replace />}
                  />
                  <Route
                    exact
                    path="/purchase-orders"
                    element={
                      <ProtectedRoute pageId="purchase-orders">
                        <PurchaseOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    exact
                    path="/po-approval"
                    element={
                      <ProtectedRoute pageId="po-approval">
                        <POApproval />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    exact
                    path="/po-approval-test"
                    element={
                      <ProtectedRoute pageId="po-approval">
                        <POApprovalTestPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    exact
                    path="/supplier-info"
                    element={
                      <ProtectedRoute pageId="supplier-info">
                        <SupplierInfo />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    exact
                    path="/item-master"
                    element={
                      <ProtectedRoute pageId="item-master">
                        <ItemMaster />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    exact
                    path="/users"
                    element={
                      <ProtectedRoute pageId="users">
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    exact
                    path="/master-data-entry"
                    element={
                      <ProtectedRoute pageId="item-master">
                         <MasterDataEntry />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    exact
                    path="/roles"
                    element={
                      <ProtectedRoute pageId="roles">
                        <RoleAccess />
                      </ProtectedRoute>
                    }
                  />
                  {/* Public routes */}
                  <Route exact path="/profile" element={<Profile />} />
                  <Route
                    exact
                    path="/unauthorized"
                    element={<Unauthorized />}
                  />
                  <Route
                    exact
                    path="/permissions-debug"
                    element={<PermissionsDebug />}
                  />
                </Routes>
              </MasterLayout>
            }
          />
        </Routes>
      </AuthWrapper>
    </BrowserRouter>
  );
}

export default App;
