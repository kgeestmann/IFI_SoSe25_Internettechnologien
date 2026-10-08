import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

// HTTP requests go to a test backend instead of the real API, and the empty router
// supplies ActivatedRoute for components that read route parameters.
export const testProviders = [
  provideHttpClient(),
  provideHttpClientTesting(),
  provideRouter([]),
];
