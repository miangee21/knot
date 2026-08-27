//src/app/(dashboard)/browse/[[...segments]]/page.tsx
"use client";

import * as React from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Plus, PackageOpen } from "lucide-react";
// Shared Components
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { Pagination } from "@/shared/components/Pagination";
import { ItemFormData, ItemDoc } from "@/features/items/types";
import { toast } from "sonner";
// Browser UI Components
import { BrowseHeader } from "@/features/items/components/browser/BrowseHeader";
import { ItemGrid } from "@/features/items/components/browser/ItemGrid";
import { ItemListTable } from "@/features/items/components/browser/ItemListTable";
import { BrowseModals } from "@/features/items/components/browser/BrowseModals";
// Hooks
import { useItemChildren } from "@/features/items/hooks/useItemChildren";
import { useItemAncestors } from "@/features/items/hooks/useItemAncestors";
import { useCreateItem } from "@/features/items/hooks/useCreateItem";
import { useUpdateItem } from "@/features/items/hooks/useUpdateItem";
import { useDeleteItem } from "@/features/items/hooks/useDeleteItem";
import { useViewPreference } from "@/features/items/hooks/useViewPreference";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useLocations } from "@/features/locations/hooks/useLocations";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useDebounce } from "@/shared/hooks/useDebounce";

