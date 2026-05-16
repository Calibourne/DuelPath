# CLAUDE.md — DuelPath

## Project Commands
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`

## Architecture & Conventions
- **Core-First:** Core logic in `src/core` must remain environment-agnostic (no `fs`, `http`, etc.).
- **Adapters:** Game-specific logic in `src/games` implementing `GameAdapter` interface.
- **Cross-Platform:** Target ES2022+ and use standard `fetch` for networking.
- **Storage:** Use abstract `StorageProvider` to allow swapping persistence layers.
