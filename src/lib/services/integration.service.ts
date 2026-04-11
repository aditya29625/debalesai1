/**
 * Integration Service — mock Shopify + CRM data providers.
 * Returns simulated data based on integration type.
 */

export interface ShopifyProduct {
  id: string;
  name: string;
  price: number;
  inventory: number;
  category: string;
}

export interface ShopifyOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

export interface CRMContact {
  id: string;
  name: string;
  email: string;
  company: string;
  dealStage: string;
  dealValue: number;
}

const mockShopifyData = {
  products: [
    { id: "prod_1", name: "Premium Wireless Headphones", price: 149.99, inventory: 234, category: "Electronics" },
    { id: "prod_2", name: "Organic Cotton T-Shirt", price: 39.99, inventory: 1052, category: "Apparel" },
    { id: "prod_3", name: "Stainless Steel Water Bottle", price: 24.99, inventory: 567, category: "Accessories" },
    { id: "prod_4", name: "Natural Face Moisturizer", price: 34.99, inventory: 89, category: "Beauty" },
    { id: "prod_5", name: "Bamboo Desk Organizer", price: 44.99, inventory: 312, category: "Home Office" },
  ] as ShopifyProduct[],
  recentOrders: [
    { id: "ord_1001", customer: "Alice Johnson", total: 189.98, status: "delivered", date: "2025-04-10" },
    { id: "ord_1002", customer: "Bob Smith", total: 39.99, status: "shipped", date: "2025-04-11" },
    { id: "ord_1003", customer: "Carol Williams", total: 74.98, status: "processing", date: "2025-04-11" },
    { id: "ord_1004", customer: "David Brown", total: 149.99, status: "delivered", date: "2025-04-09" },
  ] as ShopifyOrder[],
  stats: {
    totalRevenue: 48523.50,
    ordersToday: 23,
    conversionRate: 3.2,
  },
};

const mockCRMData = {
  contacts: [
    { id: "crm_1", name: "Sarah Chen", email: "sarah@techcorp.io", company: "TechCorp", dealStage: "Negotiation", dealValue: 15000 },
    { id: "crm_2", name: "Mike Peters", email: "mike@startupxyz.com", company: "StartupXYZ", dealStage: "Proposal", dealValue: 8500 },
    { id: "crm_3", name: "Lisa Wang", email: "lisa@enterprise.co", company: "Enterprise Co", dealStage: "Closed Won", dealValue: 32000 },
    { id: "crm_4", name: "James Rodriguez", email: "james@agency.io", company: "The Agency", dealStage: "Discovery", dealValue: 5000 },
  ] as CRMContact[],
  pipeline: {
    totalDeals: 24,
    totalValue: 285000,
    avgDealSize: 11875,
    closedThisMonth: 5,
  },
};

export function getMockIntegrationData(type: "shopify" | "crm"): typeof mockShopifyData | typeof mockCRMData {
  switch (type) {
    case "shopify":
      return mockShopifyData;
    case "crm":
      return mockCRMData;
    default:
      return mockShopifyData;
  }
}
