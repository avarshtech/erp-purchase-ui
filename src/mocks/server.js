// Simple mock server implementation (alternative to Mirage.js)
import poListData from './poListData.json';
import poApprovalData from './poApprovalData.json';

// Mock data for suppliers
const suppliersData = [
  { id: 1, name: 'Sushil Corporation', code: 'SUP001', contact: '+1-555-0101', email: 'info@sushilcorp.com' },
  { id: 2, name: 'Moorthy Industries', code: 'SUP002', contact: '+1-555-0102', email: 'contact@moorthyind.com' },
  { id: 3, name: 'Global Tech Solutions', code: 'SUP003', contact: '+1-555-0103', email: 'sales@globaltech.com' },
  { id: 4, name: 'Premium Parts Ltd', code: 'SUP004', contact: '+1-555-0104', email: 'orders@premiumparts.com' },
  { id: 5, name: 'Industrial Supplies Co', code: 'SUP005', contact: '+1-555-0105', email: 'info@industrialsupplies.com' }
];

// Mock data for items
const itemsData = [
  { id: 1, name: 'Laptop Computer', code: 'ITEM001', description: 'High-performance laptop for office use', uom: 'pcs', unitPrice: 1200.00, category: 'Electronics' },
  { id: 2, name: 'Office Chair', code: 'ITEM002', description: 'Ergonomic office chair with lumbar support', uom: 'pcs', unitPrice: 250.00, category: 'Furniture' },
  { id: 3, name: 'Printer Paper', code: 'ITEM003', description: 'A4 size printer paper, 80gsm, 500 sheets', uom: 'reams', unitPrice: 8.50, category: 'Stationery' },
  { id: 4, name: 'USB Cable', code: 'ITEM004', description: 'USB 3.0 Type-A to Type-B cable, 2m length', uom: 'pcs', unitPrice: 12.00, category: 'Electronics' },
  { id: 5, name: 'Coffee Beans', code: 'ITEM005', description: 'Premium arabica coffee beans, 1kg pack', uom: 'kg', unitPrice: 25.00, category: 'Pantry' },
  { id: 6, name: 'Whiteboard Markers', code: 'ITEM006', description: 'Set of 4 colored whiteboard markers', uom: 'sets', unitPrice: 15.00, category: 'Stationery' },
  { id: 7, name: 'Network Switch', code: 'ITEM007', description: '24-port gigabit ethernet switch', uom: 'pcs', unitPrice: 180.00, category: 'Electronics' },
  { id: 8, name: 'Cleaning Supplies', code: 'ITEM008', description: 'All-purpose cleaning solution, 5L bottle', uom: 'liters', unitPrice: 22.00, category: 'Maintenance' }
];

// Mock data for terms and conditions
const termsConditionsData = [
  { id: 1, name: 'Standard Terms', description: 'Standard payment terms: Net 30 days from invoice date' },
  { id: 2, name: 'Express Terms', description: 'Express payment terms: Net 15 days from invoice date' },
  { id: 3, name: 'Extended Terms', description: 'Extended payment terms: Net 45 days from invoice date' },
  { id: 4, name: 'Cash on Delivery', description: 'Payment due upon delivery of goods' },
  { id: 5, name: 'Advance Payment', description: '50% advance payment required before delivery' }
];

// Mock server class
class MockServer {
  constructor() {
    this.routes = new Map();
    this.namespace = '/api';
    this.timing = 400; // Default delay in ms
  }

  // Configure GET route
  get(path, handler) {
    this.routes.set(`GET ${path}`, handler);
  }

  // Configure POST route
  post(path, handler) {
    this.routes.set(`POST ${path}`, handler);
  }

  // Configure PUT route
  put(path, handler) {
    this.routes.set(`PUT ${path}`, handler);
  }

  // Configure DELETE route
  delete(path, handler) {
    this.routes.set(`DELETE ${path}`, handler);
  }

  // Handle requests
  async handleRequest(method, path) {
    const routeKey = `${method} ${path}`;
    const handler = this.routes.get(routeKey);

    if (!handler) {
      throw new Error(`Route ${routeKey} not found`);
    }

    // Add delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, this.timing));

    return handler();
  }
}

// Create server instance
const server = new MockServer();

// Define routes
server.get('/po-list', () => {
  return {
    data: poListData,
    total: poListData.length,
    page: 1,
    per_page: poListData.length
  };
});

server.get('/suppliers', () => {
  return {
    data: suppliersData,
    total: suppliersData.length
  };
});

server.get('/items', () => {
  return {
    data: itemsData,
    total: itemsData.length
  };
});

server.get('/terms-conditions', () => {
  return {
    data: termsConditionsData,
    total: termsConditionsData.length
  };
});

server.post('/purchase-orders', (data) => {
  const newPO = {
    id: Math.max(...poListData.map(po => po.id)) + 1,
    sl: String(Math.max(...poListData.map(po => parseInt(po.sl))) + 1).padStart(2, '0'),
    poNo: data.poNo,
    supplier: suppliersData.find(s => s.id === data.supplierId) || suppliersData[0],
    poDate: data.poDate,
    expectedDeliveryDate: data.expectedDeliveryDate,
    remarks: data.remarks,
    lineItems: data.lineItems,
    subtotal: data.subtotal,
    tax: data.tax,
    grandTotal: data.grandTotal,
    totalValue: data.grandTotal,
    status: 'Draft'
  };

  poListData.push(newPO);

  return {
    success: true,
    data: newPO,
    message: 'Purchase Order created successfully'
  };
});

// PO Approval endpoints
server.get('/po-approval-list', () => {
  return {
    data: poApprovalData,
    total: poApprovalData.length,
    page: 1,
    per_page: poApprovalData.length
  };
});

