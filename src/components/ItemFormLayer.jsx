import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getCategories, getSubcategories, getItemTypes, getAttributes, getItemById, checkDuplicateItem, createItem, updateItem } from '../mocks/server';

const ItemFormLayer = ({ onSuccess }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [itemTypes, setItemTypes] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [formData, setFormData] = useState({
        itemName: '',
        categoryId: '',
        subCategoryId: '',
        itemTypeId: '',
        uomId: '',
        hsnCode: '',
        isActive: true,
        attributes: {}
    });
    const [errors, setErrors] = useState({});
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateInfo, setDuplicateInfo] = useState(null);

    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleCategoryChange = useCallback(async (categoryId) => {
        setFormData(prev => ({ ...prev, categoryId, subCategoryId: '', itemTypeId: '', attributes: {} }));
        setSubcategories([]);
        setItemTypes([]);
        setAttributes([]);
        if (categoryId) {
            try {
                const response = await getSubcategories(categoryId);
                setSubcategories(response.data);
            } catch (err) {
                console.error('Error fetching subcategories:', err);
            }
        }
    }, []);

    const handleSubcategoryChange = useCallback(async (subCategoryId) => {
        setFormData(prev => ({ ...prev, subCategoryId, itemTypeId: '', attributes: {} }));
        setItemTypes([]);
        setAttributes([]);
        if (subCategoryId) {
            try {
                const response = await getItemTypes(subCategoryId);
                setItemTypes(response.data);
            } catch (err) {
                console.error('Error fetching item types:', err);
            }
        }
    }, []);

    const handleItemTypeChange = useCallback(async (itemTypeId, subCategoryId = formData.subCategoryId) => {
        setFormData(prev => ({ ...prev, itemTypeId, attributes: {} }));
        setAttributes([]);
        if (itemTypeId && subCategoryId) {
            try {
                const response = await getAttributes(subCategoryId, itemTypeId);
                setAttributes(response.data);
            } catch (err) {
                console.error('Error fetching attributes:', err);
            }
        }
    }, [formData.subCategoryId]);

    const fetchItem = useCallback(async () => {
        try {
            const response = await getItemById(id);
            const item = response.data;
            setFormData({
                itemName: item.itemName,
                categoryId: item.categoryId,
                subCategoryId: item.subCategoryId,
                itemTypeId: item.itemTypeId,
                uomId: item.uomId,
                hsnCode: item.hsnCode,
                isActive: item.isActive,
                attributes: item.attributes
            });
            // Fetch subcategories, itemTypes, attributes based on selections
            await handleCategoryChange(item.categoryId);
            await handleSubcategoryChange(item.subCategoryId);
            await handleItemTypeChange(item.itemTypeId, item.subCategoryId);
        } catch (err) {
            console.error('Error fetching item:', err);
        }
    }, [id, handleCategoryChange, handleSubcategoryChange, handleItemTypeChange]);

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchItem();
        }
    }, [isEdit, fetchItem]);

    const handleAttributeChange = (attributeId, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [attributeId]: value }
        }));
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.itemName.trim()) newErrors.itemName = 'Item Name is required';
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';
        if (!formData.subCategoryId) newErrors.subCategoryId = 'Subcategory is required';
        if (!formData.itemTypeId) newErrors.itemTypeId = 'Item Type is required';
        if (!formData.uomId) newErrors.uomId = 'UOM is required';
        if (!formData.hsnCode.trim()) newErrors.hsnCode = 'HSN Code is required';

        // Validate mandatory attributes
        attributes.forEach(attr => {
            if (!attr.is_common && !formData.attributes[attr.id]) {
                newErrors[`attribute_${attr.id}`] = `${attr.attribute_name} is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors');
            return;
        }

        try {
            setLoading(true);
            const attributeArray = attributes.map(attr => ({
                attributeId: attr.id,
                value: formData.attributes[attr.id] || ''
            }));

            const payload = {
                categoryId: parseInt(formData.categoryId),
                subCategoryId: parseInt(formData.subCategoryId),
                itemTypeId: parseInt(formData.itemTypeId),
                attributes: attributeArray
            };

            const duplicateResponse = await checkDuplicateItem(payload);
            if (duplicateResponse.isDuplicate) {
                setDuplicateInfo(duplicateResponse);
                setShowDuplicateModal(true);
                return;
            }

            const itemData = {
                itemName: formData.itemName,
                categoryId: parseInt(formData.categoryId),
                subCategoryId: parseInt(formData.subCategoryId),
                itemTypeId: parseInt(formData.itemTypeId),
                uomId: formData.uomId,
                hsnCode: formData.hsnCode,
                isActive: formData.isActive,
                attributes: attributeArray
            };

            if (isEdit) {
                await updateItem(id, itemData);
                toast.success('Item updated successfully');
                navigate('/item-master');
            } else {
                await createItem(itemData);
                toast.success('Item created successfully');
                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate('/item-master');
                }
            }
        } catch (err) {
            toast.error('Failed to save item');
            console.error('Error saving item:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOverrideDuplicate = async () => {
        try {
            setLoading(true);
            const attributeArray = attributes.map(attr => ({
                attributeId: attr.id,
                value: formData.attributes[attr.id] || ''
            }));

            const itemData = {
                itemName: formData.itemName,
                categoryId: parseInt(formData.categoryId),
                subCategoryId: parseInt(formData.subCategoryId),
                itemTypeId: parseInt(formData.itemTypeId),
                uomId: formData.uomId,
                hsnCode: formData.hsnCode,
                isActive: formData.isActive,
                attributes: attributeArray
            };

            if (isEdit) {
                await updateItem(id, itemData);
                toast.success('Item updated successfully');
                navigate('/item-master');
            } else {
                await createItem(itemData);
                toast.success('Item created successfully');
                setShowDuplicateModal(false);
                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate('/item-master');
                }
            }
        } catch (err) {
            toast.error('Failed to save item');
            console.error('Error saving item:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderAttributeField = (attr) => {
        const value = formData.attributes[attr.id] || '';
        const error = errors[`attribute_${attr.id}`];

        switch (attr.data_type) {
            case 'Number':
                return (
                    <input
                        type="number"
                        className={`form-control radius-8 ${error ? 'is-invalid' : ''}`}
                        placeholder={`Enter ${attr.attribute_name}`}
                        value={value}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        required={!attr.is_common}
                    />
                );
            case 'Text':
                return (
                    <input
                        type="text"
                        className={`form-control radius-8 ${error ? 'is-invalid' : ''}`}
                        placeholder={`Enter ${attr.attribute_name}`}
                        value={value}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        required={!attr.is_common}
                    />
                );
            default:
                return (
                    <input
                        type="text"
                        className={`form-control radius-8 ${error ? 'is-invalid' : ''}`}
                        placeholder={`Enter ${attr.attribute_name}`}
                        value={value}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        required={!attr.is_common}
                    />
                );
        }
    };

    return (
        <div className="row gy-4">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="col-lg-12">
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title mb-0">{isEdit ? 'Edit Item' : 'Add Item'}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6 mb-20">
                                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                        Category <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select radius-8 ${errors.categoryId ? 'is-invalid' : ''}`}
                                        value={formData.categoryId}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.categoryId && <div className="invalid-feedback">{errors.categoryId}</div>}
                                </div>
                                <div className="col-md-6 mb-20">
                                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                        Subcategory <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select radius-8 ${errors.subCategoryId ? 'is-invalid' : ''}`}
                                        value={formData.subCategoryId}
                                        onChange={(e) => handleSubcategoryChange(e.target.value)}
                                        disabled={!formData.categoryId}
                                        required
                                    >
                                        <option value="">Select Subcategory</option>
                                        {subcategories.map(sc => (
                                            <option key={sc.id} value={sc.id}>{sc.name}</option>
                                        ))}
                                    </select>
                                    {errors.subCategoryId && <div className="invalid-feedback">{errors.subCategoryId}</div>}
                                </div>
                                <div className="col-md-6 mb-20">
                                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                        Item Type <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select radius-8 ${errors.itemTypeId ? 'is-invalid' : ''}`}
                                        value={formData.itemTypeId}
                                        onChange={(e) => handleItemTypeChange(e.target.value)}
                                        disabled={!formData.subCategoryId}
                                        required
                                    >
                                        <option value="">Select Item Type</option>
                                        {itemTypes.map(it => (
                                            <option key={it.id} value={it.id}>{it.name}</option>
                                        ))}
                                    </select>
                                    {errors.itemTypeId && <div className="invalid-feedback">{errors.itemTypeId}</div>}
                                </div>
                                <div className="col-md-6 mb-20">
                                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                        Item Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control radius-8 ${errors.itemName ? 'is-invalid' : ''}`}
                                        placeholder="Enter Item Name"
                                        value={formData.itemName}
                                        onChange={(e) => handleInputChange('itemName', e.target.value)}
                                        required
                                    />
                                    {errors.itemName && <div className="invalid-feedback">{errors.itemName}</div>}
                                </div>
                                <div className="col-md-6 mb-20">
                                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                        UOM <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control radius-8 ${errors.uomId ? 'is-invalid' : ''}`}
                                        placeholder="Enter UOM"
                                        value={formData.uomId}
                                        onChange={(e) => handleInputChange('uomId', e.target.value)}
                                        required
                                    />
                                    {errors.uomId && <div className="invalid-feedback">{errors.uomId}</div>}
                                </div>
                                <div className="col-md-6 mb-20">
                                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                        HSN Code <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control radius-8 ${errors.hsnCode ? 'is-invalid' : ''}`}
                                        placeholder="Enter HSN Code"
                                        value={formData.hsnCode}
                                        onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                                        required
                                    />
                                    {errors.hsnCode && <div className="invalid-feedback">{errors.hsnCode}</div>}
                                </div>
                                <div className="col-md-6 mb-20">
                                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                        Active
                                    </label>
                                    <div className="form-check d-flex align-items-center gap-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                                        />
                                        <label className="form-check-label mb-0" htmlFor="isActive">
                                            Is Active
                                        </label>
                                    </div>
                                </div>
                                {attributes.length > 0 && (
                                    <div className="col-12 mb-20">
                                        <h6 className="fw-semibold text-primary-light text-sm mb-8">Attributes</h6>
                                        <div className="row">
                                            {attributes.map(attr => (
                                                <div key={attr.id} className="col-md-6 mb-20">
                                                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                                        {attr.attribute_name} {attr.is_common ? '' : <span className="text-danger">*</span>}
                                                    </label>
                                                    {renderAttributeField(attr)}
                                                    {errors[`attribute_${attr.id}`] && <div className="invalid-feedback">{errors[`attribute_${attr.id}`]}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="col-12 mb-20">
                                    <div className="card bg-light">
                                        <div className="card-header">
                                            <h6 className="card-title mb-0">Preview Summary</h6>
                                        </div>
                                        <div className="card-body">
                                            <p><strong>Category:</strong> {categories.find(c => c.id === parseInt(formData.categoryId))?.name || 'Not selected'}</p>
                                            <p><strong>Subcategory:</strong> {subcategories.find(sc => sc.id === parseInt(formData.subCategoryId))?.name || 'Not selected'}</p>
                                            <p><strong>Item Type:</strong> {itemTypes.find(it => it.id === parseInt(formData.itemTypeId))?.name || 'Not selected'}</p>
                                            <p><strong>Item Name:</strong> {formData.itemName || 'Not entered'}</p>
                                            <p><strong>UOM:</strong> {formData.uomId || 'Not entered'}</p>
                                            <p><strong>HSN Code:</strong> {formData.hsnCode || 'Not entered'}</p>
                                            <p><strong>Status:</strong> {formData.isActive ? 'Active' : 'Inactive'}</p>
                                            {attributes.length > 0 && (
                                                <div>
                                                    <strong>Attributes:</strong>
                                                    <ul>
                                                        {attributes.map(attr => (
                                                            <li key={attr.id}>{attr.attribute_name}: {formData.attributes[attr.id] || 'Not entered'}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center justify-content-end gap-3">
                                <button
                                    type="button"
                                    className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-40 py-11 radius-8"
                                    onClick={() => {
                                        if (onSuccess) {
                                            onSuccess();
                                        } else {
                                            navigate('/item-master');
                                        }
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary border border-primary-600 text-md px-48 py-12 radius-8"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (isEdit ? 'Update' : 'Save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Duplicate Modal */}
            {showDuplicateModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} data-bs-backdrop="static">
                    <div className="modal-dialog modal-sm modal-dialog-centered">
                        <div className="modal-content radius-16 bg-base">
                            <div className="modal-body p-24 text-center">
                                <div className="mb-16">
                                    <Icon icon="mingcute:alert-line" className="text-warning-600 text-4xl" />
                                </div>
                                <h6 className="text-lg text-neutral-900 mb-8">Duplicate Item Found</h6>
                                <p className="text-sm text-neutral-600 mb-24">
                                    An item with the same attributes already exists: <strong>{duplicateInfo?.existingItemCode}</strong>
                                </p>
                                <div className="d-flex align-items-center justify-content-center gap-3">
                                    <button
                                        type="button"
                                        className="border border-neutral-300 bg-hover-neutral-100 text-neutral-600 text-md px-32 py-11 radius-8"
                                        onClick={() => setShowDuplicateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary border border-primary-600 text-md px-32 py-12 radius-8"
                                        onClick={handleOverrideDuplicate}
                                    >
                                        Override
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemFormLayer;