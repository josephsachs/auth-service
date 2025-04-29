import type { AppProps } from 'next/app';

// Minimal App component with no extra wrappers
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}