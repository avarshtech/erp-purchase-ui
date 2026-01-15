import React, { useState, useEffect } from "react";
import { 
  getAllCategories, 
  getAllSubCategories,
  getAllItemTypes,
  getAllAttributeConfigs, 
  getAllUOMs 
} from "../services/MasterDataService";
import CategoryForm from "../components/master-data/CategoryForm";
import SubCategoryForm from "../components/master-data/SubCategoryForm";
import ItemTypeForm from "../components/master-data/ItemTypeForm";
import AttributesConfigForm from "../components/master-data/AttributesConfigForm";
import UOMForm from "../components/master-data/UOMForm";
import { Icon } from "@iconify/react/dist/iconify.js";

const MasterDataEntry = () => {
  const [activeTab, setActiveTab] = useState("category");
  const [metaData, setMetaData] = useState({
    categories: [],
    subCategories: [],
    itemTypes: [], 
    attributes: [],
    uoms: []
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // For auto-selection in SubCategory
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null); // For auto-selection in ItemType
  const [loading, setLoading] = useState(true);

  const fetchMetaData = async () => {
    try {
      const [categories, subCategories, itemTypes, attributes, uoms] = await Promise.all([
        getAllCategories(),
        getAllSubCategories(),
        getAllItemTypes(),
        getAllAttributeConfigs(),
        getAllUOMs()
      ]);
      
      setMetaData({
        categories: categories || [],
        subCategories: subCategories || [],
        itemTypes: itemTypes || [], 
        attributes: attributes || [], 
        uoms: uoms || []
      });
    } catch (error) {
      console.error("Failed to fetch metadata", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetaData();
  }, []);

  const handleSuccess = (data) => {
    fetchMetaData();
    // Logic for auto-navigation and selection
    if (activeTab === "category" && data && data.id) {
       setSelectedCategoryId(data.id);
       setActiveTab("subcategory");
    } else if (activeTab === "subcategory" && data && data.id) {
        setSelectedSubCategoryId(data.id);
        setActiveTab("itemtype");
    }
  };

  const tabs = [
    { id: "category", label: "Category", icon: "tabler:category" },
    { id: "subcategory", label: "SubCategory", icon: "tabler:category-2" },
    { id: "itemtype", label: "Item Type", icon: "fluent:box-20-regular" },
    { id: "attribute", label: "Attributes Config", icon: "carbon:settings" },
    { id: "uom", label: "Unit of Measure", icon: "tabler:ruler-measure" }
  ];

  return (
    <div className="container-fluid p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
         <div>
            <h6 className="page-title mb-0">Master Data Entry</h6>
            <p className="text-secondary-light text-sm mt-1">Create and manage master data entities.</p>
         </div>
      </div>

      {loading ? (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "400px" }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
      ) : (
        <div className="row">
            <div className="col-12">
               <div className="card h-100">
                  <div className="card-body p-0">
                    <ul className="nav nav-pills nav-fill bg-light rounded-top pattern-bg p-2" role="tablist">
                        {tabs.map((tab) => (
                           <li className="nav-item" role="presentation" key={tab.id}>
                              <button
                                className={`nav-link d-flex align-items-center justify-content-center gap-2 py-3 px-4 ${activeTab === tab.id ? "active bg-white text-primary shadow-sm" : "text-secondary"}`}
                                onClick={() => setActiveTab(tab.id)}
                                type="button"
                                style={{ borderRadius: "8px", transition: "all 0.3s ease" }}
                              >
                                <Icon icon={tab.icon} className="text-xl" />
                                <span className="fw-medium">{tab.label}</span>
                              </button>
                           </li>
                        ))}
                    </ul>
                    
                    <div className="p-4 bg-white rounded-bottom">
                         <div className="row justify-content-center">
                            <div className="col-lg-8 col-xl-6">
                              {activeTab === "category" && (
                                <CategoryForm 
                                  categories={metaData.categories}
                                  onSuccess={handleSuccess} 
                                />
                              )}
                              {activeTab === "subcategory" && (
                                <SubCategoryForm 
                                  categories={metaData.categories} 
                                  subCategories={metaData.subCategories}
                                  selectedCategoryId={selectedCategoryId}
                                  onSuccess={handleSuccess} 
                                />
                              )}
                              {activeTab === "itemtype" && (
                                <ItemTypeForm 
                                  subCategories={metaData.subCategories}
                                  itemTypes={metaData.itemTypes}
                                  attributes={metaData.attributes}
                                  uoms={metaData.uoms}
                                  selectedSubCategoryId={selectedSubCategoryId}
                                  onSuccess={handleSuccess} 
                                />
                              )}
                              {activeTab === "attribute" && (
                                 <AttributesConfigForm 
                                  attributes={metaData.attributes}
                                  itemTypes={metaData.itemTypes}
                                  onSuccess={handleSuccess}
                                 />
                              )}
                              {activeTab === "uom" && (
                                <UOMForm 
                                  uoms={metaData.uoms}
                                  onSuccess={handleSuccess}
                                />
                              )}
                            </div>
                         </div>
                    </div>
                  </div>
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataEntry;
