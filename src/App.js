import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import MasterLayout from "./masterLayout/MasterLayout";

import PurchaseOrders from "./pages/PurchaseOrders";
import POApproval from "./pages/POApproval";
import POApprovalTestPage from "./pages/POApprovalTestPage";
import SupplierInfo from "./pages/SupplierInfo";
import ItemMaster from "./pages/ItemMaster";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import RoleAccess from "./pages/RoleAccess";
import Unauthorized from "./pages/Unauthorized";
import PermissionsDebug from "./pages/PermissionsDebug";
import ProtectedRoute from "./components/ProtectedRoute";
import { initializeDefaultUser } from "./utils/authHelper";

function App() {
  useEffect(() => {
    // Initialize default user for development/testing
    initializeDefaultUser();
  }, []);

  return (
    <BrowserRouter>
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
            path="/roles"
            element={
              <ProtectedRoute pageId="roles">
                <RoleAccess />
              </ProtectedRoute>
            }
          />
          {/* Public routes - no protection needed */}
          <Route exact path="/profile" element={<Profile />} />
          <Route exact path="/unauthorized" element={<Unauthorized />} />
          <Route
            exact
            path="/permissions-debug"
            element={<PermissionsDebug />}
          />
        </Routes>
      </MasterLayout>
    </BrowserRouter>
  );
}

export default App;
