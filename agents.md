# AGENTS.md — DuelPath

## Project Overview

DuelPath: desktop-first TCG platform. Focus:
- multi-game deck building
- format validation
- future roguelite deck progression

Goal: NOT gameplay simulation.

Stage 1 ONLY:
1. Fetch card data
2. Normalize schemas
3. Fetch format legality/restrictions
4. Group cards by game + format
5. Basic deck validation foundations

Initial targets:
- Yu-Gi-Oh
- MTG
- Pokémon
- Hearthstone

---

# Stage 1 Scope

Implement clean, extensible card ingestion pipeline.

System requirements:
- fetch card data from public APIs
- normalize to shared internal structure
- fetch/define legality/banlist info
- expose query utilities

DO NOT:
- duel simulation
- card effect execution
- AI systems
- roguelite mechanics
- multiplayer
- animations
- frontend polish

---

# Tech Stack

Preferred:
- TypeScript
- Node.js
- modular architecture
- JSON-based local persistence

Frontend/UI NOT part of stage.

---

# Core Architecture

## IMPORTANT:
Game-specific logic MUST stay isolated.

Use game adapters.

Example structure:

```txt
src/
  games/
    yugioh/
    mtg/
    pokemon/

  core/
    models/
    formats/
    validation/
    storage/

  services/
```
