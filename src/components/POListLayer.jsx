import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPOList } from '../mocks/server';

const TableRow = ({ po }) => {
  const getStatusBadgeClass = (status) => {
    return status === 'Completed'
      ? 'bg-success-focus text-success-main'
      : 'bg-warning-focus text-warning-main';
  };

  return (
    <tr key={po.id}>
      <td>
        <div className="form-check style-check d-flex align-items-center">
          <input
            className="form-check-input"
            type="checkbox"
            defaultValue=""
            id={`check${po.id}`}
          />
          <label className="form-check-label" htmlFor={`check${po.id}`}>
            {po.sl}
          </label>
        </div>
      </td>
      <td>
        <Link to="#" className="text-primary-600">
          {po.poNo}
        </Link>
      </td>
      <td>{po.supplier.name}</td>
      <td>{po.poDate}</td>
      <td>{po.totalValue}</td>
      <td>
        <span className={`px-24 py-4 rounded-pill fw-medium text-sm ${getStatusBadgeClass(po.status)}`}>
          {po.status}
        </span>
      </td>
      <td>
        <Link
          to="#"
          className="w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center"
        >
          <Icon icon="iconamoon:eye-light" />
        </Link>
        <Link
          to="#"
          className="w-32-px h-32-px me-8 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center"
        >
          <Icon icon="lucide:edit" />
        </Link>
        <Link
          to="#"
          className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
        >
          <Icon icon="mingcute:delete-2-line" />
        </Link>
      </td>
    </tr>
  );
};

const POListLayer = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchPOData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPOList();
        setPurchaseOrders(response.data);
      } catch (err) {
        setError('Failed to fetch PO data. Please try again later.');
        console.error('Error fetching PO data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPOData();
  }, []);

  const filteredOrders = purchaseOrders.filter((po) => {
    const matchesSearch = po.poNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          po.supplier.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || po.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

    return (
        <div className="card">
            <div className="card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div className="d-flex flex-wrap align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <span>Show</span>
                        <select className="form-select form-select-sm w-auto" defaultValue="Select Number">
                            <option value="Select Number" disabled>
                                Select Number
                            </option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                        </select>
                    </div>
                    <div className="icon-field">
                        <input
                            type="text"
                            name="search"
                            className="form-control form-control-sm w-auto"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="icon">
                            <Icon icon="ion:search-outline" />
                        </span>
                    </div>
                </div>
                <div className="d-flex flex-wrap align-items-center gap-3">
                    <select
                        className="form-select form-select-sm w-auto"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="InProgress">InProgress</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <Link to="/invoice-add" className="btn btn-sm btn-primary-600">
                        <i className="ri-add-line" /> Create PO
                    </Link>
                </div>
            </div>
            <div className="card-body">
                <table className="table bordered-table mb-0">
                    <thead>
                        <tr>
                            <th scope="col">
                                <div className="form-check style-check d-flex align-items-center">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        defaultValue=""
                                        id="checkAll"
                                    />
                                    <label className="form-check-label" htmlFor="checkAll">
                                        S.L
                                    </label>
                                </div>
                            </th>
                            <th scope="col">PO No</th>
                            <th scope="col">Supplier</th>
                            <th scope="col">PO Date</th>
                            <th scope="col">Total Value</th>
                            <th scope="col">Status</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="spinner-border spinner-border-sm me-2" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                              Loading PO data...
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4 text-danger">
                            {error}
                          </td>
                        </tr>
                      ) : purchaseOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            No PO data found.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((po) => (
                          <TableRow key={po.id} po={po} />
                        ))
                      )}
                    </tbody>
                </table>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-24">
                    <span>Showing 1 to 10 of 12 entries</span>
                    <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                        <li className="page-item">
                            <Link
                                className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px  me-8 w-32-px bg-base"
                                to="#"
                            >
                                <Icon icon="ep:d-arrow-left" className="text-xl" />
                            </Link>
                        </li>
                        <li className="page-item">
                            <Link
                                className="page-link bg-primary-600 text-white fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px  me-8 w-32-px"
                                to="#"
                            >
                                1
                            </Link>
                        </li>
                        <li className="page-item">
                            <Link
                                className="page-link bg-primary-50 text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px  me-8 w-32-px"
                                to="#"
                            >
                                2
                            </Link>
                        </li>
                        <li className="page-item">
                            <Link
                                className="page-link bg-primary-50 text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px  me-8 w-32-px"
                                to="#"
                            >
                                3
                            </Link>
                        </li>
                        <li className="page-item">
                            <Link
                                className="page-link text-secondary-light fw-medium radius-4 border-0 px-10 py-10 d-flex align-items-center justify-content-center h-32-px  me-8 w-32-px bg-base"
                                to="#"
                            >
                                {" "}
                                <Icon icon="ep:d-arrow-right" className="text-xl" />{" "}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>


    );
};

export default POListLayer;