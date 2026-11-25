import { AwsNav } from "@/components/deep-dive/AwsDive";

export default function AwsLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0">
      <AwsNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
