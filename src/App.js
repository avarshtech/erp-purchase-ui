import { BrowserRouter, Route, Routes } from "react-router-dom";
import MasterLayout from "./masterLayout/MasterLayout";

import HomePageTen from "./pages/HomePageTen";
import PurchaseOrders from "./pages/PurchaseOrders";
import POApproval from "./pages/POApproval";
import POApprovalTestPage from "./pages/POApprovalTestPage";
import SupplierInfo from "./pages/SupplierInfo";
import ItemMaster from "./pages/ItemMaster";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import RoleAccess from "./pages/RoleAccess";

function App() {
  return (
    <BrowserRouter>
      <MasterLayout>
        <Routes>
          <Route exact path="/" element={<HomePageTen />} />
          <Route exact path="/purchase-orders" element={<PurchaseOrders />} />
          <Route exact path="/po-approval" element={<POApproval />} />
          <Route
            exact
            path="/po-approval-test"
            element={<POApprovalTestPage />}
          />
          <Route exact path="/supplier-info" element={<SupplierInfo />} />
          <Route exact path="/profile" element={<Profile />} />
          <Route exact path="/item-master" element={<ItemMaster />} />
          <Route exact path="/users" element={<Users />} />
          <Route exact path="/roles" element={<RoleAccess />} />
        </Routes>
      </MasterLayout>
    </BrowserRouter>
  );
}

export default App;
