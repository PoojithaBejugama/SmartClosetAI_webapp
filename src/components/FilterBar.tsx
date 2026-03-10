import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: { label: string; value: string; options: string[] }[];
  onFilterChange?: (key: string, value: string) => void;
}

export function FilterBar({ searchValue, onSearchChange, filters, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-card shadow-card p-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-secondary/60 border-0 h-10 rounded-xl text-sm focus-visible:bg-secondary"
        />
      </div>
      {filters?.map((filter) => (
        <Select key={filter.value} onValueChange={(val) => onFilterChange?.(filter.value, val)}>
          <SelectTrigger className="w-[140px] bg-secondary/60 border-0 h-10 rounded-xl text-sm">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All {filter.label}</SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
