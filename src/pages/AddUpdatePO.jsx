import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import POFormLayer from "../components/POFormLayer";


const AddUpdatePO = () => {
    return (
        <>
            <MasterLayout>
                <Breadcrumb title='Purchase Order / Add-Edit'/>
                <POFormLayer />
            </MasterLayout>
        </>
    )
}

export default AddUpdatePO;