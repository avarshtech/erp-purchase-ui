import React, { useState, useEffect } from "react";
import { createSubCategory } from "../../services/MasterDataService";
import { Icon } from "@iconify/react/dist/iconify.js";

const SubCategoryForm = ({ categories = [], subCategories = [], selectedCategoryId, onSuccess }) => {
  const [formData, setFormData] = useState({ id: null, name: "", categoryId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (selectedCategoryId) {
      setFormData(prev => ({ ...prev, categoryId: selectedCategoryId }));
    }
  }, [selectedCategoryId]);

  const filteredSubCategories = (subCategories || []).filter(sub => 
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (sub) => {
    setFormData({ id: sub.id, name: sub.name, categoryId: sub.categoryId });
    setError("");
    setSuccessMsg("");
  };

  const handleAddNew = () => {
    setFormData({ id: null, name: "", categoryId: selectedCategoryId || "" });
    setError("");
    setSuccessMsg("");
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : "-";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      setError("Please select a category");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const result = await createSubCategory({ 
        id: formData.id,
        name: formData.name, 
        categoryId: parseInt(formData.categoryId) 
      });
      
      setSuccessMsg(formData.id ? "SubCategory updated successfully!" : "SubCategory created successfully!");
      if (!formData.id) {
        setFormData({ id: null, name: "", categoryId: "" });
      }
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError("Failed to save subcategory. Please try again.");
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
               <h6 className="card-title mb-0">SubCategories</h6>
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
              {filteredSubCategories.map(sub => (
                <button
                  key={sub.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex flex-column align-items-start border-0 rounded-2 mb-1 px-3 py-2 ${formData.id === sub.id ? "bg-primary-50 text-primary-600 fw-medium" : ""}`}
                  onClick={() => handleEdit(sub)}
                >
                  <div className="d-flex w-100 justify-content-between align-items-center">
                    <span>{sub.name}</span>
                    <Icon icon="tabler:chevron-right" className="text-secondary opacity-50 text-sm" />
                  </div>
                  <small className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                    {getCategoryName(sub.categoryId)}
                  </small>
                </button>
              ))}
              {filteredSubCategories.length === 0 && (
                <div className="text-center text-muted py-4 text-sm">No subcategories found</div>
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
              {formData.id ? "Update SubCategory" : "Add New SubCategory"}
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
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select radius-8"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select a Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                  SubCategory Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control radius-8"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Laptops"
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
                      {formData.id ? "Update SubCategory" : "Create SubCategory"}
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

export default SubCategoryForm;
