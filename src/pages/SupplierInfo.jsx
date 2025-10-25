import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import SupplierModalLayer from "../components/SupplierModalLayer";
import "../assets/css/supplier-info.css";

const SupplierInfo = () => {
  return (
    <>
      <MasterLayout>
        <Breadcrumb page="Vendor Details" title="Supplier Info" />
        <SupplierModalLayer />
      </MasterLayout>
    </>
  );
};

export default SupplierInfo;
