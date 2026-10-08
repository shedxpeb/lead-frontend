/**
 * Centralized Route Registry
 * Never hardcode routes - always use these constants
 */
export const ROUTES = {
  // Auth
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  
  // Dashboard
  dashboard: '/dashboard',
  
  // Modules
  leads: '/dashboard/leads',
  leadsDetail: (id: string) => `/dashboard/leads/${id}`,
  
  customers: '/dashboard/customers',
  customersDetail: (id: string) => `/dashboard/customers/${id}`,
  
  items: '/dashboard/item',
  itemsDetail: (id: string) => `/dashboard/items/${id}`,

  projects: '/dashboard/projects',
  projectsDetail: (id: string) => `/dashboard/projects/${id}`,
  
  inventory: '/dashboard/inventory',
  inventoryDetail: (id: string) => `/dashboard/inventory/${id}`,
  
  finance: '/dashboard/finance',
  financeInvoices: '/dashboard/finance/invoices',
  financeInvoice: (id: string) => `/dashboard/finance/invoices/${id}`,
  financePayments: '/dashboard/finance/payments',
  financePayment: (id: string) => `/dashboard/finance/payments/${id}`,
  financeExpenses: '/dashboard/finance/expenses',
  financeExpense: (id: string) => `/dashboard/finance/expenses/${id}`,
  financeReceivables: '/dashboard/finance/receivables',
  financeReceivable: (id: string) => `/dashboard/finance/receivables/${id}`,
  financePayables: '/dashboard/finance/payables',
  financePayable: (id: string) => `/dashboard/finance/payables/${id}`,
  financeVendors: '/dashboard/finance/vendors',
  financeVendor: (id: string) => `/dashboard/finance/vendors/${id}`,
  financeBankAccounts: '/dashboard/finance/bank-accounts',
  financeBankAccount: (id: string) => `/dashboard/finance/bank-accounts/${id}`,

  documents: '/dashboard/documents',
  documentsDashboard: '/dashboard/documents/dashboard',
  documentsDetail: (id: string) => `/dashboard/documents/${id}`,
  documentsEstimates: '/dashboard/documents/estimates',
  documentsProposals: '/dashboard/documents/proposals',
  documentsQuotations: '/dashboard/documents/quotations',
  documentsTemplates: '/dashboard/documents/templates',
  documentsApprovals: '/dashboard/documents/approvals',

  tasks: '/dashboard/task-management',
  tasksDetail: (id: string) => `/dashboard/task-management/${id}`,

  // Admin / Settings - Master Control Center
  settings: '/settings',
  settingsDashboard: '/settings',
  settingsCompany: '/settings/company',
  settingsBranches: '/settings/branches',
  settingsBranding: '/settings/branding',
  settingsUsers: '/settings/users',
  settingsRoles: '/settings/roles',
  settingsPermissions: '/settings/permissions',
  settingsModules: '/settings/modules',
  settingsDocuments: '/settings/documents',
  settingsWorkflows: '/settings/workflows',
  settingsNotifications: '/settings/notifications',
  settingsCommunication: '/settings/communication',
  settingsIntegrations: '/settings/integrations',
  settingsAutomation: '/settings/automation',
  settingsLeadsConfig: '/settings/leads-config',
  settingsProjectsConfig: '/settings/projects-config',
  settingsInventoryConfig: '/settings/inventory-config',
  settingsFinanceConfig: '/settings/finance-config',
  settingsSecurity: '/settings/security',
  settingsBackup: '/settings/backup',
  settingsAuditLogs: '/settings/audit-logs',
  settingsPreferences: '/settings/preferences',
  
} as const;

/**
 * Route metadata for navigation
 */
export const ROUTE_METADATA = {
  leads: {
    title: 'Leads',
    icon: 'Users',
    permission: 'LEADS_VIEW',
  },
  customers: {
    title: 'Customers',
    icon: 'Building',
    permission: 'CUSTOMERS_VIEW',
  },
  projects: {
    title: 'Projects',
    icon: 'FolderKanban',
    permission: 'PROJECTS_VIEW',
  },
  inventory: {
    title: 'Inventory',
    icon: 'Package',
    permission: 'INVENTORY_VIEW',
  },
  finance: {
    title: 'Finance',
    icon: 'DollarSign',
    permission: 'FINANCE_VIEW',
  },
  documents: {
    title: 'Documents',
    icon: 'FileText',
    permission: 'DOCUMENTS_VIEW',
  },
} as const;

export type RouteKey = keyof typeof ROUTES;
