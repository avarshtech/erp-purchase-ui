import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import POApprovalListLayer from "../components/POApprovalListLayer";
import { AuthProvider, ProtectedRoute } from "../components/child/AccessControlWrapper";

// Import responsive CSS
import "../assets/css/po-approval-responsive.css";

const POApprovalContent = () => {
    return (
        <ProtectedRoute
            permission="view_po"
            fallback={
                <div className="card">
                    <div className="card-body text-center py-5">
                        <h4 className="text-danger mb-3">Access Denied</h4>
                        <p className="text-muted">You don't have permission to access the PO Approval page.</p>
                        <p className="text-muted">Required permission: view_po</p>
                    </div>
                </div>
            }
        >
            <POApprovalListLayer />
        </ProtectedRoute>
    );
};

const POApproval = () => {
    return (
        <AuthProvider>
            <MasterLayout>
                <Breadcrumb title="PO / Approval"/>
                <main id="main-content" role="main" aria-label="PO Approval Section">
                    <POApprovalContent />
                </main>
            </MasterLayout>
        </AuthProvider>
    )
};

export default POApproval;