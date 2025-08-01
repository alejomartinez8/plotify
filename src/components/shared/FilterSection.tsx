import { Filter, Calendar } from "lucide-react";
import { Lot } from "@/types/lots.types";
import { translations } from "@/lib/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSectionProps {
  title: string;
  typeFilter?: {
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
  yearFilter?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
  };
  actionButton?: React.ReactNode;
}

export default function FilterSection({
  title,
  typeFilter,
  lotFilter,
  viewFilter,
  yearFilter,
  actionButton,
}: FilterSectionProps) {
  const hasFilters = viewFilter || typeFilter || yearFilter || lotFilter;

  return (
    <div className="mb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:gap-4">
        {/* Title and Actions Row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          {actionButton && (
            <div className="flex items-center gap-2">
              {actionButton}
            </div>
          )}
        </div>

        {/* Filters Section */}
        {hasFilters && (
          <div className="border-t pt-4">
            {/* Filter Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 sm:flex-wrap">
              {/* View Filter */}
              {viewFilter && (
                <div className="flex items-center gap-2">
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
              {typeFilter && (
                <div className="flex items-center gap-2">
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
              )}

              {/* Year Filter */}
              {yearFilter && (
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <Select
                    value={yearFilter.value}
                    onValueChange={yearFilter.onChange}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearFilter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Lot Filter */}
              {lotFilter && (
                <div className="flex items-center gap-2">
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
        )}
      </div>
    </div>
  );
}