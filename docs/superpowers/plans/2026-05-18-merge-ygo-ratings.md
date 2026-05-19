# Merge Level/Rank and Link Rating Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Combine Yu-Gi-Oh! Level/Rank and Link Rating filters into a single ergonomic UI section to save space and simplify search.

**Architecture:** Update the backend SQL generation to check both `level` and `linkval` JSON attributes when a `level` filter is requested. Update the UI to merge these two into a single "Level / Rank / Link" grid.

**Tech Stack:** React, TypeScript, SQLite (better-sqlite3)

---

### Task 1: Backend Combined Filter Support

**Files:**
- Modify: `src/services/storage/SqliteStorageProvider.ts`

- [ ] **Step 1: Update loadCards to support combined grade filtering**

In `loadCards`, find the attribute filtering logic and update the `exact` match handling for the `level` key to check both `level` and `linkval` in the card's attributes JSON.

```typescript
// src/services/storage/SqliteStorageProvider.ts

// Inside the attributeFilters loop, specifically for numeric object values:
if (value.exact !== undefined) {
  if (key === 'level') {
    query += ` AND (CAST(json_extract(attributes, '$.level') AS INTEGER) = ? OR CAST(json_extract(attributes, '$.linkval') AS INTEGER) = ?)`;
    params.push(value.exact, value.exact);
  } else {
    query += ` AND CAST(json_extract(attributes, '$.${key}') AS INTEGER) = ?`;
    params.push(value.exact);
  }
}
```

- [ ] **Step 2: Commit backend changes**

```bash
git add src/services/storage/SqliteStorageProvider.ts
git commit -m "feat(api): support combined level/link rating filtering"
```

### Task 2: UI Merged Selection Redesign

**Files:**
- Modify: `src/ui/src/components/filters/YgoFilterPanel.tsx`

- [ ] **Step 1: Clean up YgoFilters interface**

Remove the now-redundant `linkval` from the filter interface.

```typescript
// src/ui/src/components/filters/YgoFilterPanel.tsx

interface YgoFilters {
  atk?: { min?: number; max?: number };
  def?: { min?: number; max?: number };
  attribute?: string;
  race?: string;
  level?: { exact?: number; min?: number; max?: number };
}
```

- [ ] **Step 2: Update the Level grid to handle all ratings**

Merge the sections into "Level / Rank / Link".

```typescript
// src/ui/src/components/filters/YgoFilterPanel.tsx

// Replace the Level and Link sections with:
<section className="space-y-4">
  <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
    <div className="flex gap-1">
      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
    </div>
    Level / Rank / Link
  </h3>
  <div className="flex flex-wrap gap-2">
    {[...Array(12)].map((_, i) => (
      <button
        key={i + 1}
        onClick={() => updateAttr('level', attrFilters.level?.exact === i + 1 ? undefined : { exact: i + 1 })}
        className={`w-7 h-7 flex items-center justify-center text-[11px] font-black border transition-all ${
          attrFilters.level?.exact === i + 1
            ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-110'
            : 'bg-background border-border text-text-muted/60 hover:text-yellow-500 hover:border-yellow-500/50'
        }`}
      >
        {i + 1}
      </button>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Commit UI changes**

```bash
git add src/ui/src/components/filters/YgoFilterPanel.tsx
git commit -m "style(ui): merge level/rank and link rating filters"
```

### Task 3: Verification

- [ ] **Step 1: Run build to ensure no regressions**

Run: `npm run build --prefix src/ui`
Expected: PASS

- [ ] **Step 2: Manual Check (Instruction)**

Verify that clicking a number (e.g. 4) in the unified "Level / Rank / Link" section correctly shows Level 4 monsters, Rank 4 monsters, and Link-4 monsters in the Compendium.
