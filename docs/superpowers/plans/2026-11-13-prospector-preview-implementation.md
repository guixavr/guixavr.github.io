# Prospector Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Prospector preview a persuasive, niche-aware landing page without image-provider dependencies and with safe send/publish behavior.

**Architecture:** Expand generated content with conversion modules, then render those modules using the existing theme palette instead of Google Places or external images. Enforce the published-before-send invariant in both the UI and server route.

**Tech Stack:** Node.js 22 ESM, `node:test`, static HTML/CSS, Anthropic SDK.

**Spec:** `docs/superpowers/specs/2026-11-13-prospector-preview-design.md`

## Global Constraints

- Do not load or publish Google Places or external images.
- Do not publish Google Places images or invent verifiable business claims.
- Keep previews short, responsive and usable without an external image API.
- Do not automate WhatsApp sending.

## Review Focus

- A manually entered or OSM lead has no photos and still receives a hero and gallery; covered in Task 1.
- Unknown themes select a safe default media set; covered in Task 1.
- Fallback copy does not claim an unverified team, experience, pricing or qualification; covered in Task 2.
- A direct request to the send API for an unpublished preview is rejected; covered in Task 3.
- A published preview preserves public business photos only as text/reviews, never as external Google photo URLs; covered in Task 2.

### Task 1: Rich, factual preview generation and rendering

**Files:**
- Modify: `tools/prospector/lib/generate.mjs`
- Modify: `tools/prospector/lib/render.mjs`
- Modify: `tools/prospector/server.mjs`
- Create: `tools/prospector/test/preview.test.mjs`

**Interfaces:**
- Produces: `generateContent(lead, details, settings)` with `highlights` and `trustLine`; `renderPreview(...)` that renders conversion modules without external imagery.

- [ ] **Step 1: Write failing tests** asserting that fallback copy has three highlights, local media appears in rendered HTML and supplied Google photo URLs do not appear.
- [ ] **Step 2: Run `node --test tools/prospector/test/preview.test.mjs`** and verify failure for missing fields/local media behavior.
- [ ] **Step 3: Expand the Zod schema, AI system prompt and fallback content** with factual conversion copy and niche visual direction.
- [ ] **Step 4: Render highlights and trust line; remove Google image rendering.**
- [ ] **Step 5: Run preview tests** and verify they pass.

### Task 2: Published-before-send guard

**Files:**
- Modify: `tools/prospector/server.mjs`
- Modify: `tools/prospector/ui/index.html`
- Create: `tools/prospector/test/send-guard.test.mjs`

**Interfaces:**
- Produces: a `400` API response when sending `first`, `followup` or `proposal` for a lead whose preview is not published.

- [ ] **Step 1: Extract/write a failing test** for a reusable `assertPreviewPublished(lead)` guard.
- [ ] **Step 2: Run `node --test tools/prospector/test/send-guard.test.mjs`** and verify it fails because the guard is absent.
- [ ] **Step 3: Implement the guard and call it in the sent route; disable send actions and modal confirmation when unpublished.**
- [ ] **Step 4: Run the guard test** and verify it passes.

### Task 3: Full verification and documentation

**Files:**
- Modify: `tools/prospector/package.json`
- Modify: `tools/prospector/README.md`

- [ ] **Step 1: Add the `node --test` npm script and document the illustrative local image behavior.**
- [ ] **Step 2: Run `npm test` from `tools/prospector`** and verify all tests pass.
- [ ] **Step 3: Run `node --check` for changed ESM files and `git diff --check`.**

## Self-review

All spec objectives are assigned: content/rendering is Task 2, local media is Task 1, send safety is Task 3 and verification/docs are Task 4. Interfaces use the exact `previewMedia` export and existing `generateContent`/`renderPreview` names. Review-focus cases are represented in their owning tasks. The plan adds no external provider, tracking or automatic messaging.
