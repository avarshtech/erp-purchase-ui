import React from 'react';

const POActionButtons = ({ loading, handleCancel, handleSaveDraft, handleSubmit, isDirty }) => {
  return (
    <div className="row gy-2">
      <div className="col-12">
        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleCancel}
            disabled={loading}
            aria-label="Cancel Purchase Order"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-warning"
            onClick={handleSaveDraft}
            disabled={loading}
            aria-label="Save Purchase Order as Draft"
          >
            {loading === 'saving' ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            aria-label="Submit Purchase Order for Approval"
          >
            {loading === 'submitting' ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POActionButtons;