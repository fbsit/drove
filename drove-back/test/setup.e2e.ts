// Global test setup for e2e tests
import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '..', '.env.test') });

// Set test-specific environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // let Nest choose a random free port

// Extend timeout for e2e tests
jest.setTimeout(30000);