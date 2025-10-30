import React from "react";
import Breadcrumb from "../components/Breadcrumb";
import POFormLayer from "../components/POFormLayer";


const AddUpdatePO = () => {
    return (
        <>
            <Breadcrumb title='Purchase Order / Add-Edit'/>
            <POFormLayer />
        </>
    )
}

export default AddUpdatePO;