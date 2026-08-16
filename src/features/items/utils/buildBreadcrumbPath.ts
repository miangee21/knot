//src/features/items/utils/buildBreadcrumbPath.ts
import { Id } from "../../../../convex/_generated/dataModel";

export interface BreadcrumbNode {
  id: Id<"items"> | null;
  name: string;
}

export function buildBreadcrumbPath(
  ancestors: any[] | undefined,
): BreadcrumbNode[] {
  const path: BreadcrumbNode[] = [{ id: null, name: "Home" }];
  if (!ancestors || ancestors.length === 0) return path;

  // Reverse ancestors so it goes Root -> Parent -> Current
  const reversed = [...ancestors].reverse();
  reversed.forEach((anc) => {
    path.push({ id: anc._id, name: anc.name });
  });

  return path;
}
