//src/features/risk/hooks/useRiskAnalysis.ts
import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ItemDoc } from "../../items/types";

export type RiskItemDoc = ItemDoc & {
  effectiveLocations: string[];
  riskPath: string;
};

export function useRiskAnalysis(
  itemsPerPage: number = 10,
  searchTerm: string,
  categoryId: string | null,
  selectedLocations: string[],
) {
  const storageKey = `knot_pagination_risk`;
  const savedLimit =
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem(storageKey))
      : 0;
  const initialNumItems = savedLimit > itemsPerPage ? savedLimit : itemsPerPage;

  const hasFilters =
    searchTerm !== "" || categoryId !== null || selectedLocations.length > 0;

  // Unified Paginated Query for everything (Search, Filters, Base)
  const {
    results: riskItems,
    status,
    loadMore: convexLoadMore,
  } = usePaginatedQuery(
    api.risk.getRiskItems,
    { searchTerm, categoryId, selectedLocations },
    { initialNumItems },
  );

  const loadMore = (count: number) => {
    convexLoadMore(count);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        storageKey,
        String((riskItems?.length || 0) + count),
      );
    }
  };

  const globalCount = useQuery(api.risk.getRiskCount);
  const totalGlobalCount = globalCount ?? 0;
  const isLoading = status === "LoadingFirstPage" || globalCount === undefined;

  return {
    riskItems: (riskItems || []) as RiskItemDoc[],
    totalGlobalCount,
    hasFilters,
    isLoading,
    status,
    loadMore,
  };
}
