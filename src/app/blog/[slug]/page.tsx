import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { PageHeader } from "@/components/PageHeader";
import { PHOTOS } from "@/data/generated/photos";
import { POSTS } from "@/data/content";
import { SITE } from "@/data/site";
import { allPosts, loadPost } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = loadPost(params.slug);
  if (!post) return { title: "Article not found" };
  const image = PHOTOS[post.photo].remote;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${SITE.url}/blog/${post.slug}`,
      publishedTime: post.date,
      images: [{ url: image, width: 1200, height: 800, alt: post.title }],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = loadPost(params.slug);
  if (!post) notFound();

  const others = allPosts().filter((p) => p.slug !== post.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: SITE.name },
    image: PHOTOS[post.photo].remote,
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow={post.category}
        title={post.title}
        lead={`${formatDate(post.date)} · ${post.readMinutes} min read · ${post.author}`}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.category },
        ]}
        photo={post.photo}
      />

      <section className="sm-section">
        <div className="sm-container">
          <article className="sm-prose">
            <MDXRemote source={post.content} />
          </article>

          <hr
            style={{
              margin: "var(--sm-space-5) 0",
              border: 0,
              borderTop: "1px solid var(--sm-border)",
            }}
          />

          <h2 style={{ fontSize: "1.5rem" }}>Keep reading</h2>
          <ul style={{ display: "grid", gap: 10 }}>
            {others.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  style={{ color: "var(--sm-secondary)", fontWeight: 500 }}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
