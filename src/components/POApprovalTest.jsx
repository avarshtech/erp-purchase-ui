import React, { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import { getPOApprovalList, approvePO, rejectPO, bulkApprovePOs, bulkRejectPOs } from '../mocks/server';

const POApprovalTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (testName, status, message, details = null) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      testName,
      status, // 'pass', 'fail', 'pending'
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTest = async (testName, testFunction) => {
    addTestResult(testName, 'pending', 'Running test...');
    try {
      const result = await testFunction();
      if (result.success) {
        addTestResult(testName, 'pass', result.message || 'Test passed', result.details);
      } else {
        addTestResult(testName, 'fail', result.message || 'Test failed', result.details);
      }
    } catch (error) {
      addTestResult(testName, 'fail', `Test failed with error: ${error.message}`, error);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Fetch PO Approval List
    await runTest('Fetch PO Approval List', async () => {
      const response = await getPOApprovalList();
      if (response.success && response.data && response.data.length > 0) {
        return {
          success: true,
          message: `Successfully fetched ${response.data.length} POs`,
          details: {
            totalPOs: response.data.length,
            pendingPOs: response.data.filter(po => po.status === 'Pending').length,
            approvedPOs: response.data.filter(po => po.status === 'Approved').length,
            rejectedPOs: response.data.filter(po => po.status === 'Rejected').length
          }
        };
      }
      return { success: false, message: 'Failed to fetch PO list or no data found' };
    });

    // Test 2: Approve Single PO
    await runTest('Approve Single PO', async () => {
      const poList = await getPOApprovalList();
      const pendingPO = poList.data.find(po => po.status === 'Pending');
      
      if (!pendingPO) {
        return { success: false, message: 'No pending PO found for approval test' };
      }

      const response = await approvePO(pendingPO.id, {
        userId: 201,
        userName: 'Sarah Johnson',
        comments: 'Test approval'
      });

      if (response.success) {
        return {
          success: true,
          message: `Successfully approved PO ${pendingPO.poNo}`,
          details: {
            poNumber: pendingPO.poNo,
            newStatus: response.data.status,
            approvalHistory: response.data.approvalHistory.length
          }
        };
      }
      return { success: false, message: 'Failed to approve PO' };
    });

    // Test 3: Reject Single PO
    await runTest('Reject Single PO', async () => {
      const poList = await getPOApprovalList();
      const pendingPO = poList.data.find(po => po.status === 'Pending');
      
      if (!pendingPO) {
        return { success: false, message: 'No pending PO found for rejection test' };
      }

      const response = await rejectPO(pendingPO.id, {
        userId: 201,
        userName: 'Sarah Johnson',
        reason: 'Test rejection - budget exceeded',
        category: 'Budget Exceeded'
      });

      if (response.success) {
        return {
          success: true,
          message: `Successfully rejected PO ${pendingPO.poNo}`,
          details: {
            poNumber: pendingPO.poNo,
            newStatus: response.data.status,
            rejectionReason: response.data.rejectionReason,
            rejectionCategory: response.data.rejectionCategory
          }
        };
      }
      return { success: false, message: 'Failed to reject PO' };
    });

    // Test 4: Bulk Approve POs
    await runTest('Bulk Approve POs', async () => {
      const poList = await getPOApprovalList();
      const pendingPOs = poList.data.filter(po => po.status === 'Pending').slice(0, 2);
      
      if (pendingPOs.length === 0) {
        return { success: false, message: 'No pending POs found for bulk approval test' };
      }

      const response = await bulkApprovePOs({
        poIds: pendingPOs.map(po => po.id),
        userId: 201,
        userName: 'Sarah Johnson'
      });

      if (response.success) {
        return {
          success: true,
          message: `Successfully bulk approved ${response.data.length} POs`,
          details: {
            approvedCount: response.data.length,
            poNumbers: response.data.map(po => po.poNumber)
          }
        };
      }
      return { success: false, message: 'Failed to bulk approve POs' };
    });

    // Test 5: Bulk Reject POs
    await runTest('Bulk Reject POs', async () => {
      const poList = await getPOApprovalList();
      const pendingPOs = poList.data.filter(po => po.status === 'Pending').slice(0, 2);
      
      if (pendingPOs.length === 0) {
        return { success: false, message: 'No pending POs found for bulk rejection test' };
      }

      const response = await bulkRejectPOs({
        poIds: pendingPOs.map(po => po.id),
        userId: 201,
        userName: 'Sarah Johnson',
        reason: 'Test bulk rejection - pricing issues',
        category: 'Pricing Issues'
      });

      if (response.success) {
        return {
          success: true,
          message: `Successfully bulk rejected ${response.data.length} POs`,
          details: {
            rejectedCount: response.data.length,
            poNumbers: response.data.map(po => po.poNumber)
          }
        };
      }
      return { success: false, message: 'Failed to bulk reject POs' };
    });

    // Test 6: Data Structure Validation
    await runTest('Data Structure Validation', async () => {
      const response = await getPOApprovalList();
      const po = response.data[0];
      
      const requiredFields = [
        'id', 'poNo', 'supplier', 'createdBy', 'poDate', 
        'totalValue', 'status', 'lineItems', 'approvalHistory'
      ];

      const missingFields = requiredFields.filter(field => !(field in po));
      
      if (missingFields.length === 0) {
        return {
          success: true,
          message: 'PO data structure is valid',
          details: {
            totalFields: Object.keys(po).length,
            requiredFields: requiredFields.length,
            lineItemsCount: po.lineItems.length,
            approvalHistoryCount: po.approvalHistory.length
          }
        };
      }
      
      return {
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: { missingFields }
      };
    });

    // Test 7: Workflow Steps Validation
    await runTest('Workflow Steps Validation', async () => {
      const response = await getPOApprovalList();
      const po = response.data[0];
      
      if (po.workflow && po.workflow.steps && Array.isArray(po.workflow.steps)) {
        const workflowSteps = po.workflow.steps;
        const hasValidSteps = workflowSteps.every(step => 
          step.id && step.name && step.status && step.assignedTo
        );
        
        if (hasValidSteps) {
          return {
            success: true,
            message: 'Workflow structure is valid',
            details: {
              totalSteps: workflowSteps.length,
              currentStep: po.workflow.currentStep,
              stepStatuses: workflowSteps.map(step => ({ name: step.name, status: step.status }))
            }
          };
        }
      }
      
      return { success: false, message: 'Invalid workflow structure' };
    });

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <Icon icon="mdi:check-circle" className="text-success" />;
      case 'fail':
        return <Icon icon="mdi:close-circle" className="text-danger" />;
      case 'pending':
        return <Icon icon="mdi:loading" className="text-warning spin" />;
      default:
        return <Icon icon="mdi:help-circle" className="text-muted" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pass':
        return 'border-success bg-success-focus';
      case 'fail':
        return 'border-danger bg-danger-focus';
      case 'pending':
        return 'border-warning bg-warning-focus';
      default:
        return 'border-secondary bg-neutral-50';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="card-title mb-0">PO Approval System Tests</h5>
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              onClick={runAllTests}
              disabled={isRunning}
            >
              <Icon icon="mdi:play" className="me-1" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={clearResults}
              disabled={isRunning}
            >
              <Icon icon="mdi:delete" className="me-1" />
              Clear Results
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {testResults.length === 0 ? (
          <div className="text-center py-5">
            <Icon icon="mdi:test-tube" className="text-4xl text-muted mb-3" />
            <h6 className="text-muted mb-2">No tests run yet</h6>
            <p className="text-muted">Click "Run All Tests" to test the PO approval system functionality</p>
          </div>
        ) : (
          <div className="test-results">
            <div className="mb-3">
              <h6 className="mb-2">Test Summary</h6>
              <div className="d-flex gap-3">
                <span className="badge bg-success">
                  <Icon icon="mdi:check-circle" className="me-1" />
                  {testResults.filter(r => r.status === 'pass').length} Passed
                </span>
                <span className="badge bg-danger">
                  <Icon icon="mdi:close-circle" className="me-1" />
                  {testResults.filter(r => r.status === 'fail').length} Failed
                </span>
                <span className="badge bg-warning">
                  <Icon icon="mdi:loading" className="me-1" />
                  {testResults.filter(r => r.status === 'pending').length} Pending
                </span>
              </div>
            </div>
            
            <div className="test-list">
              {testResults.map((result) => (
                <div key={result.id} className={`card mb-2 border ${getStatusClass(result.status)}`}>
                  <div className="card-body py-3">
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(result.status)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <h6 className="card-title mb-0">{result.testName}</h6>
                          <small className="text-muted">{result.timestamp}</small>
                        </div>
                        <p className="card-text mb-2">{result.message}</p>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-primary small">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-light rounded small">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POApprovalTest;