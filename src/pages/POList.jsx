import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import POListLayer from "../components/POListLayer";

const POList = () => {
    return (
        <>
            <MasterLayout>
                <Breadcrumb title="PO / List"/>
                <POListLayer />
            </MasterLayout>
        </>
    )    
};

export default POList;