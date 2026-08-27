//src/features/trash/components/TrashContentArea.tsx
"use client";

import { Trash2, XCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/EmptyState";
import { Pagination } from "@/shared/components/Pagination";
import { TrashItemCards } from "./TrashItemCards";
import {
  TrashCategoryCard,
  TrashLocationCard,
  TrashLocationListRow,
} from "./TrashAssetCards";
import { ItemDoc, CategoryDoc, LocationDoc } from "@/features/items/types";

type TrashType = "item" | "category" | "location";
type TrashItemBase = {
  type: TrashType;
  name: string;
  _id: string;
  deletedAt?: number;
};
type TrashedItem = (ItemDoc | CategoryDoc | LocationDoc) & TrashItemBase;

interface TrashContentAreaProps {
  totalTrashCount: number;
  activeTabDataLength: number;
  filteredTrashLength: number;
  activeTab: "item" | "category" | "location";
  viewMode: "grid" | "list";
  setSearchTerm: (val: string) => void;
  currentItems: TrashedItem[];
  totalItems: number;
  itemsPerPage: number | "all";
  currentPage: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (val: number | "all") => void;
  setItemToRestore: (item: TrashedItem) => void;
  setItemToDelete: (item: TrashedItem) => void;
  setCurrentFolderId: (id: string | null) => void;
  setDetailItem: (item: ItemDoc) => void;
}

export function TrashContentArea({
  totalTrashCount,
  activeTabDataLength,
  filteredTrashLength,
  activeTab,
  viewMode,
  setSearchTerm,
  currentItems,
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  setItemsPerPage,
  setItemToRestore,
  setItemToDelete,
  setCurrentFolderId,
  setDetailItem,
}: TrashContentAreaProps) {
  if (totalTrashCount === 0) {
    return (
      <EmptyState
        icon={Trash2}
        title="Recycle Bin is empty"
        description="All deleted items will appear here."
      />
    );
  }

  if (activeTabDataLength === 0) {
    return (
      <EmptyState
        icon={Trash2}
        title={`No deleted ${activeTab === "item" ? "items" : activeTab === "category" ? "categories" : "locations"}`}
        description={`Your recycle bin is clear of ${activeTab === "item" ? "items" : activeTab === "category" ? "categories" : "locations"}.`}
      />
    );
  }

  if (filteredTrashLength === 0) {
    return (
      <EmptyState
        icon={XCircle}
        title="No results found"
        description="Try adjusting your search or filters."
        action={
          <Button
            variant="outline"
            onClick={() => setSearchTerm("")}
            className="rounded-full"
          >
            Clear Search
          </Button>
        }
      />
    );
  }

  return (
    <>
      {activeTab === "item" && viewMode === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {currentItems.map((item) => (
            <TrashItemCards
              key={item._id}
              item={item}
              onRestore={setItemToRestore}
              onDelete={setItemToDelete}
              onFolderClick={setCurrentFolderId}
              onDetailsClick={setDetailItem}
              viewMode="grid"
            />
          ))}
        </div>
      )}
      {activeTab === "item" && viewMode === "list" && (
        <div className="flex flex-col gap-3">
          {currentItems.map((item) => (
            <TrashItemCards
              key={item._id}
              item={item}
              onRestore={setItemToRestore}
              onDelete={setItemToDelete}
              onFolderClick={setCurrentFolderId}
              onDetailsClick={setDetailItem}
              viewMode="list"
            />
          ))}
        </div>
      )}
      {activeTab === "category" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentItems.map((item) => (
            <TrashCategoryCard
              key={item._id}
              item={item}
              onRestore={setItemToRestore}
              onDelete={setItemToDelete}
            />
          ))}
        </div>
      )}
      {activeTab === "location" && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentItems.map((item) => (
            <TrashLocationCard
              key={item._id}
              item={item}
              onRestore={setItemToRestore}
              onDelete={setItemToDelete}
            />
          ))}
        </div>
      )}
      {activeTab === "location" && viewMode === "list" && (
        <div className="flex flex-col gap-3">
          {currentItems.map((item) => (
            <TrashLocationListRow
              key={item._id}
              item={item}
              onRestore={setItemToRestore}
              onDelete={setItemToDelete}
            />
          ))}
        </div>
      )}

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
  );
}
