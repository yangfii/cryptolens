import { NextRequest } from "next/server";
import { getCryptoNews } from "@/lib/news";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const categoriesParam = req.nextUrl.searchParams.get("categories");
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "30");
  const categories = categoriesParam
    ? categoriesParam.split(",").map((c) => c.trim()).filter(Boolean)
    : undefined;

  const items = await getCryptoNews(limit, categories);
  return Response.json(
    { items },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
