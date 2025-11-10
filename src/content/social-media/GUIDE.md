# Social Media Writing Guide

This guide helps maintain a consistent, effective voice for Standup Kiwi's social media presence.

## Goal & Audience

**Primary Goal:** User acquisition - drive sign-ups and revenue

**Target Audience:** Teams and engineering leaders looking for better standup tools

## Tone Guidelines

### What We ARE:

- **Understated and clean**
- Factual and direct
- Elegant and humble
- Professional but approachable

### What We're NOT:

- American marketing hype ("Revolutionary!" "Amazing!" "Best!")
- Braggy or overselling
- Trump-like aggressive marketing
- Vague or fluffy

## Examples

### ✅ GOOD - Effective & Elegant

**Marketing Post Example (Personal Repost):**

```
The standard 3 standup questions don't work for your team? You can now customize them.
```

Why it works:

- Specific problem (standard 3 questions)
- Clear solution (customize them)
- No redundant CTA (original post has it)
- No hype, just facts

**Release Announcement Example (Company Account):**

```
Standup Kiwi v0.9.0 is out with customizable standup forms, admin role protection, and better line break rendering.

The main addition: a visual form builder that lets you customize your standup questions. Add, edit, remove, duplicate, and reorder fields with drag-and-drop. Each field supports custom labels, placeholders, descriptions, and required/optional settings. Changes apply immediately for all board members.

We've also added admin role protection for board settings. Only admins can modify name, timezone, standup forms, and invitation management, while keeping everything visible to the rest of the team.

Plus a small but important fix: single line breaks in standup responses now render properly, making text formatting more natural.

Try it out at https://standupkiwi.com or check out the full release note.

📝 Release note: https://github.com/kiwinight/standup-kiwi/blob/main/docs/releases/v0.9.0.md
```

Why it works:

- Clear headline (what's new)
- Factual language ("The main addition" not "The big feature")
- Detailed but organized
- Multiple CTAs (product + release notes)
- Humble tone ("small but important fix")

### ❌ BAD - Too Aggressive or Vague

**Too American/Hype:**

```
Your team's standup questions don't fit your workflow? We just fixed that! 🎉

v0.9.0 lets you customize everything in 2 minutes. Free to start → standupkiwi.com
```

Problems: Exclamation marks, "We just fixed that!", emoji, "everything"

**Too Vague:**

```
Every team runs standups differently. Now your tool can match your workflow.

v0.9.0 update → standupkiwi.com
```

Problems: Not clear what the problem or solution actually is

**Too Minimal (Won't Convert):**

```
v0.9.0 update: customizable standup forms.

standupkiwi.com
```

Problems: Just an announcement, no motivation to click

## Account Attribution

Use the `account` field in frontmatter to distinguish posts:

### Company Account Posts

```yaml
---
title: "Feature Announcement"
date: 2025-10-26
platform: linkedin
account: standup-kiwi
---
```

Use for:

- Official product announcements
- Release notes
- Feature highlights
- Company updates

### Personal Account Posts (Founder)

```yaml
---
title: "Personal Repost"
date: 2025-10-26
platform: linkedin
account: hyoku-alex-kwon
---
```

Use for:

- Reposts of company announcements
- Personal insights/journey
- Founder perspective
- Network engagement

## Platform-Specific Notes

### LinkedIn

- Keep posts concise (2-3 short paragraphs max for company, 1-2 lines for reposts)
- One clear CTA
- Use line breaks for readability
- Professional tone

## Checklist Before Posting

- [ ] Does it clearly state a specific problem?
- [ ] Is the solution clear and actionable?
- [ ] Is the tone understated and elegant (not hype)?
- [ ] Would this make someone click to learn more?
- [ ] Is the CTA simple and direct?
- [ ] Does it have the right `account` field?

## Quick Reference

**Problem → Solution → CTA**

Keep it clean, keep it real, make them curious.
