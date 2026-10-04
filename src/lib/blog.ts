import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { POSTS, getPost, type BlogPost } from "@/data/content";

const DIR = path.join(process.cwd(), "content", "blog");

export type LoadedPost = BlogPost & { content: string };

export function loadPost(slug: string): LoadedPost | undefined {
  const meta = getPost(slug);
  if (!meta) return undefined;
  const file = path.join(DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return undefined;
  const { content } = matter(fs.readFileSync(file, "utf8"));
  return { ...meta, content };
}

export const allPosts = (): BlogPost[] =>
  [...POSTS].sort((a, b) => +new Date(b.date) - +new Date(a.date));
