//src/app/(dashboard)/browse/[[...segments]]/page.tsx
"use client";

import * as React from "react";
import {
  Folder,
  Plus,
  ChevronRight,
  Home,
  PackageOpen,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";
import {
  ItemFormDialog,
  ItemFormData,
} from "@/features/items/components/form/ItemFormDialog";

import { useItemChildren } from "@/features/items/hooks/useItemChildren";
import { useCreateItem } from "@/features/items/hooks/useCreateItem";
import { useUpdateItem } from "@/features/items/hooks/useUpdateItem";
import { useDeleteItem } from "@/features/items/hooks/useDeleteItem";

import { useCategories } from "@/features/categories/hooks/useCategories";
import { useLocations } from "@/features/locations/hooks/useLocations";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import { useAction } from "convex/react";
import { uploadImageToCloudinary } from "../../../../features/items/utils/cloudinary";
import { SearchBar } from "@/shared/components/SearchBar";
import { Pagination } from "@/shared/components/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface BreadcrumbNode {
  id: Id<"items"> | null;
  name: string;
}

export default function BrowsePage() {
  // Navigation & Tree State
  const [currentParentId, setCurrentParentId] =
    React.useState<Id<"items"> | null>(null);
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbNode[]>([
    { id: null, name: "Home" },
  ]);

  // Data Hooks
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
  const navigateTo = (item: any) => {
    setCurrentParentId(item._id);
    setBreadcrumbs((prev) => [...prev, { id: item._id, name: item.name }]);
  };

  const navigateToBreadcrumb = (index: number) => {
    const node = breadcrumbs[index];
    setCurrentParentId(node.id);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const openNewDialog = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const confirmDelete = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    setItemToDelete(item);
  };

  const onFormSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);
    try {
      let posterUrl = data.poster;

      // If user selected a new file, upload to Cloudinary first
      if (data.poster instanceof File) {
        const uploadResult = await uploadImageToCloudinary(data.poster, () =>
          generateSignature(),
        );
        posterUrl = uploadResult.url;
      }

      // Prepare final payload for Convex
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
      // NOTE: Here you would also call your Cloudinary delete API if itemToDelete.poster exists
      await handleDelete(itemToDelete._id);
      setItemToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in-50 duration-500 w-full h-full pb-2">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/50 pb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Browse
          </h1>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center flex-wrap gap-1.5 text-sm font-medium">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div
                  key={crumb.id || "root"}
                  className="flex items-center gap-1.5"
                >
                  <button
                    onClick={() => navigateToBreadcrumb(index)}
                    className={`flex items-center transition-colors hover:text-primary ${
                      isLast
                        ? "text-foreground font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {index === 0 ? <Home className="w-4 h-4 mr-1" /> : null}
                    {crumb.name}
                  </button>
                  {!isLast && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                  )}
                </div>
              );
            })}
          </div>
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
        {itemsLoading ? (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Yahan par ab items ki jagah currentItems map hoga */}
              {currentItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigateTo(item)}
                  className="group relative flex flex-col justify-between p-4 rounded-3xl bg-card border border-border/80 shadow-(--shadow-premium) hover:shadow-(--shadow-premium-hover) dark:bg-[hsl(var(--card-elevated))] hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-32"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Folder className="w-5 h-5 fill-primary/20" />
                      </div>
                      <h3 className="font-bold text-foreground truncate max-w-40">
                        {item.name}
                      </h3>
                    </div>

                    {/* Action Menu */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full transition-colors outline-none border-none bg-transparent">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-36 rounded-2xl p-1.5 border-border bg-card shadow-(--shadow-dropdown)"
                        >
                          <DropdownMenuItem
                            onClick={(e) => openEditDialog(e, item)}
                            className="rounded-xl cursor-pointer py-1.5 px-3 text-sm font-semibold hover:bg-muted"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{" "}
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border h-px my-1 mx-1" />
                          <DropdownMenuItem
                            onClick={(e) => confirmDelete(e, item)}
                            className="rounded-xl cursor-pointer py-1.5 px-3 text-sm font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Component */}
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
