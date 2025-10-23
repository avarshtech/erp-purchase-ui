import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import POApprovalTest from "../components/POApprovalTest";

const POApprovalTestPage = () => {
    return (
        <>
            <MasterLayout>
                <Breadcrumb title="PO Approval Tests"/>
                <POApprovalTest />
            </MasterLayout>
        </>
    )    
};

export default POApprovalTestPage;