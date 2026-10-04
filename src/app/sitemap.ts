import type { MetadataRoute } from "next";
import { CARS } from "@/data/cars";
import { POSTS } from "@/data/content";
import { SITE } from "@/data/site";

/** Dynamic sitemap built from every car slug and blog slug. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/cars",
    "/financing",
    "/service",
    "/compare",
    "/about",
    "/contact",
    "/blog",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const carRoutes = CARS.map((car) => ({
    url: `${SITE.url}/cars/${car.slug}`,
    lastModified: new Date(car.createdAt),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const postRoutes = POSTS.map((post) => ({
    url: `${SITE.url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...carRoutes, ...postRoutes];
}
