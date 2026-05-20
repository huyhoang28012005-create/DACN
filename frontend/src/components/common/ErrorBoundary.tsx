import { useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError() as any;
  console.error(error);
  return (
    <div className="p-4 bg-red-100 text-red-900 border border-red-300 rounded">
      <h1 className="font-bold">An error occurred!</h1>
      <pre className="mt-2 text-xs">{error?.message || JSON.stringify(error)}</pre>
      <pre className="mt-2 text-xs">{error?.stack}</pre>
    </div>
  );
}