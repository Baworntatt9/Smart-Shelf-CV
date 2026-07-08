export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-border/60 ${className}`} />;
}
