# cmynd Philosophy

`cmynd` is a personal content platform where **the products are the content**. It is not a generic CMS competing with Notion or Ghost. It is a monorepo of living, highly tailored applications that express what I build, how I think, and what I spend my time on.

Each surface is both functional and demonstrative — **the medium is the message**.

This document establishes the vision, vocabulary, and technical guidelines that govern what we build (and what we reject) within the `cmynd` ecosystem.

---

## The Monorepo Filter

Not every project belongs in `cmynd`. To keep the monorepo from becoming a graveyard of half-finished utilities, every new application or package must pass the **Three-Way Soul Test**:

1. **Does it demonstrate lived expertise?** No building templates or generic dashboards. It must solve a problem I have actually faced.
2. **Does it stack interests?** Does it integrate my personal quirks, hobbies, or lifestyle as "side characters" in the UI/UX?
3. **Does it optimize for audience application?** Does it provide immediate, actionable utility to the person interacting with it?

| What We Build | What We Avoid |
| --- | --- |
| **Relatable, raw utility** (high-performance CLI, functional custom blogs, live data feeds) | **Remarkable, flashy fronting** (empty templates, curated aesthetic-only sites, 3D landing pages with no depth) |
| **Proof-of-work features** (direct links to code, active databases, live build logs) | **Generic advice delivery** (standard newsletters with copy-pasted tips) |
| **Interactive playgrounds** (where users can run, fork, or copy configuration) | **Passive retention traps** (infinite scroll, heavy micro-animations, dopamine-chasing features) |

---

## Ethos

### Independence

`cmynd` is independently operated. There are no external stakeholders, no metrics to chase, and no growth-at-all-costs mandates. We do not optimize for empty views or virality; we optimize for **high-intent trust**. We would rather have 100 deep connections with peers and collaborators than 10,000 casual pageviews.

### The Products Are the Content

The defining idea of `cmynd` is that code is an artifact of taste. A terminal emulator is not a gimmick; it is a portfolio piece. A blog is not a publishing platform; it is a demonstration of engineering discipline. If an application does not teach something, demonstrate something, or express a personal value, it does not belong here.

### Relatable Tech, Remarkable Quality

We reject the highly manicured, sterile "tech influencer" aesthetic. We don't hide the messy parts of development. We let our **technical execution be remarkable**, while keeping our **user experience, errors, and workflows relatable**.

---

## Goals & Feature Targets

- **Proof of Work (The Anti-Grifter Rule):** Every technical claim made in the content must link to the code or data running it. If a blog post says *"This endpoint response time is under 50ms,"* there must be a live latency tracker widget on the page pulling directly from the backend.

- **Optimize for Application over Retention:** No popups, no newsletter gates, and no infinite loops designed to keep people on the page. Features must help the visitor **apply** what they see: "Copy raw config," "One-click fork workspace," or "Download JSON."

- **Zero-Friction Raw Capture:** Content creation should happen at the speed of thought. The Studio workspace must allow raw, unformatted markdown/voice capture. We prioritize human authenticity over structured categorization. Capture raw first; refine later.

- **AI as the Sparring Partner, Not the Source:** No "Write with AI" buttons in the editor. AI features in `cmynd` are strictly background workers: generating semantic tags, suggesting structural improvements during drafts, transcribing raw voice notes, or validating type safety. **The human writes; the machine tidies.**

---

## Product Surfaces

### 1. Studio (The Raw Input)

The private creation engine. A distraction-free, lightning-fast editor designed for raw cognitive transfer.

- **Core Feature:** *Voice-to-Outline Sparring.* Utilizing local or API-driven speech-to-text, allowing me to "talk out" an article while an LLM interviews me to push back on weak arguments, before outputting a clean structural outline.

### 2. Blog (The Relatable Medium)

A server-rendered, zero-bloat publication surface using Astro and Convex.

- **Core Feature:** *Code-Sandwich Views.* Code snippets in articles aren't just static markdown blocks. They are dynamic, showing the exact live file inside this monorepo using GitHub/local workspace sync.

### 3. Terminal Portfolio (The Interactive Résumé)

An interactive CLI portfolio that serves as an engineering sandbox.

- **Core Feature:** *Real-time Commands.* Users can type commands to query my real-world resume, see my active Spotify tracks, or check live server stats. It is an expression of deep technical taste masquerading as a utility.

### 4. The Sidecar (The Interest-Stacking Surface)

A highly personalized, live dashboard where my offline hobbies and interests show up as "side characters."

- **Core Feature:** *The Lived Log.* A fast, low-fidelity tracker displaying non-work activities — current physical training targets, music vinyl collection, or road-trip coordinates. It serves to "interest stack" with visitors, showing who I am outside of code.

---

## Technical Principles

These are the technical tenets that guide implementation decisions. They are enforced through linting, type checking, and strict boundaries.

### Type Safety Is Non-Negotiable

Strict TypeScript end-to-end. If a type cannot be strictly typed, the feature is redesigned. This creates an unshakeable codebase that allows us to move fast without breaking things.

### Reactive & Transparent (Convex)

Data syncs in real-time. But more importantly, our backend is transparent. The state of our Convex mutations and queries should be debuggable directly from a dedicated "inspect" panel on the public site, proving the architecture works.

### Composable Package Architecture

Shared logic lives in the `packages/` directory:

- `@elcokiin/ui`: Composable, unopinionated primitives (Radix) that adapt to any surface's aesthetic.
- `@elcokiin/env`: Strict runtime validation of environment variables via Zod.
- `@elcokiin/errors`: Unified, human-readable error models.

### No Hidden Magic

Avoid heavy, high-abstraction frameworks that obscure how the code actually runs. We build with primitives and composable packages so that when a visitor inspects our source code, they can easily understand the architecture.

---

## What cmynd Proves

- **That a personal site can be a living machine.** It is an active demonstration of modern full-stack engineering (Convex, Astro, TypeScript, Monorepos) that speaks louder than any static PDF resume ever could.

- **That you don't have to choose between being an engineer and being a human.** By building our hobbies, voice processing, and personality directly into the codebase, we show that great work is always personal.
