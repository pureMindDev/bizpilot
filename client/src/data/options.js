/**
 * Static option lists used by forms, filters and badges.
 *
 * These are presentation constants, not data — all records now come from the
 * API. Values must stay in sync with the enums declared in the Mongoose
 * models under `server/models/`.
 */

// Inventory
export const productCategories = ['Beverages', 'Groceries', 'Electronics', 'Cosmetics', 'Household', 'Fashion', 'Stationery'];
export const productSuppliers = ['Lagos Wholesale Hub', 'Coscharis Distributors', 'Naija Fresh Foods', 'TechPoint Supplies', 'Beauty World NG', 'Kaduna Textiles Ltd'];

// Expenses
export const expenseCategories = ['Rent', 'Salary', 'Fuel', 'Electricity', 'Internet', 'Maintenance', 'Other'];

// Staff (business side)
export const roles = ['Owner', 'Manager', 'Cashier', 'Sales Rep', 'Inventory Officer'];

export const rolePermissions = {
  Owner: ['Full access', 'Manage staff', 'View financials', 'Manage settings'],
  Manager: ['Manage inventory', 'Manage sales', 'View reports', 'Manage customers'],
  Cashier: ['Process sales', 'View products', 'Issue receipts'],
  'Sales Rep': ['Process sales', 'View customers', 'View products'],
  'Inventory Officer': ['Manage inventory', 'View suppliers', 'Stock adjustments'],
};

// Businesses (admin side)
export const businessCities = ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Enugu', 'Osogbo', 'Kaduna', 'Benin City', 'Jos'];
export const businessPlans = ['Starter', 'Growth', 'Enterprise'];
export const businessStatuses = ['Active', 'Trial', 'Expired', 'Suspended'];

// Payments
export const paymentMethods = ['Paystack', 'Flutterwave', 'Stripe', 'Bank Transfer'];
export const paymentStatuses = ['Paid', 'Pending', 'Failed', 'Refunded'];

// Support
export const ticketPriorities = ['Low', 'Medium', 'High', 'Urgent'];
export const ticketStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
export const supportAgents = ['Kemi Adisa (Support)', 'David Okoro (Support)', 'Unassigned'];

// Audit log categories — mirrors the AuditLog model enum.
export const auditCategories = [
  'Login', 'Password Changes', 'Business Creation', 'Subscription Changes', 'Payment Events', 'Role Changes', 'Settings Changes',
];
