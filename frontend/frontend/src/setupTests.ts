import '@testing-library/jest-dom';
import { mockAnimationsApi } from 'jsdom-testing-mocks';
import { server } from './testUtils/server';

// Polyfill JSDOM’s getAnimations so Headless UI stops warning
mockAnimationsApi();

// msw: unhandled requests fail the test instead of hitting the network
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