export default function BrowsePage() {
  // Navigation & Route State
  const params = useParams();
  const searchParams = useSearchParams();
  const locationFilterId = searchParams.get("locationFilterId");
  const segments = params.segments as string[] | undefined;

  // Get currentParentId from the last segment in the URL
  const currentParentId = (
    segments && segments.length > 0 ? segments[segments.length - 1] : null
  ) as Id<"items"> | null;
  const currentPath = segments ? `/browse/${segments.join("/")}` : "/browse";

  // View Preference (Grid vs List)
  const { viewMode, setViewMode } = useViewPreference();

  // Data Hooks
  const { ancestors, isLoading: ancestorsLoading } = useItemAncestors(
    currentParentId ?? undefined,
  );
  const { children: items, isLoading: itemsLoading } =
    useItemChildren(currentParentId);
  const { categories } = useCategories();
  const { locations } = useLocations();

  // Compute inherited locations from ancestors for new items
  const inheritedLocationIds = React.useMemo(() => {
    if (!ancestors) return [];
    const locSet = new Set<string>();
    ancestors.forEach((anc: ItemDoc) => {
      if (anc.locationIds) {
        anc.locationIds.forEach((id: string) => locSet.add(id));
      }
    });
    return Array.from(locSet);
  }, [ancestors]);

  const { handleCreate } = useCreateItem();
  const { handleUpdate } = useUpdateItem();
  const { handleDelete } = useDeleteItem();
  const generateUploadUrl = useMutation(api.items.generateUploadUrl);
  const deleteStorage = useMutation(api.items.deleteStorage);

  // Form & Modals State
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ItemDoc | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<ItemDoc | null>(null);
  const [detailItem, setDetailItem] = React.useState<ItemDoc | null>(null);
  const [movingItem, setMovingItem] = React.useState<ItemDoc | null>(null);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<number | "all">(10);

  // Global Search Query (Searches whole DB when searchTerm exists)
  const searchResults = useQuery(
    api.items.search,
    debouncedSearchTerm ? { query: debouncedSearchTerm } : "skip",
  );

  // Global Location Query (Fetches all items to filter globally)
  const allItemsFlat = useQuery(
    api.items.getAllItemsFlat,
    locationFilterId && !debouncedSearchTerm ? {} : "skip",
  );

  const isSearching =
    (debouncedSearchTerm.length > 0 && searchResults === undefined) ||
    searchTerm !== debouncedSearchTerm ||
    (locationFilterId && !debouncedSearchTerm && allItemsFlat === undefined);

  // Search Filter Logic (Global vs Local)
  const filteredItems = React.useMemo(() => {
    let baseItems = items || [];

    if (debouncedSearchTerm) {
      baseItems = searchResults || [];
    } else if (locationFilterId) {
      baseItems = allItemsFlat || [];
    }

    // Smart Dependency Filter: Show only items using this specific location
    if (locationFilterId) {
      baseItems = baseItems.filter(
        (item) =>
          item && (item.locationIds as string[]).includes(locationFilterId),
      );
    }

    return baseItems;
  }, [items, searchTerm, searchResults, locationFilterId, allItemsFlat]);

  // Pagination Logic
  const totalItems = filteredItems.length;
  const isAll = itemsPerPage === "all";
  const startIndex = isAll ? 0 : (currentPage - 1) * (itemsPerPage as number);
  const endIndex = isAll
    ? totalItems
    : Math.min(startIndex + (itemsPerPage as number), totalItems);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Prevent effect loops by caching the previous search term
  const prevSearchRef = React.useRef(debouncedSearchTerm);
  if (prevSearchRef.current !== debouncedSearchTerm) {
    setCurrentPage(1);
    prevSearchRef.current = debouncedSearchTerm;
  }

  // Handlers
  const openNewDialog = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleItemClick = (item: ItemDoc) => {
    setDetailItem(item);
  };

  const onFormSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);
    let newlyUploadedStorageId: Id<"_storage"> | undefined = undefined;

    try {
      let posterStorageId = undefined;
      // 1. Native Convex Storage Upload
      if (data.poster instanceof File) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": data.poster.type },
          body: data.poster,
        });
        if (!result.ok) {
          throw new Error(`Failed to upload image. Status: ${result.status}`);
        }
        const { storageId } = await result.json();
        posterStorageId = storageId;
        newlyUploadedStorageId = storageId; // Track for rollback
      } else if (
        typeof data.poster === "string" &&
        editingItem?.posterStorageId
      ) {
        // Keep existing storage ID if not changed
        posterStorageId = editingItem.posterStorageId;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { poster, ...cleanData } = data;
      const payload = {
        ...cleanData,
        posterStorageId,
      };

      try {
        if (editingItem)
          await handleUpdate(editingItem._id as Id<"items">, payload);
        else await handleCreate(payload);
      } catch (dbError) {
        if (newlyUploadedStorageId) {
          await deleteStorage({ storageId: newlyUploadedStorageId });
        }
        throw dbError;
      }

      setIsFormOpen(false);
      toast.success(editingItem ? "Item updated!" : "Item created!");
    } catch (error) {
      toast.error("Failed to save item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await handleDelete(itemToDelete._id as Id<"items">);
      setItemToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-50 duration-500 w-full h-full pb-2">
      <BrowseHeader
        locationFilterId={locationFilterId}
        currentPath={currentPath}
        ancestors={ancestors || []}
        ancestorsLoading={ancestorsLoading}
        items={(items || []).filter((i): i is ItemDoc => i !== null)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
        openNewDialog={openNewDialog}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-2">
        {itemsLoading || ancestorsLoading || isSearching ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : currentItems && currentItems.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title={searchTerm ? "No results found" : "This folder is empty"}
            description={
              searchTerm
                ? "Try adjusting your search."
                : "Create your first item or folder here to start organizing."
            }
            action={
              !searchTerm && (
                <Button
                  onClick={openNewDialog}
                  className="rounded-full px-6 h-11 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Item Here
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Dynamic Rendering based on ViewMode */}
            {viewMode === "grid" ? (
              <ItemGrid
                items={currentItems.filter((i): i is ItemDoc => i !== null)}
                currentPath={currentPath}
                allLocations={locations || []}
                onDetailsClick={handleItemClick}
                onEditClick={(item) => {
                  setEditingItem(item);
                  setIsFormOpen(true);
                }}
                onDeleteClick={(item) => {
                  setItemToDelete(item);
                }}
                onMoveClick={(item) => setMovingItem(item)}
              />
            ) : (
              <ItemListTable
                items={currentItems.filter((i): i is ItemDoc => i !== null)}
                currentPath={currentPath}
                allLocations={locations || []}
                onDetailsClick={handleItemClick}
                onEditClick={(item) => {
                  setEditingItem(item);
                  setIsFormOpen(true);
                }}
                onDeleteClick={(item) => {
                  setItemToDelete(item);
                }}
                onMoveClick={(item) => setMovingItem(item)}
              />
            )}
            {/* Pagination Component */}
            {totalItems > 0 && (
              <div className="mt-2">
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={(val) => {
                    setItemsPerPage(val);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
      {/* Unified Modals Component */}
      <BrowseModals
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        onFormSubmit={onFormSubmit}
        editingItem={editingItem}
        currentParentId={currentParentId}
        categories={categories || []}
        locations={locations || []}
        inheritedLocationIds={inheritedLocationIds}
        isSubmitting={isSubmitting}
        itemToDelete={itemToDelete}
        setItemToDelete={setItemToDelete}
        onConfirmDelete={onConfirmDelete}
        movingItem={movingItem}
        setMovingItem={setMovingItem}
        detailItem={detailItem}
        setDetailItem={setDetailItem}
        ancestors={ancestors}
      />
    </div>
  );
}
