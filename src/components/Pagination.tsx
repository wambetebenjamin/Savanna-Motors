import Link from "next/link";

export function Pagination({
  page,
  pages,
  params,
}: {
  page: number;
  pages: number;
  params: URLSearchParams;
}) {
  if (pages <= 1) return null;

  const href = (n: number) => {
    const next = new URLSearchParams(params.toString());
    if (n <= 1) next.delete("page");
    else next.set("page", String(n));
    const qs = next.toString();
    return `/cars${qs ? `?${qs}` : ""}`;
  };

  return (
    <nav className="sm-pagination" aria-label="Pagination">
      {page > 1 ? <Link href={href(page - 1)}>Prev</Link> : <span aria-disabled>Prev</span>}
      {Array.from({ length: pages }).map((_, i) => {
        const n = i + 1;
        return n === page ? (
          <span key={n} aria-current="page">
            {n}
          </span>
        ) : (
          <Link key={n} href={href(n)}>
            {n}
          </Link>
        );
      })}
      {page < pages ? (
        <Link href={href(page + 1)}>Next</Link>
      ) : (
        <span aria-disabled>Next</span>
      )}
    </nav>
  );
}
