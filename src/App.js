import { BrowserRouter, Route, Routes } from "react-router-dom";
import MasterLayout from "./masterLayout/MasterLayout";

import HomePageTen from "./pages/HomePageTen";
import POList from "./pages/POList";
import AddUpdatePO from "./pages/AddUpdatePO";
import POApproval from "./pages/POApproval";
import POApprovalTestPage from "./pages/POApprovalTestPage";
import SupplierInfo from "./pages/SupplierInfo";
import Profile from "./pages/Profile";
import ItemMaster from "./pages/ItemMaster";
import ItemAddEdit from "./pages/ItemAddEdit";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<HomePageTen />} />
        <Route exact path='/po-list' element={<POList />} />
        <Route exact path='/addeditpo' element={<AddUpdatePO />} />
        <Route exact path='/po-approval' element={<POApproval />} />
        <Route exact path='/po-approval-test' element={<POApprovalTestPage />} />
        <Route exact path="/supplier-info" element={<SupplierInfo />} />
        <Route exact path="/profile" element={<Profile />} />
        <Route exact path="/item-master" element={<ItemMaster />} />
        <Route exact path="/item-master/add" element={<ItemAddEdit />} />
        <Route exact path="/item-master/edit/:id" element={<ItemAddEdit />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
