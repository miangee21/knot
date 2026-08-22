//src/app/(dashboard)/browse/[[...segments]]/page.tsx
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Plus, PackageOpen } from "lucide-react";

// Shared Components
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import { SearchBar } from "@/shared/components/SearchBar";
import { Pagination } from "@/shared/components/Pagination";

// Form & Types
import { ItemFormDialog } from "@/features/items/components/form/ItemFormDialog";
import { ItemFormData } from "@/features/items/types";

// Browser UI Components
import { ItemBreadcrumb } from "@/features/items/components/browser/ItemBreadcrumb";
import { ItemGrid } from "@/features/items/components/browser/ItemGrid";
import { ItemListTable } from "@/features/items/components/browser/ItemListTable";
import { ViewToggle } from "@/features/items/components/browser/ViewToggle";

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
import { useAction } from "convex/react";
import { uploadImageToCloudinary } from "../../../../features/items/utils/cloudinary";

export default function BrowsePage() {
  // Navigation & Route State
  const params = useParams();
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

  const { handleCreate } = useCreateItem();
  const { handleUpdate } = useUpdateItem();
  const { handleDelete } = useDeleteItem();
  const generateSignature = useAction(api.cloudinary.generateUploadSignature);

  // Form & Modals State
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<any | null>(null);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState<number | "all">(10);

  // Search Filter Logic
  const filteredItems = React.useMemo(() => {
    if (!items) return [];
    if (!searchTerm) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [items, searchTerm]);

  // Pagination Logic
  const totalItems = filteredItems.length;
  const isAll = itemsPerPage === "all";
  const startIndex = isAll ? 0 : (currentPage - 1) * (itemsPerPage as number);
  const endIndex = isAll
    ? totalItems
    : Math.min(startIndex + (itemsPerPage as number), totalItems);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset page on search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handlers
  const openNewDialog = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleItemClick = (item: any) => {
    // NOTE: Step 14 mein yahan ItemDetailSheet khulegi.
    // Abhi hum sirf log kar rahe hain, action nahi hoga taake app clean rahay.
    console.log("Detail sheet will open for:", item.name);
  };

  const onFormSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);
    try {
      let posterUrl = data.poster;

      if (data.poster instanceof File) {
        const uploadResult = await uploadImageToCloudinary(data.poster, () =>
          generateSignature(),
        );
        posterUrl = uploadResult.url;
      }

      const payload = {
        ...data,
        poster: typeof posterUrl === "string" ? posterUrl : undefined,
      };

      if (editingItem) {
        await handleUpdate(editingItem._id, payload);
      } else {
        await handleCreate(payload);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await handleDelete(itemToDelete._id);
      setItemToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-50 duration-500 w-full h-full pb-2">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Browse
          </h1>

          {/* Dynamic Breadcrumbs Component */}
          {!ancestorsLoading && <ItemBreadcrumb ancestors={ancestors} />}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {items && items.length > 0 && (
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search items..."
              className="w-full sm:w-56"
            />
          )}
          {/* Grid vs List Toggle */}
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          <Button
            onClick={openNewDialog}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:-translate-y-px transition-all h-11 px-6 w-full sm:w-auto shrink-0"
          >
            <Plus className="w-5 h-5 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-2">
        {itemsLoading || ancestorsLoading ? (
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
                items={currentItems}
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
              />
            ) : (
              <ItemListTable
                items={currentItems}
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

      {/* Item Form Dialog */}
      <ItemFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onFormSubmit}
        initialData={editingItem}
        defaultParentId={currentParentId || undefined}
        categories={categories || []}
        locations={locations || []}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={onConfirmDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item? If this is a folder, ALL items inside it will also be deleted forever."
      />
    </div>
  );
}
