//src/features/risk/hooks/useRiskAnalysis.ts
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ItemDoc } from "../../items/types";

export type RiskItemDoc = ItemDoc & {
  effectiveLocations: string[];
  riskPath: string;
};

export function useRiskAnalysis(
  itemsPerPage: number | "all",
  searchTerm: string,
  categoryId: string | null,
  selectedLocations: string[],
) {
  const initialNumItems = itemsPerPage === "all" ? 10000 : itemsPerPage;
  const hasFilters =
    searchTerm !== "" || categoryId !== null || selectedLocations.length > 0;

  const {
    results: paginatedItems,
    status,
    loadMore,
  } = usePaginatedQuery(api.risk.getRiskItems, {}, { initialNumItems });

  const filteredItems = useQuery(
    api.risk.getFilteredRiskItems,
    hasFilters ? { searchTerm, categoryId, selectedLocations } : "skip",
  );

  const globalCount = useQuery(api.risk.getRiskCount);

  const riskItems =
    hasFilters && filteredItems !== undefined
      ? filteredItems
      : paginatedItems || [];

  const totalGlobalCount = globalCount ?? 0;

  const isSearchLoading = hasFilters && filteredItems === undefined;
  const isLoading =
    status === "LoadingFirstPage" ||
    isSearchLoading ||
    globalCount === undefined;

  return {
    riskItems: riskItems as RiskItemDoc[],
    totalGlobalCount,
    hasFilters,
    isLoading,
    status,
    loadMore,
  };
}
