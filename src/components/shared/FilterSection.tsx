import { Filter } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { translations } from "@/lib/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSectionProps {
  title: string;
  typeFilter: {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  };
  lotFilter?: {
    value: string;
    onChange: (value: string) => void;
    lots: Lot[];
  };
  viewFilter?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  };
}

export default function FilterSection({
  title,
  typeFilter,
  lotFilter,
  viewFilter,
}: FilterSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {/* View Filter (optional) */}
          {viewFilter && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-muted-foreground">
                {translations.labels.view}:
              </span>
              <Select
                value={viewFilter.value}
                onValueChange={viewFilter.onChange}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {viewFilter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="text-muted-foreground h-4 w-4" />
            <Select
              value={typeFilter.value}
              onValueChange={typeFilter.onChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeFilter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lot Filter (optional) */}
          {lotFilter && (
            <div className="flex items-center space-x-2">
              <Select
                value={lotFilter.value || "__all__"}
                onValueChange={lotFilter.onChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={translations.filters.allLots} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">
                    {translations.filters.allLots}
                  </SelectItem>
                  {lotFilter.lots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id}>
                      Lote {lot.lotNumber} - {lot.owner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}