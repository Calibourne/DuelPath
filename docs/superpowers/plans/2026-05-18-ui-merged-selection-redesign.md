# UI Merged Selection Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Yu-Gi-Oh! filter panel UI to merge Level, Rank, and Link Rating filters into a single selection grid.

**Architecture:** Update the `YgoFilterPanel` component to remove separate Link Rating state and UI, merging it into the Level/Rank section for a cleaner layout.

**Tech Stack:** React, TypeScript, Tailwind CSS

---

### Task 1: Clean up YgoFilters interface and Component

**Files:**
- Modify: `src/ui/src/components/filters/YgoFilterPanel.tsx`

- [ ] **Step 1: Update YgoFilters interface**

Remove `linkval` from `YgoFilters` interface.

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

- [ ] **Step 2: Update Level/Rank section**

Replace the Level/Rank and Link Rating sections with a unified "Level / Rank / Link" section.

```typescript
// src/ui/src/components/filters/YgoFilterPanel.tsx

// Replace lines 122-167 (approx) with:
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

- [ ] **Step 3: Verify build**

Run: `npm run tsc` (in `src/ui`)
Expected: No type errors.

- [ ] **Step 4: Commit UI changes**

```bash
git add src/ui/src/components/filters/YgoFilterPanel.tsx
git commit -m "style(ui): merge level/rank and link rating filters"
```
