'use client';

import dynamic from 'next/dynamic';

// Dynamically import the CKEditorWrapper component with SSR disabled
const DynamicCKEditorWrapper = dynamic(
  () => import('./CKEditorWrapper'), 
  { 
    ssr: false,
    loading: () => <div className="min-h-[200px] rounded-md border bg-slate-50 p-4 flex items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  }
);

export default DynamicCKEditorWrapper; 