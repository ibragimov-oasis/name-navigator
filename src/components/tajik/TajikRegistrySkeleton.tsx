import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export const TajikCardsSkeleton = ({ count = 12 }: { count?: number }) => (
  <div
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
    aria-busy="true"
    aria-label="Боркунии феҳрист"
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-border/80 bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-14 rounded-md" />
        </div>
        <Skeleton className="h-7 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-10 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export const TajikFiltersSkeleton = () => (
  <div className="space-y-4 mb-6" aria-busy="true">
    <Skeleton className="h-16 w-full rounded-2xl" />
    <Skeleton className="h-11 w-full rounded-xl" />
  </div>
);

export const TajikRegistryError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div
    role="alert"
    className="my-8 p-6 rounded-2xl border border-destructive/30 bg-destructive/5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
  >
    <AlertCircle className="h-8 w-8 text-destructive shrink-0" />
    <div className="flex-1 space-y-1">
      <h3 className="font-bold text-foreground">Феҳрист бор нашуд</h3>
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
    <Button onClick={onRetry} className="rounded-xl gap-2 shrink-0">
      <RefreshCw className="h-4 w-4" />
      Аз нав кӯшиш кардан
    </Button>
  </div>
);
