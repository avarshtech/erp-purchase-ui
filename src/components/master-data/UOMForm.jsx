import React, { useState } from "react";
import { createUOM } from "../../services/MasterDataService";
import { Icon } from "@iconify/react/dist/iconify.js";

const UOMForm = ({ uoms = [], onSuccess }) => {
  const [formData, setFormData] = useState({ id: null, name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUOMs = uoms.filter(uom => 
    uom.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (uom) => {
    setFormData({ id: uom.id, name: uom.name });
    setError("");
    setSuccessMsg("");
  };

  const handleAddNew = () => {
    setFormData({ id: null, name: "" });
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await createUOM(formData);
      setSuccessMsg(formData.id ? "UOM updated successfully!" : "UOM created successfully!");
      if (!formData.id) {
        setFormData({ id: null, name: "" });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to save UOM. Please try again.");
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
               <h6 className="card-title mb-0">UOMs</h6>
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
              {filteredUOMs.map(uom => (
                <button
                  key={uom.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 rounded-2 mb-1 px-3 py-2 ${formData.id === uom.id ? "bg-primary-50 text-primary-600 fw-medium" : ""}`}
                  onClick={() => handleEdit(uom)}
                >
                  {uom.name}
                  <Icon icon="tabler:chevron-right" className="text-secondary opacity-50" />
                </button>
              ))}
              {filteredUOMs.length === 0 && (
                <div className="text-center text-muted py-4 text-sm">No UOMs found</div>
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
              {formData.id ? "Update UOM" : "Add New UOM"}
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
                  Unit Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control radius-8"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kg, Meters"
                  required
                />
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
                      {formData.id ? "Update UOM" : "Create UOM"}
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

export default UOMForm;
