interface ErrorLayoutProps {
  title: string;
  message: string;
  error?: string | null;
}

export default function ErrorLayout({
  title,
  message,
  error,
}: ErrorLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{message}</p>
        {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
      </div>
    </div>
  );
}
