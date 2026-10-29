import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXAMPLE_GROUPS, EXAMPLES } from "@/lib/visualizer/examples";

export function ExamplePicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label="Examples" className="h-10 w-full rounded-lg border-slate-700 bg-slate-800 text-slate-200 sm:w-72">
        <SelectValue placeholder="Examples" />
      </SelectTrigger>
      <SelectContent className="max-h-[22rem] border-slate-700 bg-slate-900 text-slate-200">
        {EXAMPLE_GROUPS.map((group) => (
          <SelectGroup key={group}>
            <SelectLabel className="text-xs uppercase tracking-wide text-slate-500">{group}</SelectLabel>
            {EXAMPLES.filter((example) => example.group === group).map((example) => (
              <SelectItem key={example.id} value={example.id}>
                {example.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
        <SelectGroup>
          <SelectLabel className="text-xs uppercase tracking-wide text-slate-500">Yours</SelectLabel>
          <SelectItem value="custom">My code</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
