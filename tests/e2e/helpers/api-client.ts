/**
 * api-client.ts — Test Data Helpers
 *
 * In a real BNPL system, this would provide authenticated API calls
 * for seeding and tearing down test data (creating orders, resetting accounts, etc.)
 *
 * KODA is frontend-only (no real API). This file documents what a real
 * api-client would look like for interview/portfolio purposes.
 *
 * For KODA tests: use Zustand store actions directly, or use the UI.
 *
 * Example (future real implementation):
 *
 *   const client = new KodaApiClient({ baseURL: process.env.API_URL })
 *   await client.createOrder({ userId: 'u1', productId: 'p1', term: 4 })
 *   await client.resetUser('active@koda.test')
 */

export interface ApiClientConfig {
  baseURL: string;
  apiKey?: string;
}

export class KodaApiClient {
  private baseURL: string;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
  }

  /**
   * Reset a test user to their default seed state.
   * (Not implemented — KODA is frontend-only)
   */
  async resetUser(_email: string): Promise<void> {
    console.warn(`[api-client] resetUser not implemented. KODA is frontend-only.`);
    console.warn(`            Reload the page to reset Zustand state from seed data.`);
  }

  /**
   * Create an order via API (bypasses UI).
   * (Not implemented — KODA is frontend-only)
   */
  async createOrder(_params: {
    userEmail: string;
    productId: string;
    term: number;
  }): Promise<void> {
    console.warn(`[api-client] createOrder not implemented. Use UI or Zustand directly.`);
  }
}
