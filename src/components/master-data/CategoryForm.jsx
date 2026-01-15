import React, { useState } from "react";
import { createCategory } from "../../services/MasterDataService";
import { Icon } from "@iconify/react/dist/iconify.js";

const CategoryForm = ({ categories = [], onSuccess }) => {
  const [formData, setFormData] = useState({ id: null, name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (category) => {
    setFormData({ id: category.id, name: category.name });
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
      const result = await createCategory(formData);
      setSuccessMsg(formData.id ? "Category updated successfully!" : "Category created successfully!");
      if (!formData.id) {
         setFormData({ id: null, name: "" });
      }
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError("Failed to save category. Please try again.");
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
               <h6 className="card-title mb-0">Categories</h6>
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
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center border-0 rounded-2 mb-1 px-3 py-2 ${formData.id === cat.id ? "bg-primary-50 text-primary-600 fw-medium" : ""}`}
                  onClick={() => handleEdit(cat)}
                >
                  {cat.name}
                  <Icon icon="tabler:chevron-right" className="text-secondary opacity-50" />
                </button>
              ))}
              {filteredCategories.length === 0 && (
                <div className="text-center text-muted py-4 text-sm">No categories found</div>
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
              {formData.id ? "Update Category" : "Add New Category"}
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
                  Category Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control radius-8"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Electronics"
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
                      {formData.id ? "Update Category" : "Create Category"}
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

export default CategoryForm;
