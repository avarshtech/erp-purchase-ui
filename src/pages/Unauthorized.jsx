import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="text-center py-5">
          <Icon
            icon="mingcute:alert-line"
            className="text-danger-600"
            style={{ fontSize: "96px" }}
          />
          <h2 className="mt-4 mb-3">Access Denied</h2>
          <p className="text-muted mb-4">
            You don't have permission to access this page. Please contact your
            administrator if you believe this is an error.
          </p>
          <Link to="/purchase-orders" className="btn btn-primary-600">
            <Icon icon="mingcute:home-3-line" className="me-2" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
