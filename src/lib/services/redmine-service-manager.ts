import { createRedmineService } from './redmine.service';

/**
 * Singleton manager for Redmine services to prevent duplicate instances
 * and ensure request deduplication across the application
 */
class RedmineServiceManager {
  private static instance: RedmineServiceManager;
  private services: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): RedmineServiceManager {
    if (!RedmineServiceManager.instance) {
      RedmineServiceManager.instance = new RedmineServiceManager();
    }
    return RedmineServiceManager.instance;
  }

  /**
   * Get or create a Redmine service instance
   */
  public getService(redmineUrl: string, apiKey: string) {
    const serviceKey = `${redmineUrl}:${apiKey}`;
    
    if (!this.services.has(serviceKey)) {
      console.log(`🔧 Creating new Redmine service for: ${redmineUrl}`);
      const service = createRedmineService(redmineUrl, apiKey);
      this.services.set(serviceKey, service);
    } else {
      console.log(`♻️ Reusing existing Redmine service for: ${redmineUrl}`);
    }
    
    return this.services.get(serviceKey);
  }

  /**
   * Clear all service caches
   */
  public clearAllCaches(): void {
    console.log('🧹 Clearing all Redmine service caches');
    this.services.forEach((service, key) => {
      if (service && typeof service.clearCache === 'function') {
        service.clearCache();
      }
    });
  }

  /**
   * Clear cache for a specific service
   */
  public clearServiceCache(redmineUrl: string, apiKey: string): void {
    const serviceKey = `${redmineUrl}:${apiKey}`;
    const service = this.services.get(serviceKey);
    if (service && typeof service.clearCache === 'function') {
      console.log(`🧹 Clearing cache for service: ${redmineUrl}`);
      service.clearCache();
    }
  }

  /**
   * Remove a service instance (useful for cleanup)
   */
  public removeService(redmineUrl: string, apiKey: string): void {
    const serviceKey = `${redmineUrl}:${apiKey}`;
    if (this.services.has(serviceKey)) {
      console.log(`🗑️ Removing Redmine service for: ${redmineUrl}`);
      this.services.delete(serviceKey);
    }
  }

  /**
   * Get the number of active services
   */
  public getServiceCount(): number {
    return this.services.size;
  }
}

export default RedmineServiceManager;