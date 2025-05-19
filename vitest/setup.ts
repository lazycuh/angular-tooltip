/* eslint-disable import/order */
import '@testing-library/jest-dom';

import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { TextDecoder, TextEncoder } from 'util';
import { afterEach, vi } from 'vitest';

(global as Record<string, unknown>)['TextEncoder'] = TextEncoder;
(global as Record<string, unknown>)['TextDecoder'] = TextDecoder;

TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});
