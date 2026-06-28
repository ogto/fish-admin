import { NextResponse } from "next/server";

const placeId = "2057892767";
const naverMapUrl = "https://naver.me/50BsQQTL";
const summaryUrl = `https://map.naver.com/p/api/place/summary/${placeId}?lang=ko`;
const visitorReviewUrl = `https://m.place.naver.com/restaurant/${placeId}/review/visitor`;
const blogReviewUrl = `https://m.place.naver.com/restaurant/${placeId}/review/ugc`;
const reviewFetchLimit = 30;

type ReviewItem = {
  id: string;
  author: string;
  date: string;
  content: string;
  link?: string;
  imageUrl?: string;
  source: "visitor" | "blog";
};

type ReviewPayload = {
  place: {
    id: string;
    name: string;
    category: string;
    address: string;
    imageUrl?: string;
    naverMapUrl: string;
  };
  counts: {
    visitor: number;
    blog: number;
  };
  visitorReviews: ReviewItem[];
  blogReviews: ReviewItem[];
  fetchedAt: string;
  partial: boolean;
  message?: string;
};

function numberFromText(value: unknown) {
  const text = `${value ?? ""}`;
  const matched = text.match(/[\d,]+/);
  return matched ? Number(matched[0].replaceAll(",", "")) || 0 : 0;
}

function decodeNaverText(value?: string | null) {
  if (!value) return "";
  if (!/[ìíëêãÙ]/.test(value)) return value;

  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
}

function looksLikeReviewContent(text: string, source: "visitor" | "blog") {
  if (/[<>{}=]|class=|rel=|href=|gradient|favicon|stylesheet|script|svg|path/i.test(text)) {
    return false;
  }
  if (text.length < 24 || text.length > 2000) return false;

  return source === "blog"
    ? text.length >= 24
    : text.length >= 24;
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Referer: "https://map.naver.com/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Naver API failed: ${response.status}`);
  }

  return response.json();
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      Referer: "https://m.place.naver.com/",
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Naver review page failed: ${response.status}`);
  }

  return response.text();
}

function findObjectEnd(text: string, start: number) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }

  return -1;
}

function extractApolloObjects<T extends Record<string, unknown>>(
  html: string,
  typename: string,
) {
  const objects: T[] = [];
  const marker = `{"__typename":"${typename}"`;
  let cursor = 0;

  while (cursor < html.length) {
    const markerIndex = html.indexOf(marker, cursor);
    if (markerIndex < 0) break;
    const start = markerIndex;
    const end = findObjectEnd(html, start);
    cursor = markerIndex + marker.length;

    if (end < 0) continue;

    try {
      objects.push(JSON.parse(html.slice(start, end)) as T);
    } catch {
      continue;
    }
  }

  return objects;
}

function parseVisitorReviews(html: string) {
  const authors = new Map(
    extractApolloObjects<{
      id?: string;
      nickname?: string;
      url?: string;
      imageUrl?: string | null;
    }>(html, "VisitorReviewAuthor").map((author) => [author.id, author]),
  );

  return extractApolloObjects<{
    id?: string;
    body?: string;
    thumbnail?: string;
    visited?: string;
    created?: string;
    author?: { __ref?: string };
  }>(html, "VisitorReview")
    .filter((review) => looksLikeReviewContent(review.body ?? "", "visitor"))
    .slice(0, reviewFetchLimit)
    .map((review) => {
      const authorId = review.author?.__ref?.replace("VisitorReviewAuthor:", "");
      const author = authors.get(authorId);

      return {
        id: `visitor-${review.id ?? review.body?.slice(0, 30)}`,
        author: decodeNaverText(author?.nickname) || "방문자",
        date: decodeNaverText(review.visited ?? review.created),
        content: decodeNaverText(review.body).slice(0, 260),
        link: author?.url ?? visitorReviewUrl,
        imageUrl: review.thumbnail ?? author?.imageUrl ?? undefined,
        source: "visitor" as const,
      };
    });
}

function parseBlogReviews(html: string) {
  const parsed = extractApolloObjects<{
    id?: string;
    name?: string;
    url?: string;
    title?: string;
    contents?: string;
    thumbnailUrl?: string;
    date?: string;
    createdString?: string;
  }>(html, "FsasReview")
    .filter((review) => looksLikeReviewContent(review.contents ?? review.title ?? "", "blog"))
    .slice(0, reviewFetchLimit)
    .map((review) => ({
      id: `blog-${review.id ?? review.url ?? review.title}`,
      author: decodeNaverText(review.name) || "블로그",
      date: decodeNaverText(review.createdString ?? review.date),
      content: decodeNaverText([review.title, review.contents].filter(Boolean).join("\n")).slice(0, 300),
      link: review.url ?? blogReviewUrl,
      imageUrl: review.thumbnailUrl,
      source: "blog" as const,
    }));

  if (parsed.length > 0) return parsed;

  const reviews: ReviewItem[] = [];
  const marker = `{"__typename":"FsasReview"`;
  let cursor = 0;
  const decodeJsonString = (value: string) => {
    try {
      return JSON.parse(`"${value.replace(/"/g, "\\\"")}"`) as string;
    } catch {
      return value.replaceAll("\\u002F", "/");
    }
  };
  const readField = (block: string, name: string) => {
    const matched = block.match(new RegExp(`"${name}":"([\\s\\S]*?)"`));
    return matched?.[1] ? decodeJsonString(matched[1]) : "";
  };

  while (cursor < html.length && reviews.length < reviewFetchLimit) {
    const markerIndex = html.indexOf(marker, cursor);
    if (markerIndex < 0) break;
    const end = findObjectEnd(html, markerIndex);
    cursor = markerIndex + marker.length;
    if (end < 0) continue;

    const block = html.slice(markerIndex, end);
    const title = readField(block, "title");
    const contents = readField(block, "contents");

    if (!looksLikeReviewContent(contents || title, "blog")) continue;

    reviews.push({
      id: `blog-${readField(block, "url")}`,
      author: decodeNaverText(readField(block, "name")) || "블로그",
      date: decodeNaverText(readField(block, "createdString") || readField(block, "date")),
      content: decodeNaverText([title, contents].filter(Boolean).join("\n")).slice(0, 300),
      link: readField(block, "url") || blogReviewUrl,
      imageUrl: readField(block, "thumbnailUrl"),
      source: "blog",
    });
  }

  if (reviews.length === 0) {
    const fsasIndex = html.indexOf("\"FsasReview:");
    const block = fsasIndex >= 0 ? html.slice(fsasIndex, fsasIndex + 10000) : "";
    const title = readField(block, "title");
    const contents = readField(block, "contents");
    const url = readField(block, "url");

    if (url || title || contents) {
      reviews.push({
        id: `blog-${url || title}`,
        author: decodeNaverText(readField(block, "name")) || "블로그",
        date: decodeNaverText(readField(block, "createdString") || readField(block, "date")),
        content: decodeNaverText([title, contents].filter(Boolean).join("\n")).slice(0, 300),
        link: url || blogReviewUrl,
        imageUrl: readField(block, "thumbnailUrl"),
        source: "blog",
      });
    }
  }

  return reviews;
}