server.get('/po/:id', (params) => {
  const poId = parseInt(params.id);
  const po = poApprovalData.find(p => p.id === poId);
  if (!po) {
    throw new Error('PO not found');
  }
  return {
    data: po,
    success: true
  };
});

server.post('/po/:id/approve', (data, params) => {
  const poId = parseInt(params.id);
  const poIndex = poApprovalData.findIndex(p => p.id === poId);
  if (poIndex === -1) {
    throw new Error('PO not found');
  }
  
  const po = poApprovalData[poIndex];
  po.status = 'Approved';
  po.approvalHistory.push({
    id: po.approvalHistory.length + 1,
    action: 'Approved',
    userId: data.userId,
    userName: data.userName,
    timestamp: new Date().toISOString(),
    comments: data.comments || 'PO approved'
  });
  
  // Update workflow steps
  const currentStep = po.workflow.steps.find(step => step.status === 'pending');
  if (currentStep) {
    currentStep.status = 'completed';
    currentStep.completedAt = new Date().toISOString();
    po.workflow.currentStep++;
  }
  
  return {
    success: true,
    data: po,
    message: 'PO approved successfully'
  };
});

server.post('/po/:id/reject', (data, params) => {
  const poId = parseInt(params.id);
  const poIndex = poApprovalData.findIndex(p => p.id === poId);
  if (poIndex === -1) {
    throw new Error('PO not found');
  }
  
  const po = poApprovalData[poIndex];
  po.status = 'Rejected';
  po.rejectionReason = data.reason;
  po.rejectionCategory = data.category;
  po.approvalHistory.push({
    id: po.approvalHistory.length + 1,
    action: 'Rejected',
    userId: data.userId,
    userName: data.userName,
    timestamp: new Date().toISOString(),
    comments: data.reason
  });
  
  // Update workflow steps
  const currentStep = po.workflow.steps.find(step => step.status === 'pending');
  if (currentStep) {
    currentStep.status = 'rejected';
    currentStep.completedAt = new Date().toISOString();
  }
  
  return {
    success: true,
    data: po,
    message: 'PO rejected successfully'
  };
});

server.post('/po/bulk-approve', (data) => {
  const { poIds, userId, userName } = data;
  const approvedPOs = [];
  
  poIds.forEach(poId => {
    const poIndex = poApprovalData.findIndex(p => p.id === poId);
    if (poIndex !== -1 && poApprovalData[poIndex].status === 'Pending') {
      const po = poApprovalData[poIndex];
      po.status = 'Approved';
      po.approvalHistory.push({
        id: po.approvalHistory.length + 1,
        action: 'Bulk Approved',
        userId: userId,
        userName: userName,
        timestamp: new Date().toISOString(),
        comments: 'Bulk approved'
      });
      approvedPOs.push(po);
    }
  });
  
  return {
    success: true,
    data: approvedPOs,
    message: `${approvedPOs.length} POs approved successfully`
  };
});

server.post('/po/bulk-reject', (data) => {
  const { poIds, userId, userName, reason, category } = data;
  const rejectedPOs = [];
  
  poIds.forEach(poId => {
    const poIndex = poApprovalData.findIndex(p => p.id === poId);
    if (poIndex !== -1 && poApprovalData[poIndex].status === 'Pending') {
      const po = poApprovalData[poIndex];
      po.status = 'Rejected';
      po.rejectionReason = reason;
      po.rejectionCategory = category;
      po.approvalHistory.push({
        id: po.approvalHistory.length + 1,
        action: 'Bulk Rejected',
        userId: userId,
        userName: userName,
        timestamp: new Date().toISOString(),
        comments: reason
      });
      rejectedPOs.push(po);
    }
  });
  
  return {
    success: true,
    data: rejectedPOs,
    message: `${rejectedPOs.length} POs rejected successfully`
  };
});

server.post('/po/:id/comments', (data, params) => {
  const poId = parseInt(params.id);
  const poIndex = poApprovalData.findIndex(p => p.id === poId);
  if (poIndex === -1) {
    throw new Error('PO not found');
  }
  
  const po = poApprovalData[poIndex];
  const newComment = {
    id: po.comments.length + 1,
    userId: data.userId,
    userName: data.userName,
    timestamp: new Date().toISOString(),
    message: data.message
  };
  
  po.comments.push(newComment);
  
  return {
    success: true,
    data: newComment,
    message: 'Comment added successfully'
  };
});

server.get('/po/export', (params) => {
  const format = params.format || 'csv';
  return {
    success: true,
    data: {
      downloadUrl: `/api/downloads/po-list.${format}`,
      format: format,
      size: '245 KB'
    },
    message: `PO list exported as ${format.toUpperCase()}`
  };
});

// Export server instance
export default server;

// Export convenience function for making requests
export const makeRequest = async (method, path) => {
  try {
    const response = await server.handleRequest(method, path);
    return response;
  } catch (error) {
    console.error('Mock server error:', error);
    throw error;
  }
};

// Export specific API functions
export const getPOList = () => makeRequest('GET', '/po-list');
export const getPOApprovalList = () => makeRequest('GET', '/po-approval-list');
export const getPOById = (id) => makeRequest('GET', `/po/${id}`);
export const approvePO = (id, data) => makeRequest('POST', `/po/${id}/approve`);
export const rejectPO = (id, data) => makeRequest('POST', `/po/${id}/reject`);
export const bulkApprovePOs = (data) => makeRequest('POST', '/po/bulk-approve');
export const bulkRejectPOs = (data) => makeRequest('POST', '/po/bulk-reject');
export const addPOComment = (id, data) => makeRequest('POST', `/po/${id}/comments`);
export const exportPOList = (format) => makeRequest('GET', `/po/export?format=${format}`);