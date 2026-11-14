# Prospector CRM Compact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the Prospector panel into a compact CRM interface without changing its workflows.

**Architecture:** Keep the single-file HTML application and existing JavaScript behavior. Replace the visual system and lead-card markup with more semantic grouping for header, workspace controls, lead context and prioritized actions; APIs and event data attributes remain compatible.

**Tech Stack:** Static HTML, CSS and browser JavaScript.

**Spec:** `docs/superpowers/specs/2026-11-13-prospector-crm-compact-design.md`

## Global Constraints

- Preserve existing routes, local storage keys, filters, status controls and event `data-act` values.
- Do not add dependencies, external imagery or API changes.
- Retain keyboard-accessible controls, focus visibility and responsive behavior.

## Review Focus

- Narrow viewports preserve access to every lead action; covered in Task 1 responsive CSS.
- Long business names, addresses and notes do not overflow cards; covered in Task 1 styles.
- Hidden/disabled send controls retain their existing published-preview rule; covered in Task 2 markup compatibility check.
- Existing lead click handlers still receive `data-act` and lead IDs; covered in Task 2 markup compatibility check.
- Metrics and filters remain usable without a mouse; covered in Task 1 focus styles and native controls.

---

### Task 1: Visual system and workspace hierarchy

**Files:**
- Modify: `tools/prospector/ui/index.html:7-146`

**Interfaces:**
- Preserves: existing IDs used by JavaScript (`btnSearch`, `stats`, `leads`, filters and dialogs).
- Produces: `app-header`, `workspace`, and responsive card/focus styles.

- [ ] **Step 1: Add a structural smoke test** that asserts required interactive IDs remain in the HTML.
- [ ] **Step 2: Run the smoke test** and verify it fails for the new semantic workspace landmarks.
- [ ] **Step 3: Implement header, search and management-area visual hierarchy** using CSS and non-breaking HTML wrappers.
- [ ] **Step 4: Run the smoke test** and verify it passes.

### Task 2: Compact lead cards and action priority

**Files:**
- Modify: `tools/prospector/ui/index.html:285-337`
- Modify: `tools/prospector/test/ui-shell.test.mjs`

**Interfaces:**
- Consumes: existing `renderLeads()` data and action attributes.
- Produces: structured lead-card markup with `lead-main`, `lead-actions-primary` and `lead-actions-secondary` while preserving all `data-act` names.

- [ ] **Step 1: Extend the failing smoke test** with the desired lead-card classes and existing action attributes.
- [ ] **Step 2: Run the smoke test** and verify it fails because the new groupings do not exist.
- [ ] **Step 3: Update `renderLeads()` and CSS** to group context and actions without changing behavior.
- [ ] **Step 4: Run the smoke test and complete npm suite** and verify they pass.

## Self-review

The plan covers the spec’s visual hierarchy, card scanability, prioritized actions, mobile behavior and accessibility without API changes. Markup classes are additive; all existing IDs and event attributes are retained.