async function safeParseReviews(url: string, source: "visitor" | "blog") {
  try {
    const html = await fetchHtml(url);
    return source === "visitor" ? parseVisitorReviews(html) : parseBlogReviews(html);
  } catch {
    return [];
  }
}

export async function GET() {
  const summary = await fetchJson(summaryUrl);
  const placeDetail = summary?.data?.placeDetail ?? {};

  const [visitorReviews, primaryBlogReviews] = await Promise.all([
    safeParseReviews(visitorReviewUrl, "visitor"),
    safeParseReviews(blogReviewUrl, "blog"),
  ]);
  const blogReviews =
    primaryBlogReviews.length > 0
      ? primaryBlogReviews
      : await safeParseReviews(visitorReviewUrl, "blog");

  const payload: ReviewPayload = {
    place: {
      id: placeId,
      name: decodeNaverText(placeDetail.name) || "어시장브라더스",
      category: decodeNaverText(placeDetail.category?.category),
      address: decodeNaverText(placeDetail.address?.roadAddress ?? placeDetail.address?.address),
      imageUrl: placeDetail.images?.images?.[0]?.origin,
      naverMapUrl,
    },
    counts: {
      visitor: numberFromText(placeDetail.visitorReviews?.displayText),
      blog: numberFromText(placeDetail.blogReviews?.total),
    },
    visitorReviews,
    blogReviews,
    fetchedAt: new Date().toISOString(),
    partial: visitorReviews.length === 0 || blogReviews.length === 0,
    message:
      visitorReviews.length === 0 || blogReviews.length === 0
        ? "네이버가 일부 리뷰 본문 수집을 제한해 원문 링크를 함께 제공합니다."
        : undefined,
  };

  return NextResponse.json(payload);
}
