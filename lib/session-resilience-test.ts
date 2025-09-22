/**
 * Session Resilience Testing Utility
 * 
 * This utility helps test session management under various failure conditions
 * to ensure users don't get logged out unexpectedly.
 */

interface SessionTestConfig {
  simulateDatabaseFailures: boolean;
  simulateNetworkTimeouts: boolean;
  simulateSlowResponses: boolean;
  failureRate: number; // 0-1, percentage of requests that should fail
}

class SessionResilienceTester {
  private config: SessionTestConfig;
  private originalFetch: typeof fetch;
  private failureCount = 0;
  private totalRequests = 0;

  constructor(config: SessionTestConfig) {
    this.config = config;
    this.originalFetch = global.fetch;
  }

  /**
   * Start simulating failures for testing
   */
  startTesting(): void {
    if (typeof window === 'undefined') return; // Only run in browser

    console.log('🧪 Starting session resilience testing with config:', this.config);
    
    // Override fetch to simulate failures
    global.fetch = this.createMockFetch();
  }

  /**
   * Stop testing and restore original fetch
   */
  stopTesting(): void {
    if (typeof window === 'undefined') return;

    console.log('🧪 Stopping session resilience testing');
    global.fetch = this.originalFetch;
    
    // Log test results
    console.log(`📊 Test Results: ${this.failureCount}/${this.totalRequests} requests failed (${(this.failureCount / this.totalRequests * 100).toFixed(1)}%)`);
  }

  /**
   * Create a mock fetch function that simulates various failure conditions
   */
  private createMockFetch(): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      this.totalRequests++;
      
      // Check if this request should fail
      const shouldFail = Math.random() < this.config.failureRate;
      
      if (shouldFail) {
        this.failureCount++;
        
        if (this.config.simulateDatabaseFailures && this.isDatabaseRequest(input)) {
          console.log('🧪 Simulating database failure for:', input);
          return this.createErrorResponse(500, 'Database connection failed');
        }
        
        if (this.config.simulateNetworkTimeouts && this.isSessionRequest(input)) {
          console.log('🧪 Simulating network timeout for:', input);
          return this.createTimeoutResponse();
        }
        
        if (this.config.simulateSlowResponses && this.isSessionRequest(input)) {
          console.log('🧪 Simulating slow response for:', input);
          await this.delay(5000); // 5 second delay
          return this.createErrorResponse(408, 'Request timeout');
        }
      }
      
      // For non-failing requests, use original fetch
      return this.originalFetch(input, init);
    };
  }

  /**
   * Check if the request is to a database-related endpoint
   */
  private isDatabaseRequest(input: RequestInfo | URL): boolean {
    const url = typeof input === 'string' ? input : input.toString();
    return url.includes('/api/auth/session') || url.includes('/api/auth/csrf');
  }

  /**
   * Check if the request is session-related
   */
  private isSessionRequest(input: RequestInfo | URL): boolean {
    const url = typeof input === 'string' ? input : input.toString();
    return url.includes('/api/auth/');
  }

  /**
   * Create an error response
   */
  private createErrorResponse(status: number, message: string): Response {
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Create a timeout response
   */
  private createTimeoutResponse(): Promise<Response> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 100);
    });
  }

  /**
   * Utility function to add delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current test statistics
   */
  getStats(): { totalRequests: number; failureCount: number; failureRate: number } {
    return {
      totalRequests: this.totalRequests,
      failureCount: this.failureCount,
      failureRate: this.totalRequests > 0 ? this.failureCount / this.totalRequests : 0
    };
  }
}

// Export singleton instance for easy testing
export const sessionTester = new SessionResilienceTester({
  simulateDatabaseFailures: false,
  simulateNetworkTimeouts: false,
  simulateSlowResponses: false,
  failureRate: 0
});

// Export the class for custom configurations
export { SessionResilienceTester };

// Development-only testing functions
if (process.env.NODE_ENV === 'development') {
  // Make testing functions available globally in development
  (global as any).testSessionResilience = {
    startDatabaseFailures: () => {
      sessionTester.stopTesting();
      const tester = new SessionResilienceTester({
        simulateDatabaseFailures: true,
        simulateNetworkTimeouts: false,
        simulateSlowResponses: false,
        failureRate: 0.3 // 30% failure rate
      });
      tester.startTesting();
      return tester;
    },
    
    startNetworkTimeouts: () => {
      sessionTester.stopTesting();
      const tester = new SessionResilienceTester({
        simulateDatabaseFailures: false,
        simulateNetworkTimeouts: true,
        simulateSlowResponses: false,
        failureRate: 0.2 // 20% failure rate
      });
      tester.startTesting();
      return tester;
    },
    
    startSlowResponses: () => {
      sessionTester.stopTesting();
      const tester = new SessionResilienceTester({
        simulateDatabaseFailures: false,
        simulateNetworkTimeouts: false,
        simulateSlowResponses: true,
        failureRate: 0.1 // 10% failure rate
      });
      tester.startTesting();
      return tester;
    },
    
    stopAll: () => {
      sessionTester.stopTesting();
    },
    
    getStats: () => sessionTester.getStats()
  };
  
  console.log('🧪 Session resilience testing available in development mode:');
  console.log('  - testSessionResilience.startDatabaseFailures()');
  console.log('  - testSessionResilience.startNetworkTimeouts()');
  console.log('  - testSessionResilience.startSlowResponses()');
  console.log('  - testSessionResilience.stopAll()');
  console.log('  - testSessionResilience.getStats()');
}
