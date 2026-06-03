import React from 'react';
import { Globe } from 'lucide-react';

export function FallbackComponent({ className = '', ...props }) {
  return <Globe className={className} {...props} />;
}
