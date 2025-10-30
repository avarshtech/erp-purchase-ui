import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import ItemFormLayer from "../components/ItemFormLayer";

const ItemAddEdit = () => {
    return (
        <>
            <MasterLayout>
                <Breadcrumb title='Item Master / Add-Edit'/>
                <ItemFormLayer />
            </MasterLayout>
        </>
    )
};

export default ItemAddEdit;