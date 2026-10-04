import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { allPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Guides & advice for Kenyan car buyers",
  description:
    "Buying guides, maintenance schedules for Kenyan roads and financing advice from the Savanna Motors team in Nairobi.",
};

export default function BlogIndex() {
  const posts = allPosts();

  return (
    <>
      <PageHeader
        eyebrow="Guides & Advice"
        title="Read before you buy"
        lead="Practical articles written by our sales, finance and workshop teams — no filler."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        photo="intLuxuryDash"
      />

      <section className="sm-section">
        <div className="sm-container">
          <div className="sm-posts">
            {posts.map((post, index) => (
              <Reveal key={post.slug} index={index} step={70}>
                <article className="sm-post sm-card">
                  <Link href={`/blog/${post.slug}`} className="sm-post__media">
                    <Photo
                      name={post.photo}
                      alt={post.title}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </Link>
                  <div className="sm-post__body">
                    <p className="sm-meta" style={{ marginBottom: 6 }}>
                      {post.category} · {formatDate(post.date)} · {post.readMinutes} min read
                    </p>
                    <h2 style={{ fontSize: "1.125rem" }}>
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p style={{ fontSize: "var(--sm-fs-body-sm)" }}>{post.excerpt}</p>
                    <Link href={`/blog/${post.slug}`} className="sm-btn sm-btn--ghost sm-btn--sm">
                      Read article
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
