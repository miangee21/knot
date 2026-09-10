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
  activeTab: "item" | "category" | "location";
  viewMode: "grid" | "list";
  setSearchTerm: (val: string) => void;
  currentItems: TrashedItem[];
  itemsPerPage: number;
  setItemsPerPage: (val: number) => void;
  setItemToRestore: (item: TrashedItem) => void;
  setItemToDelete: (item: TrashedItem) => void;
  setDetailItem: (item: ItemDoc) => void;
  hasMore?: boolean;
  onLoadMore: () => void;
}

export function TrashContentArea({
  totalTrashCount,
  activeTab,
  viewMode,
  setSearchTerm,
  currentItems,
  itemsPerPage,
  setItemsPerPage,
  setItemToRestore,
  setItemToDelete,
  setDetailItem,
  hasMore = false,
  onLoadMore,
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

  if (currentItems.length === 0) {
    return (
      <EmptyState
        className="min-h-84"
        icon={XCircle}
        title="No results found"
        description={`No ${activeTab}s match your search or your bin is empty.`}
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
              onFolderClick={() => {}}
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
              onFolderClick={() => {}}
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

      <div className="mt-2">
        <Pagination
          itemsPerPage={itemsPerPage}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </>
  );
}
