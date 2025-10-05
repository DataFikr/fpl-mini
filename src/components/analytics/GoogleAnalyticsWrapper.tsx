'use client';

import { Suspense } from 'react';
import GoogleAnalytics from './GoogleAnalytics';

interface GoogleAnalyticsWrapperProps {
  measurementId: string;
}

export default function GoogleAnalyticsWrapper({ measurementId }: GoogleAnalyticsWrapperProps) {
  if (!measurementId) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <GoogleAnalytics measurementId={measurementId} />
    </Suspense>
  );
}
