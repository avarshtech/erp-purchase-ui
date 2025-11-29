import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { addPOComment } from "../../mocks/server";
import OperationControl from "../OperationControl";

const PODetailModal = ({
  show,
  handleClose,
  po,
  onApprove,
  onReject,
  actionLoading,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  if (!po) return null;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await addPOComment(po.id, {
        userId: currentUser.id,
        userName: currentUser.name,
        message: newComment,
      });

      if (response.success) {
        // In a real app, this would update the PO data
        po.comments.push(response.data);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-success-focus text-success-main";
      case "Rejected":
        return "bg-danger-focus text-danger-main";
      case "Pending":
        return "bg-warning-focus text-warning-main";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "High":
        return "bg-danger-focus text-danger-main";
      case "Medium":
        return "bg-warning-focus text-warning-main";
      case "Low":
        return "bg-info-focus text-info-main";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  const getWorkflowStepClass = (status) => {
    switch (status) {
      case "completed":
        return "bg-success-100 text-success-600 border-success-200";
      case "rejected":
        return "bg-danger-100 text-danger-600 border-danger-200";
      case "pending":
        return "bg-neutral-100 text-neutral-600 border-neutral-200";
      default:
        return "bg-neutral-100 text-neutral-600 border-neutral-200";
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <div className="d-flex align-items-center gap-3">
              <div>
                <h5 className="modal-title mb-1">PO Details - {po.poNo}</h5>
                <div className="d-flex align-items-center gap-2">
                  <span
                    className={`px-12 py-4 rounded-pill fw-medium text-xs ${getStatusBadgeClass(
                      po.status
                    )}`}
                  >
                    <Icon
                      icon={
                        po.status === "Approved"
                          ? "mdi:check-circle"
                          : po.status === "Rejected"
                          ? "mdi:close-circle"
                          : "mdi:clock-outline"
                      }
                      className="me-1"
                    />
                    {po.status}
                  </span>
                  <span
                    className={`px-12 py-4 rounded-pill fw-medium text-xs ${getPriorityBadgeClass(
                      po.priority
                    )}`}
                  >
                    {po.priority} Priority
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>

          <div className="modal-body">
            {/* Navigation Tabs */}
            <ul className="nav nav-tabs mb-4" role="tablist">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "details" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  <Icon icon="mdi:information" className="me-1" />
                  Details
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "items" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("items")}
                >
                  <Icon icon="mdi:format-list-bulleted" className="me-1" />
                  Line Items
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "workflow" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("workflow")}
                >
                  <Icon icon="mdi:account-group" className="me-1" />
                  Workflow
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "history" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  <Icon icon="mdi:history" className="me-1" />
                  History
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "comments" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("comments")}
                >
                  <Icon icon="mdi:comment-multiple" className="me-1" />
                  Comments
                  {po.comments && po.comments.length > 0 && (
                    <span className="badge bg-primary-600 ms-1">
                      {po.comments.length}
                    </span>
                  )}
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Details Tab */}
              {activeTab === "details" && (
                <div className="tab-pane fade show active">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card mb-3">
                        <div className="card-header bg-light">
                          <h6 className="card-title mb-0">PO Information</h6>
                        </div>
                        <div className="card-body">
                          <div className="row mb-2">
                            <div className="col-sm-4">
                              <strong>PO Number:</strong>
                            </div>
                            <div className="col-sm-8">{po.poNo}</div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-4">
                              <strong>PO Date:</strong>
                            </div>
                            <div className="col-sm-8">
                              {formatDate(po.poDate)}
                            </div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-4">
                              <strong>Expected Delivery:</strong>
                            </div>
                            <div className="col-sm-8">
                              {formatDate(po.expectedDeliveryDate)}
                            </div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-4">
                              <strong>Department:</strong>
                            </div>
                            <div className="col-sm-8">{po.department}</div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-4">
                              <strong>Budget Code:</strong>
                            </div>
                            <div className="col-sm-8">{po.budgetCode}</div>
                          </div>
                          <div className="row">
                            <div className="col-sm-4">
                              <strong>Remarks:</strong>
                            </div>
                            <div className="col-sm-8">
                              {po.remarks || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card mb-3">
                        <div className="card-header bg-light">
                          <h6 className="card-title mb-0">
                            Supplier Information
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="row mb-2">
                            <div className="col-sm-4">
                              <strong>Name:</strong>
                            </div>
                            <div className="col-sm-8">{po.supplier.name}</div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-4">
                              <strong>Code:</strong>
                            </div>
                            <div className="col-sm-8">{po.supplier.code}</div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-4">
                              <strong>Contact:</strong>
                            </div>
                            <div className="col-sm-8">
                              {po.supplier.contact}
                            </div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-4">
                              <strong>Email:</strong>
                            </div>
                            <div className="col-sm-8">{po.supplier.email}</div>
                          </div>
                          <div className="row">
                            <div className="col-sm-4">
                              <strong>Address:</strong>
                            </div>
                            <div className="col-sm-8">
                              {po.supplier.address}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card mb-3">
                        <div className="card-header bg-light">
                          <h6 className="card-title mb-0">Created By</h6>
                        </div>
                        <div className="card-body">
                          <div className="d-flex align-items-center gap-3">
                            <div className="w-48-px h-48-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center">
                              <span className="text-primary-600 fw-semibold fs-4">
                                {po.createdBy.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="fw-semibold">
                                {po.createdBy.name}
                              </div>
                              <div className="text-muted">
                                {po.createdBy.role}
                              </div>
                              <div className="text-muted small">
                                {po.createdBy.email}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card mb-3">
                        <div className="card-header bg-light">
                          <h6 className="card-title mb-0">Financial Summary</h6>
                        </div>
                        <div className="card-body">
                          <div className="row mb-2">
                            <div className="col-sm-6">
                              <strong>Subtotal:</strong>
                            </div>
                            <div className="col-sm-6 text-end">
                              ${po.subtotal.toFixed(2)}
                            </div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-6">
                              <strong>Tax:</strong>
                            </div>
                            <div className="col-sm-6 text-end">
                              ${po.tax.toFixed(2)}
                            </div>
                          </div>
                          <div className="row mb-2">
                            <div className="col-sm-6">
                              <strong>Grand Total:</strong>
                            </div>
                            <div className="col-sm-6 text-end fw-semibold">
                              ${po.grandTotal.toFixed(2)}
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-sm-6">
                              <strong>Currency:</strong>
                            </div>
                            <div className="col-sm-6 text-end">
                              {po.currency}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {po.attachments && po.attachments.length > 0 && (
                      <div className="col-12">
                        <div className="card mb-3">
                          <div className="card-header bg-light">
                            <h6 className="card-title mb-0">Attachments</h6>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              {po.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="col-md-4 mb-2"
                                >
                                  <div className="d-flex align-items-center gap-2 p-2 border rounded">
                                    <Icon
                                      icon="mdi:file-pdf"
                                      className="text-danger fs-4"
                                    />
                                    <div className="flex-grow-1">
                                      <div className="fw-medium small">
                                        {attachment.name}
                                      </div>
                                      <div className="text-muted small">
                                        {attachment.size}
                                      </div>
                                    </div>
                                    <button className="btn btn-sm btn-outline-primary">
                                      <Icon icon="mdi:download" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Line Items Tab */}
              {activeTab === "items" && (
                <div className="tab-pane fade show active">
                  <div className="table-responsive">
                    <table className="table table-bordered line-items-table">
                      <thead className="table-light">
                        <tr>
                          <th>Item Name</th>
                          <th>Description</th>
                          <th className="text-end">Quantity</th>
                          <th>UOM</th>
                          <th className="text-end">Unit Price</th>
                          <th className="text-end">SGST %</th>
                          <th className="text-end">CGST %</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {po.lineItems.map((item, index) => (
                          <tr key={item.id}>
                            <td>
                              <div className="fw-medium">{item.name}</div>
                              <small className="text-muted">{item.code}</small>
                            </td>
                            <td>{item.description}</td>
                            <td className="text-end">{item.quantity}</td>
                            <td>{item.uom}</td>
                            <td className="text-end">
                              ${item.unitPrice.toFixed(2)}
                            </td>
                            <td className="text-end">{item.sgstPercent}%</td>
                            <td className="text-end">{item.cgstPercent}%</td>
                            <td className="text-end fw-semibold">
                              ${item.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <th colSpan="7" className="text-end">
                            Subtotal:
                          </th>
                          <th className="text-end">
                            ${po.subtotal.toFixed(2)}
                          </th>
                        </tr>
                        <tr>
                          <th colSpan="7" className="text-end">
                            Tax:
                          </th>
                          <th className="text-end">${po.tax.toFixed(2)}</th>
                        </tr>
                        <tr>
                          <th colSpan="7" className="text-end">
                            Grand Total:
                          </th>
                          <th className="text-end">
                            ${po.grandTotal.toFixed(2)}
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* Workflow Tab */}
              {activeTab === "workflow" && (
                <div className="tab-pane fade show active">
                  <div className="card">
                    <div className="card-header bg-light">
                      <h6 className="card-title mb-0">Approval Workflow</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex flex-column gap-3">
                        {po.workflow.steps.map((step, index) => (
                          <div
                            key={step.id}
                            className={`card border ${getWorkflowStepClass(
                              step.status
                            )}`}
                          >
                            <div className="card-body p-3">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                  <div
                                    className={`w-40-px h-40-px rounded-circle d-flex justify-content-center align-items-center flex-shrink-0 ${
                                      step.status === "completed"
                                        ? "bg-success-600 text-white"
                                        : step.status === "rejected"
                                        ? "bg-danger-600 text-white"
                                        : "bg-neutral-200 text-neutral-600"
                                    }`}
                                  >
                                    {step.status === "completed" ? (
                                      <Icon icon="mdi:check" className="text-xl" />
                                    ) : step.status === "rejected" ? (
                                      <Icon icon="mdi:close" className="text-xl" />
                                    ) : (
                                      <span className="fw-semibold">{index + 1}</span>
                                    )}
                                  </div>
                                  <div>
                                    <h6 className="card-title mb-1">
                                      {step.name}
                                    </h6>
                                    <div className="d-flex align-items-center gap-2">
                                      <small className="text-muted">
                                        {step.assignedTo.role}
                                      </small>
                                      <span className="text-muted">•</span>
                                      <div className="d-flex align-items-center gap-1">
                                        <div className="w-20-px h-20-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center">
                                          <span className="text-primary-600 fw-semibold text-xs">
                                            {step.assignedTo.name.charAt(0)}
                                          </span>
                                        </div>
                                        <small className="fw-medium">
                                          {step.assignedTo.name}
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {step.completedAt && (
                                  <div className="text-end">
                                    <div className="badge bg-success-100 text-success-600 mb-1">
                                      Completed
                                    </div>
                                    <div className="text-muted small">
                                      {formatDate(step.completedAt)}
                                    </div>
                                  </div>
                                )}
                                {step.status === "pending" && (
                                  <div className="badge bg-neutral-100 text-neutral-600">
                                    Pending
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === "history" && (
                <div className="tab-pane fade show active">
                  <div className="timeline">
                    {po.approvalHistory.map((history, index) => (
                      <div key={history.id} className="timeline-item mb-4">
                        <div className="d-flex gap-3">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-40-px h-40-px rounded-circle d-flex justify-content-center align-items-center ${
                                history.action === "Approved"
                                  ? "bg-success-100 text-success-600"
                                  : history.action === "Rejected"
                                  ? "bg-danger-100 text-danger-600"
                                  : "bg-primary-100 text-primary-600"
                              }`}
                            >
                              <Icon
                                icon={
                                  history.action === "Approved"
                                    ? "mdi:check"
                                    : history.action === "Rejected"
                                    ? "mdi:close"
                                    : "mdi:clock"
                                }
                              />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <div className="card">
                              <div className="card-body">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                  <h6 className="card-title mb-0">
                                    {history.action}
                                  </h6>
                                  <small className="text-muted">
                                    {formatDate(history.timestamp)}
                                  </small>
                                </div>
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <div className="w-24-px h-24-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center">
                                    <span className="text-primary-600 fw-semibold small">
                                      {history.userName.charAt(0)}
                                    </span>
                                  </div>
                                  <span className="fw-medium">
                                    {history.userName}
                                  </span>
                                </div>
                                <p className="mb-0">{history.comments}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Tab */}
              {activeTab === "comments" && (
                <div className="tab-pane fade show active">
                  <div className="card mb-3">
                    <div className="card-header bg-light">
                      <h6 className="card-title mb-0">Add Comment</h6>
                    </div>
                    <div className="card-body">
                      <div className="d-flex gap-2">
                        <div className="w-40-px h-40-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center flex-shrink-0">
                          <span className="text-primary-600 fw-semibold">
                            {currentUser.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <textarea
                            className="form-control"
                            rows="3"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            maxLength="500"
                          />
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <small className="text-muted">
                              {newComment.length}/500 characters
                            </small>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={handleAddComment}
                              disabled={!newComment.trim() || submittingComment}
                            >
                              {submittingComment
                                ? "Posting..."
                                : "Post Comment"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="card-header bg-light">
                      <h6 className="card-title mb-0">Comments</h6>
                    </div>
                    <div className="card-body">
                      {po.comments && po.comments.length > 0 ? (
                        <div className="comments-list">
                          {po.comments.map((comment) => (
                            <div key={comment.id} className="comment-item mb-3">
                              <div className="d-flex gap-2">
                                <div className="w-32-px h-32-px rounded-circle bg-primary-50 d-flex justify-content-center align-items-center flex-shrink-0">
                                  <span className="text-primary-600 fw-semibold small">
                                    {comment.userName.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center justify-content-between mb-1">
                                    <span className="fw-medium">
                                      {comment.userName}
                                    </span>
                                    <small className="text-muted">
                                      {formatDate(comment.timestamp)}
                                    </small>
                                  </div>
                                  <p className="mb-0">{comment.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Icon
                            icon="mdi:comment-multiple-outline"
                            className="text-3xl text-muted mb-2"
                          />
                          <p className="text-muted">No comments yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
            >
              Close
            </button>

            {po.status === "Pending" && (
              <>
                <OperationControl pageId="po-approval" operation="update">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => onApprove(po)}
                    disabled={actionLoading}
                  >
                    <Icon icon="mdi:check" className="me-1" />
                    {actionLoading ? "Approving..." : "Approve PO"}
                  </button>
                </OperationControl>
                <OperationControl pageId="po-approval" operation="update">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onReject(po)}
                    disabled={actionLoading}
                  >
                    <Icon icon="mdi:close" className="me-1" />
                    {actionLoading ? "Rejecting..." : "Reject PO"}
                  </button>
                </OperationControl>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PODetailModal;
