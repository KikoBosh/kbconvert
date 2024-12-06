'use client';

import { useQueryState } from 'nuqs';
import * as React from 'react';

export default function Settings() {
  const [theme] = useQueryState('theme');
  
  return (
    <div className="h-full p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Current theme: {theme || 'system'}
        </p>
      </div>
    </div>
  );
} 