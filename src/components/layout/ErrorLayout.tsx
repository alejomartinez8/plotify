interface ErrorLayoutProps {
  title: string;
  message: string;
  error?: string | null;
}

export default function ErrorLayout({ title, message, error }: ErrorLayoutProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          {title}
        </h1>
        <p className="text-muted-foreground">
          {message}
        </p>
        {error && (
          <p className="text-sm text-destructive mt-2">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}