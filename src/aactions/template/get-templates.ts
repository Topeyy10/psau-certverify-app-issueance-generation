"use server";

import { getLoggedInUser } from "../auth";
import type {
  ErrorResponse,
  SuccessResponse,
  Template,
  TemplatesResponse,
} from "../shared/types";
import { withCache } from "../shared/utils";
import { ensureMongoConnected } from "@/lib/server/mongoose";
import { TemplateModel } from "@/lib/server/models/TemplateDoc";

interface FetchTemplateProps {
  userId: string;
  limit: number;
  offset: number;
  searchTerm?: string;
}

const _fetchUserTemplates = async ({
  userId,
  limit,
  offset,
  searchTerm,
}: FetchTemplateProps): Promise<
  | SuccessResponse<Omit<TemplatesResponse, "page" | "hasNextPage">>
  | ErrorResponse
> => {
  try {
    await ensureMongoConnected();
    const filter: Record<string, unknown> = {
      author: userId,
      isDeleted: false,
    };
    if (searchTerm) {
      filter.name = { $regex: searchTerm, $options: "i" };
    }

    const [rows, total] = await Promise.all([
      TemplateModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      TemplateModel.countDocuments(filter),
    ]);

    const templatesData: Template[] = rows.map((row) => ({
      id: row._id,
      name: row.name,
      preview: row.coverFileId,
      json: row.jsonFileId,
      meta: {
        author: row.author,
        date_created: row.createdAt?.toISOString() ?? "",
        date_modified: row.updatedAt?.toISOString() ?? "",
        isPortrait: row.isPortrait as Template["meta"]["isPortrait"],
        size: {
          w: row.width,
          h: row.height,
          paper: row.paper,
        },
      },
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      ok: true,
      data: { templates: templatesData, total, totalPages },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch template";
    return { ok: false, error: message };
  }
};

const fetchUserTemplates = withCache({
  fn: _fetchUserTemplates,
  keyPartsGenerator: ({
    userId,
    limit,
    offset,
    searchTerm,
  }: FetchTemplateProps) => [
    "user-templates",
    userId,
    limit.toString(),
    offset.toString(),
    searchTerm || "",
  ],
  tagGenerator: ({ userId }) => [`user-templates-${userId}`],
  staticTag: "user-templates",
  revalidate: 300,
});

export async function getUserTemplates(
  searchTerm: string = "",
  page: number = 1,
  limit: number = 10,
  refresh: boolean = false,
): Promise<SuccessResponse<TemplatesResponse> | ErrorResponse> {
  try {
    const currentUser = await getLoggedInUser();
    if (!currentUser) {
      throw new Error("No session");
    }

    const offset = (page - 1) * limit;
    const res = await fetchUserTemplates(
      {
        userId: currentUser.$id,
        limit,
        offset,
        searchTerm,
      },
      refresh,
    );

    if (!res.ok) {
      throw new Error(res.error);
    } else {
      const { templates, total, totalPages } = res.data;

      return {
        ok: true,
        data: {
          templates,
          total,
          page,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
        },
      };
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch templates";
    return { ok: false, error: message };
  }
}
