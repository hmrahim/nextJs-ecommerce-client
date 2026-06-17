'use client';

import { Suspense } from 'react';

import NavigationEvents from './Navigationevents';
import TopLoadingBar from './Toploadingbar';


function LoadingBarInner({ variant, color, height, shadowBlur }) {
  return (
    <TopLoadingBar
      variant={variant}
      color={color}
      height={height}
      shadowBlur={shadowBlur}
    />
  );
}

export default function TopLoadingBarWrapper(props) {
  return (
    <>
      {/* Detects link clicks → starts bar immediately */}
      <NavigationEvents />

      {/* The bar itself (needs Suspense for useSearchParams) */}
      <Suspense fallback={null}>
        <LoadingBarInner {...props} />
      </Suspense>
    </>
  );
}