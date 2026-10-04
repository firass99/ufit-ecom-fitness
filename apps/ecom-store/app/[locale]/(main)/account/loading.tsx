/**
 * Mirrors the login form's layout so the account route shows a matching
 * skeleton instead of the product-grid fallback from the (main) segment.
 */
export default function AccountLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-md px-8 py-10 space-y-6">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="h-11 w-11 rounded-full bg-muted" />
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-4 w-52 rounded bg-muted" />
        </div>

        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-full rounded-md bg-muted" />
          <div className="h-10 w-full rounded-md bg-muted" />
        </div>

        <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <hr className="border-dashed" />
          <div className="h-3 w-6 rounded bg-muted animate-pulse" />
          <hr className="border-dashed" />
        </div>

        <div className="space-y-6 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-10 w-full rounded-md bg-muted" />
          </div>
          <div className="h-10 w-full rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
