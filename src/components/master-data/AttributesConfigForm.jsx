import React, { useState } from "react";
import { createAttributeConfig } from "../../services/MasterDataService";
import { Icon } from "@iconify/react/dist/iconify.js";

const AttributesConfigForm = ({ attributes = [], onSuccess }) => {
  const [formData, setFormData] = useState({ id: null, attributeName: "", dataType: "string" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAttributes = attributes.filter(attr => 
    (attr.attributeName || attr.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (attr) => {
    setFormData({ 
      id: attr.id, 
      attributeName: attr.attributeName || attr.name || "", 
      dataType: attr.dataType || "string" 
    });
    setError("");
    setSuccessMsg("");
  };

  const handleAddNew = () => {
    setFormData({ id: null, attributeName: "", dataType: "string" });
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await createAttributeConfig({
        id: formData.id,
        attributeName: formData.attributeName,
        dataType: formData.dataType
      });
      setSuccessMsg(formData.id ? "Attribute Config updated successfully!" : "Attribute Config created successfully!");
      if (!formData.id) {
        setFormData({ id: null, attributeName: "", dataType: "string" });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to save attribute config. Please try again.");
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
               <h6 className="card-title mb-0">Attributes</h6>
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
              {filteredAttributes.map(attr => (
                <button
                  key={attr.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 rounded-2 mb-1 px-3 py-2 ${formData.id === attr.id ? "bg-primary-50 text-primary-600 fw-medium" : ""}`}
                  onClick={() => handleEdit(attr)}
                >
                  {attr.attributeName || attr.name}
                  <Icon icon="tabler:chevron-right" className="text-secondary opacity-50" />
                </button>
              ))}
              {filteredAttributes.length === 0 && (
                <div className="text-center text-muted py-4 text-sm">No attributes found</div>
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
              {formData.id ? "Update Attribute Config" : "Add New Attribute Config"}
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
                  Attribute Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control radius-8"
                  value={formData.attributeName}
                  onChange={(e) => setFormData({ ...formData, attributeName: e.target.value })}
                  placeholder="e.g. Screen Size"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  Data Type
                </label>
                <select
                  className="form-select radius-8"
                  value={formData.dataType}
                  onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                </select>
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
                      {formData.id ? "Update Attribute Config" : "Create Attribute Config"}
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

export default AttributesConfigForm;
