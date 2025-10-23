import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState, useEffect } from 'react';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../mocks/server';

const SupplierModalLayer = () => {
    const [allSuppliers, setAllSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Note: Removed page-level scroll prevention to allow normal page scrolling
    // Only table container will handle its own scrolling
    const [isEdit, setIsEdit] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState(null);
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        pincode: '',
        state: '',
        country: '',
        pan: '',
        gst: '',
        email: '',
        phone: '',
        fabric: false,
        trims: false
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('createdDate');
    const [sortDirection, setSortDirection] = useState('desc');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        let filtered = allSuppliers;

        if (searchTerm) {
            filtered = allSuppliers.filter(supplier =>
                supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.gst.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.createdDate.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (sortField === 'createdDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredSuppliers(filtered);
        setCurrentPage(1);
    }, [searchTerm, allSuppliers, sortField, sortDirection]);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getSuppliers();
            setAllSuppliers(response.data);
            setFilteredSuppliers(response.data);
        } catch (err) {
            setError('Failed to fetch suppliers. Please try again later.');
            console.error('Error fetching suppliers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setIsEdit(false);
        setCurrentSupplier(null);
        setFormData({
            name: '',
            address: '',
            city: '',
            pincode: '',
            state: '',
            country: '',
            pan: '',
            gst: '',
            email: '',
            phone: '',
            fabric: false,
            trims: false
        });
        setShowModal(true);
    };

    const handleEdit = (supplier) => {
        setIsEdit(true);
        setCurrentSupplier(supplier);
        setFormData({
            name: supplier.name,
            address: supplier.address,
            city: supplier.city,
            pincode: supplier.pincode,
            state: supplier.state,
            country: supplier.country,
            pan: supplier.pan,
            gst: supplier.gst,
            email: supplier.email,
            phone: supplier.phone,
            fabric: supplier.fabric,
            trims: supplier.trims
        });
        setShowModal(true);
    };

    const handleDelete = (supplier) => {
        setSupplierToDelete(supplier);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteSupplier(supplierToDelete.id);
            setShowDeleteModal(false);
            setSupplierToDelete(null);
            fetchSuppliers();
        } catch (err) {
            setError('Failed to delete supplier.');
            console.error('Error deleting supplier:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateSupplier(currentSupplier.id, formData);
            } else {
                await createSupplier(formData);
            }
            setShowModal(false);
            await fetchSuppliers(); // Ensure fresh data is loaded
        } catch (err) {
            setError(`Failed to ${isEdit ? 'update' : 'create'} supplier. Please try again.`);
            console.error(`Error ${isEdit ? 'updating' : 'creating'} supplier:`, err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderSuppliesChips = (supplier) => {
        const chips = [];
        if (supplier.fabric) {
            chips.push(
                <span key="fabric" className="px-16 py-4 rounded-pill fw-medium text-sm bg-success-focus text-success-main me-2">
                    Fabric
                </span>
            );
        }
        if (supplier.trims) {
            chips.push(
                <span key="trims" className="px-16 py-4 rounded-pill fw-medium text-sm bg-info-focus text-info-main">
                    Trims
                </span>
            );
        }
        return chips.length > 0 ? chips : <span className="text-neutral-500">None</span>;
    };

    return (
        <>
            <div className="card">
                <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex flex-wrap align-items-center gap-3">
                        <div className="icon-field">
                            <input
                                type="text"
                                name="search"
                                className="form-control form-control-sm w-auto"
                                placeholder="Search"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <span className="icon">
                                <Icon icon="ion:search-outline" />
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-primary-600"
                        onClick={handleAdd}
                    >
                        <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
                        Add Supplier
                    </button>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            Loading suppliers...
                        </div>
                    ) : error ? (
                        <div className="text-center py-4 text-danger">{error}</div>
                    ) : filteredSuppliers.length === 0 ? (
                        <div className="text-center py-4">
                            <div className="card border">
                                <div className="card-body">
                                    <h6 className="text-md text-secondary-light mb-16">No Supplier Exists</h6>
                                    <button
                                        type="button"
                                        className="btn btn-primary-600"
                                        onClick={handleAdd}
                                    >
                                        Add Supplier
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table bordered-table mb-0">
                                    <thead>
                                        <tr>
                                            <th scope="col" style={{ width: '100px' }}>ID</th>
                                            <th
                                                scope="col"
                                                className="cursor-pointer"
                                                onClick={() => handleSort('name')}
                                                style={{ minWidth: '280px' }}
                                            >
                                                <div className="d-flex align-items-center gap-1">
                                                    Supplier Name
                                                    {sortField === 'name' && (
                                                        <Icon icon={`mdi:arrow-${sortDirection === 'asc' ? 'up' : 'down'}`} />
                                                    )}
                                                </div>
                                            </th>
                                            <th scope="col" style={{ minWidth: '300px' }}>Address</th>
                                            <th scope="col" style={{ minWidth: '140px' }}>City</th>
                                            <th scope="col" style={{ minWidth: '140px' }}>State</th>
                                            <th scope="col" style={{ minWidth: '140px' }}>Country</th>
                                            <th scope="col" style={{ minWidth: '260px' }}>Email</th>
                                            <th scope="col" style={{ minWidth: '160px' }}>Phone</th>
                                            <th
                                                scope="col"
                                                className="cursor-pointer"
                                                onClick={() => handleSort('createdDate')}
                                                style={{ minWidth: '160px' }}
                                            >
                                                <div className="d-flex align-items-center gap-1">
                                                    Created Date
                                                    {sortField === 'createdDate' && (
                                                        <Icon icon={`mdi:arrow-${sortDirection === 'asc' ? 'up' : 'down'}`} />
                                                    )}
                                                </div>
                                            </th>
                                            <th scope="col" style={{ minWidth: '180px' }}>Supplies</th>
                                            <th scope="col" className="sticky-actions">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentSuppliers.map((supplier, index) => (
                                            <tr key={supplier.id}>
                                                <td style={{ width: '100px' }}>{startIndex + index + 1}</td>
                                                <td style={{ minWidth: '280px' }}>{supplier.name}</td>
                                                <td style={{ minWidth: '300px' }}>{supplier.address}</td>
                                                <td style={{ minWidth: '140px' }}>{supplier.city}</td>
                                                <td style={{ minWidth: '140px' }}>{supplier.state}</td>
                                                <td style={{ minWidth: '140px' }}>{supplier.country}</td>
                                                <td style={{ minWidth: '260px' }}>{supplier.email}</td>
                                                <td style={{ minWidth: '160px' }}>{supplier.phone}</td>
                                                <td style={{ minWidth: '160px' }}>{supplier.createdDate}</td>
                                                <td style={{ minWidth: '180px' }}>{renderSuppliesChips(supplier)}</td>
                                                <td className="sticky-actions">
                                                    <button
                                                        type="button"
                                                        className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
                                                        onClick={() => handleEdit(supplier)}
                                                    >
                                                        <Icon icon="lucide:edit" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                                                        onClick={() => handleDelete(supplier)}
                                                    >
                                                        <Icon icon="mingcute:delete-2-line" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-24">
                                <span>
                                    Showing {filteredSuppliers.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredSuppliers.length)} of {filteredSuppliers.length} entries
                                    {searchTerm && ` (filtered from ${allSuppliers.length} total)`}
                                </span>
                                <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                                    <li className="page-item">
                                        <button
                                            className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px bg-base"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <Icon icon="ep:d-arrow-left" className="text-xl" />
                                        </button>
                                    </li>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <li key={page} className="page-item">
                                            <button
                                                className={`page-link fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px ${currentPage === page ? 'bg-primary-600 text-white' : 'bg-primary-50 text-secondary-light'}`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    ))}
                                    <li className="page-item">
                                        <button
                                            className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px w-32-px bg-base"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <Icon icon="ep:d-arrow-right" className="text-xl" />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }} data-bs-backdrop="static">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content radius-16 bg-base" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="modal-header py-16 px-24 border border-top-0 border-start-0 border-end-0" style={{ flexShrink: 0 }}>
                            <h1 className="modal-title fs-5" id="supplierModalLabel">
                                {isEdit ? 'Update Supplier' : 'Add Supplier'}
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                                aria-label="Close"
                            />
                        </div>
                        <div className="modal-body p-24" style={{ flex: 1, overflowY: 'auto' }}>
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-12 mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            Supplier Name <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-control radius-8"
                                            placeholder="Enter Supplier Name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12 mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            Address <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            className="form-control radius-8"
                                            placeholder="Enter Address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6 mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            City <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            className="form-control radius-8"
                                            placeholder="Enter City"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6 mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            Pincode <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            className="form-control radius-8"
                                            placeholder="Enter Pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6 mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            State <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            className="form-control radius-8"
                                            placeholder="Enter State"
                                            value={formData.state}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6 mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            Country <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            className="form-control radius-8"
                                            placeholder="Enter Country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6 mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            PAN <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="pan"
                                            className="form-control radius-8"
                                            placeholder="Enter PAN"
                                            value={formData.pan}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6 mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            GST <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="gst"
                                            className="form-control radius-8"
                                            placeholder="Enter GST"
                                            value={formData.gst}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6 mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            Email <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control radius-8"
                                            placeholder="Enter Email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-6 mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            Phone Number <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-control radius-8"
                                            placeholder="Enter Phone Number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-12 mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            Supplies
                                        </label>
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="form-check d-flex align-items-center gap-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="fabric"
                                                    id="fabric"
                                                    checked={formData.fabric}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label mb-0" htmlFor="fabric">
                                                    Fabric
                                                </label>
                                            </div>
                                            <div className="form-check d-flex align-items-center gap-2">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="trims"
                                                    id="trims"
                                                    checked={formData.trims}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label mb-0" htmlFor="trims">
                                                    Trims
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer p-24 border border-top border-start-0 border-end-0 border-bottom-0" style={{ flexShrink: 0 }}>
                            <div className="d-flex align-items-center justify-content-center gap-3 w-100">
                                <button
                                    type="button"
                                    className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-40 py-11 radius-8"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary border border-primary-600 text-md px-48 py-12 radius-8"
                                    onClick={handleSubmit}
                                >
                                    {isEdit ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <div className={`modal fade ${showDeleteModal ? 'show d-block' : ''}`} style={{ backgroundColor: showDeleteModal ? 'rgba(0,0,0,0.5)' : 'transparent' }} data-bs-backdrop="static">
                <div className="modal-dialog modal-sm modal-dialog-centered">
                    <div className="modal-content radius-16 bg-base">
                        <div className="modal-body p-24 text-center">
                            <div className="mb-16">
                                <Icon icon="mingcute:delete-2-line" className="text-danger-600 text-4xl" />
                            </div>
                            <h6 className="text-lg text-neutral-900 mb-8">Delete Supplier</h6>
                            <p className="text-sm text-neutral-600 mb-24">
                                Are you sure you want to delete <strong>{supplierToDelete?.name}</strong>? This action cannot be undone.
                            </p>
                            <div className="d-flex align-items-center justify-content-center gap-3">
                                <button
                                    type="button"
                                    className="border border-neutral-300 bg-hover-neutral-100 text-neutral-600 text-md px-32 py-11 radius-8"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger border border-danger-600 text-md px-32 py-12 radius-8"
                                    onClick={confirmDelete}
                                >
                                    Proceed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SupplierModalLayer;