# cmynd Philosophy

`cmynd` is a personal content platform where the products *are* the content — what I build is what you're here to see, not a wrapper around it. It's a monorepo of purpose-built applications that don't separate engineering from everything else I'm into. The stuff I do outside of code isn't a bio section on a landing page; it's built into the products themselves.

This document establishes the vision and vocabulary for what we build (and what we reject) within the `cmynd` ecosystem.

---

## The Filter

Not everything belongs in `cmynd`. To keep the monorepo from becoming a graveyard of half-finished ideas, every new application or package has to answer three questions honestly:

1. **Does it come from something I've actually lived?** Not a template, not a "this would be a cool app" idea borrowed from somewhere else — a problem I've faced, a habit I already have, a thing I already do.
2. **Does it stack something outside of tech into it?** Does a personal interest, hobby, or piece of my daily life show up as a real part of the product — not as decoration, but as a "side character" in the UI/UX itself?
3. **Does whoever interacts with it walk away with something?** A config they can copy, a track they can fork, a number that means something, an idea they didn't have before. Not a judgment about whether it's "useful" — just whether it leaves something behind instead of just being looked at.

This isn't a rule against things looking good — some of the best proof-of-work *is* beautiful, and craft matters. It's a filter against emptiness: against building something just because it's impressive to screenshot, with nothing lived behind it and nothing for the visitor to take with them.

---

## Ethos

`cmynd` isn't run to hit a growth number or please a stakeholder — there isn't one. There's no roadmap dictated by what "performs." But that doesn't mean audience doesn't matter. If more people see it, use it, fork it, or connect with it, that's genuinely good — it's just not the starting point. The starting point is building what I actually want to build, publishing it, and using it myself. If it resonates beyond that, that's the bonus, not the target.

This is close to an idea from Caleb Ralston that stuck with me: put things out early, before you know exactly who they're for, use that first stretch to figure out what actually works and who shows up for it, and only then narrow in and scale the thing that proved itself. That doesn't mean testing stops once something clicks — it means the focus isn't supposed to exist on day one. `cmynd` works the same way: products get added, reshaped, or dropped as I learn what's worth continuing, not because the scope was locked in advance.

---

## Goals & Feature Targets

- **Backed by something real.** If something in the content makes a claim, there's usually a way to actually go check it — not a rule enforced on every sentence, just a general habit of not letting things stay abstract when they don't have to.

- **Made to be used, not just seen.** No newsletter walls, no popups chasing an email, nothing built purely to keep someone scrolling longer than they wanted to. Where it fits naturally, there's something to walk away with.

- **Capture first, shape later.** Getting an idea down shouldn't feel like filling out a form. Voice, rough text, whatever's fastest in the moment — structure and polish can happen after, not during.

- **AI stays in the background.** No "write this for me" button sitting in the middle of the process. If AI shows up, it's doing quieter things — tagging, transcribing, nudging structure — not writing on my behalf.

---

## How We Build

These are the values that guide implementation decisions, independent of whatever stack happens to be behind them at a given time.

### Transparent by Default

If a claim is made about how something works or performs, the mechanism behind it should be inspectable — not a black box you have to trust. State, data flow, and logic should be things a curious visitor can actually go look at.

### Shared, Not Copy-Pasted

Logic that's used more than once lives in a shared place instead of being duplicated across projects. Shared pieces stay unopinionated enough that each surface can still have its own personality on top of them.

### No Hidden Magic

We avoid heavy, high-abstraction tooling that obscures how the code actually runs. Things are built with primitives simple enough that someone reading the source can follow the architecture without having to trust a framework's word for it.

---

## What cmynd Proves

- **That a personal site can be a living thing, not a static resume.** It's an active demonstration of how I actually build — not a PDF that claims it.

- **That you don't have to choose between being an engineer and being a person.** By putting hobbies, interests, and the messier parts of a life directly into the codebase — not next to it — the work stays honest about the fact that it's mine.
