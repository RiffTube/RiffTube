import '@testing-library/jest-dom';
import { mockAnimationsApi } from 'jsdom-testing-mocks';

// Polyfill JSDOM’s getAnimations so Headless UI stops warning
mockAnimationsApi();
