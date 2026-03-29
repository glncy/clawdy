import Image from "next/image";

import { Card } from "@repo/ui/card";
import { Gradient } from "@repo/ui/gradient";

const LINKS = [
  {
    title: "Expo",
    href: "https://docs.expo.dev",
    description: "Reference mobile app docs for the Expo-based starter.",
  },
  {
    title: "Next.js",
    href: "https://nextjs.org/docs",
    description: "Review the web framework docs used by the starter web app.",
  },
  {
    title: "Turborepo",
    href: "https://turborepo.com/docs",
    description: "Explore monorepo patterns, task pipelines, and caching.",
  },
  {
    title: "Cloudflare",
    href: "https://developers.cloudflare.com",
    description: "Review deployment platform docs before wiring your own targets.",
  },
];

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed top-0 left-0 flex w-full justify-center border px-4 pt-8 pb-6 backdrop-blur-2xl border-neutral-800 from-inherit lg:static lg:w-auto lg:rounded-xl lg:p-4">
          starter app -&nbsp;
          <code className="font-mono font-bold">web</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center lg:static lg:h-auto lg:w-auto">
          <a
            className="pointer-events-none flex gap-2 p-8 place-items-center lg:pointer-events-auto lg:p-0"
            href="https://github.com/vercel/turborepo"
            rel="noopener noreferrer"
            target="_blank"
          >
            Built with{" "}
            <Image
              alt="Vercel Logo"
              className="dark:invert"
              height={24}
              priority
              src="/vercel.svg"
              width={100}
            />
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center">
        <div className="font-sans relative z-0 flex w-auto flex-col items-center justify-between gap-8 pt-[48px] pb-16 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32">
          <div className="z-50 flex w-full items-center justify-center">
            <div className="absolute min-h-[614px] min-w-[614px]">
              <Image alt="Abstract circles" height={614} src="circles.svg" width={614} />
            </div>
            <div className="absolute z-50 flex h-64 w-64 items-center justify-center">
              <Gradient className="h-[160px] w-[160px] opacity-90" conic small />
            </div>
          </div>
          <Gradient
            className="top-[-500px] h-[1000px] w-[1000px] opacity-[0.15]"
            conic
          />
          <div className="z-50 flex flex-col items-center justify-center gap-5 px-6 text-center lg:gap-6">
            <span className="rounded-full border border-neutral-700 bg-neutral-900/70 px-4 py-2 text-sm uppercase tracking-[0.3em] text-neutral-300">
              Fullstack Boilerplate
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              Start from shared infrastructure, not leftover product branding.
            </h1>
            <p className="max-w-2xl text-base text-neutral-400 md:text-lg">
              This starter keeps the monorepo, CI, shared UI, and release tooling
              in place so you can shape the product layer around your own app.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        {LINKS.map(({ title, href, description }) => (
          <Card href={href} key={title} title={title}>
            {description}
          </Card>
        ))}
      </div>
    </main>
  );
}
