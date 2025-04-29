'use client';

export default function GlobalError({
  
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Minimal global error page
  return null;
}