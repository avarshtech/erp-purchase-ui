import React, { useState, useEffect } from "react";
import { createItemType } from "../../services/MasterDataService";
import { Icon } from "@iconify/react/dist/iconify.js";

const ItemTypeForm = ({ subCategories = [], itemTypes = [], attributes = [], uoms = [], selectedSubCategoryId, onSuccess }) => {
  const [formData, setFormData] = useState({ 
    id: null, 
    name: "", 
    subCategoryId: "", 
    selectedAttributeIds: [], 
    selectedUomIds: [] 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedSubCategoryId) {
      setFormData(prev => ({ ...prev, subCategoryId: selectedSubCategoryId }));
    }
  }, [selectedSubCategoryId]);

  const filteredItemTypes = (itemTypes || []).filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      subCategoryId: item.subCategoryId,
      selectedAttributeIds: item.attributes ? item.attributes.map(a => a.id) : item.attributeIds || [],
      selectedUomIds: item.uoms ? item.uoms.map(u => u.id) : item.uomIds || []
    });
    setError("");
    setSuccessMsg("");
  };

  const handleAddNew = () => {
    setFormData({
      id: null,
      name: "",
      subCategoryId: selectedSubCategoryId || "",
      selectedAttributeIds: [],
      selectedUomIds: []
    });
    setError("");
    setSuccessMsg("");
  };
  
  const getSubCategoryName = (subId) => {
     const sub = subCategories.find(s => s.id === subId);
     return sub ? sub.name : "-";
  };

  const toggleSelection = (id, list, key) => {
    let newList;
    if (list.includes(id)) {
      newList = list.filter(item => item !== id);
    } else {
      newList = [...list, id];
    }
    setFormData(prev => ({ ...prev, [key]: newList }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subCategoryId) {
      setError("Please select a subcategory");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const result = await createItemType({
        id: formData.id,
        name: formData.name,
        subCategoryId: parseInt(formData.subCategoryId),
        attributeIds: formData.selectedAttributeIds,
        uomIds: formData.selectedUomIds
      });
      
      setSuccessMsg(formData.id ? "Item Type updated successfully!" : "Item Type created successfully!");
      if (!formData.id) {
        setFormData({
           id: null,
           name: "",
           subCategoryId: "",
           selectedAttributeIds: [],
           selectedUomIds: []
        });
      }
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError("Failed to save item type. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row h-100">
      {/* Left Column: List */}
      <div className="col-md-5 col-lg-4 border-end">
        <div className="card h-100 shadow-none border-0">
          <div className="card-header bg-white border-bottom-0 px-0 pt-0">
            <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
               <h6 className="card-title mb-0">Item Types</h6>
               <button 
                type="button" 
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                onClick={handleAddNew}
               >
                 <Icon icon="ic:baseline-plus" /> New
               </button>
            </div>
            <div className="position-relative">
               <input
                type="text"
                className="form-control form-control-sm ps-5"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Icon icon="ion:search-outline" className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
            </div>
          </div>
          <div className="card-body px-0 pt-2 overflow-auto" style={{ maxHeight: "400px" }}>
            <ul className="list-group list-group-flush">
              {filteredItemTypes.map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex flex-column align-items-start border-0 rounded-2 mb-1 px-3 py-2 ${formData.id === item.id ? "bg-primary-50 text-primary-600 fw-medium" : ""}`}
                  onClick={() => handleEdit(item)}
                >
                  <div className="d-flex w-100 justify-content-between align-items-center">
                    <span>{item.name}</span>
                    <Icon icon="tabler:chevron-right" className="text-secondary opacity-50 text-sm" />
                  </div>
                  <small className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                    {getSubCategoryName(item.subCategoryId)}
                  </small>
                </button>
              ))}
              {filteredItemTypes.length === 0 && (
                <div className="text-center text-muted py-4 text-sm">No item types found</div>
              )}
            </ul>
          </div>
        </div>
      </div>

       {/* Right Column: Form */}
       <div className="col-md-7 col-lg-8 ps-md-4">
        <div className="card h-100 shadow-sm">
          <div className="card-header">
            <h6 className="card-title mb-0">
               {formData.id ? "Update Item Type" : "Add New Item Type"}
            </h6>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                <Icon icon="mingcute:alert-line" className="me-2 text-xl" />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                <Icon icon="mingcute:check-circle-line" className="me-2 text-xl" />
                {successMsg}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  SubCategory <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select radius-8"
                  value={formData.subCategoryId}
                  onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                  required
                >
                  <option value="">Select a SubCategory</option>
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Item Type Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control radius-8"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Smartphone"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Attributes (Multi-select)
                </label>
                <div className="border border-gray-300 rounded-3 p-3 overflow-auto" style={{ maxHeight: "150px" }}>
                  {attributes.length === 0 && <span className="text-muted text-sm">No attributes available</span>}
                  {attributes.map((attr) => (
                    <div key={attr.id} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`attr-${attr.id}`}
                        checked={formData.selectedAttributeIds.includes(attr.id)}
                        onChange={() => toggleSelection(attr.id, formData.selectedAttributeIds, 'selectedAttributeIds')}
                      />
                      <label htmlFor={`attr-${attr.id}`} className="form-check-label">
                        {attr.attributeName || attr.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Unit of Measures (Multi-select)
                </label>
                <div className="border border-gray-300 rounded-3 p-3 overflow-auto" style={{ maxHeight: "150px" }}>
                {uoms.length === 0 && <span className="text-muted text-sm">No UOMs available</span>}
                  {uoms.map((uom) => (
                    <div key={uom.id} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`uom-${uom.id}`}
                        checked={formData.selectedUomIds.includes(uom.id)}
                        onChange={() => toggleSelection(uom.id, formData.selectedUomIds, 'selectedUomIds')}
                      />
                      <label htmlFor={`uom-${uom.id}`} className="form-check-label">
                        {uom.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="d-flex justify-content-end mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary-600 d-flex align-items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                       <Icon icon={formData.id ? "mingcute:refresh-2-line" : "mingcute:check-circle-line"} className="text-xl" />
                      {formData.id ? "Update Item Type" : "Create Item Type"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemTypeForm;
