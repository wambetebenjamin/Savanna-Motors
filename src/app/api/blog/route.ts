import { NextResponse } from "next/server";
import { PHOTOS } from "@/data/generated/photos";
import { SITE } from "@/data/site";
import { allPosts, loadPost } from "@/lib/blog";

export const revalidate = 300;

/**
 * GET /api/blog            — list the MDX articles in content/blog
 * GET /api/blog?slug=…     — a single article including its MDX source
 */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");

  if (slug) {
    const post = loadPost(slug);
    if (!post) {
      return NextResponse.json({ ok: false, error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      post: {
        ...post,
        image: PHOTOS[post.photo].remote,
        url: `${SITE.url}/blog/${post.slug}`,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    total: allPosts().length,
    posts: allPosts().map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      date: p.date,
      readMinutes: p.readMinutes,
      author: p.author,
      image: PHOTOS[p.photo].remote,
      url: `/blog/${p.slug}`,
    })),
  });
}
