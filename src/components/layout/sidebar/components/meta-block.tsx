"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@/contexts";
import { adminPageMeta, issuerPageMeta, userPageMeta } from "../config";

const MetaBlock = () => {
  const pathname = usePathname();
  const { role } = useUser();

  const metaSource =
    role === "admin"
      ? adminPageMeta
      : role === "issuer"
        ? issuerPageMeta
        : userPageMeta;

  // First try exact match
  let page = metaSource[pathname];

  // If no exact match, try to find closest parent
  if (!page) {
    const entry = Object.entries(metaSource).find(([key]) =>
      pathname.startsWith(`${key}/`),
    );
    if (entry) {
      page = entry[1];
    }
  }

  if (!page || !role) return null;

  return (
    <section className="mb-8" aria-labelledby="pageTitle">
      <header>
        <h1 id="pageTitle" className="mb-0 text-3xl font-semibold">
          {page.title}
        </h1>
        <p className="text-muted-foreground">{page.description}</p>
      </header>
    </section>
  );
};

export { MetaBlock };
