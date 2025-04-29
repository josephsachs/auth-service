import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

// Minimal error page using a React fragment
export default function Error({ statusCode }: ErrorProps) {
  return (
    <>
      <h1>Error: {statusCode}</h1>
    </>
  );
}

// Required for Next.js error pages
Error.getInitialProps = (ctx: NextPageContext) => {
  const statusCode = ctx.res ? ctx.res.statusCode : ctx.err ? 500 : 404;
  return { statusCode };
};