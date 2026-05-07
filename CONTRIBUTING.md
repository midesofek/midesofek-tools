# Contributing to midesofek-tools

Thanks for considering a contribution. This project welcomes PRs, but please read this short guide first.

## Ways to contribute

- **Bug reports** — open an issue with reproduction steps.
- **Feature requests** — open an issue describing the use case.
- **Code contributions** — see "Development" below.
- **Docs/typos** — small PRs welcome with no prior discussion.

## Development

```bash
git clone https://github.com/midesofek/midesofek-tools.git
cd midesofek-tools
npm install
npm run dev
```

The project uses Next.js App Router, TypeScript, and Tailwind. See [README.md](./README.md) for the full stack.

## Adding a new tool

1. Add an entry to `lib/tools.ts`. This is the registry — every tool's existence is declared here once.
2. Create `app/[slug]/page.tsx` following the pattern in `app/qr-code-generator/page.tsx`.
3. Create `content/tools/[slug].ts` with About, Features, Use Cases, FAQ, and optionally History sections.
4. Open a PR.

The homepage grid, sitemap, OG metadata, and cross-links between tools update automatically based on the registry.

## Code style

- TypeScript strict mode. No `any` unless there's a documented reason.
- Server Components by default. Mark interactive UI with `"use client"`.
- Follow the existing folder structure — don't introduce new top-level folders without discussion.
- Use shadcn/ui components from `components/ui/` rather than installing new UI libraries.

## Commit messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation only
- `chore:` maintenance, deps, config
- `refactor:` code change that's not a feature or fix
- `style:` formatting, no behavior change

Example: `feat(qr-generator): add Solana Pay amount support`

## Pull requests

- Keep PRs focused. One tool, one fix, one improvement at a time.
- Update the relevant content file if user-facing copy changes.
- Make sure `npm run build` passes locally before pushing.

## Questions

Open a [GitHub discussion](https://github.com/midesofek/midesofek-tools/discussions) or DM [@midesofek](https://x.com/midesofek) on X.
