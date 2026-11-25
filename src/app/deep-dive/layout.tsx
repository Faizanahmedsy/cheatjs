import { DeepDiveNav } from "@/components/deep-dive/DeepDiveNav";

export default function DeepDiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0">
      <DeepDiveNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
