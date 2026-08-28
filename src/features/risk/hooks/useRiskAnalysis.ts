//src/features/risk/hooks/useRiskAnalysis.ts
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ItemDoc } from "../../items/types";

export type RiskItemDoc = ItemDoc & {
  effectiveLocations: string[];
  riskPath: string;
};

export function useRiskAnalysis(
  currentPage: number,
  itemsPerPage: number | "all",
  searchTerm: string,
  categoryId: string | null,
  selectedLocations: string[],
) {
  const riskData = useQuery(api.risk.getRiskItemsPaginated, {
    currentPage,
    itemsPerPage,
    searchTerm,
    categoryId,
    selectedLocations,
  });

  return {
    riskItems: riskData?.items as RiskItemDoc[] | undefined,
    totalRiskCount: riskData?.totalCount,
    isLoading: riskData === undefined,
  };
}
