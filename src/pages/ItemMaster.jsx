import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import ItemListLayer from "../components/ItemListLayer";

const ItemMaster = () => {
    return (
        <>
            <MasterLayout>
                <Breadcrumb title="Item Master / List"/>
                <ItemListLayer />
            </MasterLayout>
        </>
    )    
};

export default ItemMaster;