---
title: "Making Markdown line break more user friendly"
slug: "markdown-line-break-user-friendly"
description: "How I solved the frustrating markdown line break problem in Standup Kiwi with a simple one-line fix that makes line breaks work intuitively for users."
pubDate: "2025-09-17"
author: "H. Alex Kwon"
authorTitle: "Product Engineer"
authorLink: "https://x.com/hyokualexkwon"
---

Standup Kiwi allows users to write daily standups using markdown syntax. However, some users mentioned they sometimes can't break lines because they're not familiar with line break syntax. So I added a feature to allow users to break lines more intuitively.

## The Problem

Picture this: a user types their daily standup update:

```
Fixed the login bug
Started working on the dashboard
Will continue tomorrow
```

But when it renders, they see:

```
Fixed the login bug Started working on the dashboard Will continue tomorrow
```

All their carefully formatted lines mashed into one long sentence. Pretty frustrating, right?

This is a common issue when building apps that use markdown for user input. Users expect line breaks to work like... well, line breaks. But markdown has other plans.

## Understanding Markdown Line Breaks

It turns out markdown has two types of line breaks:

### Soft Breaks

A single newline (`\n`) in markdown becomes a space in HTML. So this:

```
Line 1
Line 2
```

Becomes this HTML:

```html
<p>Line 1 Line 2</p>
```

### Hard Breaks

Two spaces followed by a newline (`  \n`) creates an actual line break. So this:

```
Line 1
Line 2
```

Becomes this HTML:

```html
<p>
  Line 1<br />
  Line 2
</p>
```

### Paragraph Breaks

Double newlines (`\n\n`) create separate paragraphs:

```
Paragraph 1

Paragraph 2
```

Becomes:

```html
<p>Paragraph 1</p>
<p>Paragraph 2</p>
```

## The UX Dilemma

This markdown behavior makes perfect sense for blog posts and documentation. Writers can format long paragraphs across multiple lines without creating unwanted breaks.

But for short-form content like standup updates? It's confusing. Most people are used to word processors where you just hit Enter to break a line. Users aren't markdown experts — they expect line breaks to work intuitively.

## The Solution

I found a simple fix that preserves user expectations while keeping markdown functionality:

```javascript
export function parseMarkdownToHtml(text: string) {
  // Convert single newlines to markdown hard breaks
  const processedText = text.replace(/\n/g, "  \n");

  return micromark(processedText, {
    // ... markdown extensions
  });
}
```

Here's what this regex does:

- `/\n/g` - Find all newline characters (the `g` flag means "global" - replace ALL occurrences)
- `'  \n'` - Replace each with two spaces + newline (markdown's hard break syntax)

## Why This Works Perfectly

**Single line breaks** (what users type):

```
Fixed bug
Started feature
```

→ Becomes: `<p>Fixed bug<br>Started feature</p>`

**Double line breaks** (still work as paragraphs):

```
Fixed bug

Started new task
```

→ Becomes: `<p>Fixed bug</p><p>Started new task</p>`

The beauty is that double newlines already worked correctly in markdown, so this fix only affects the problematic single newlines.

## Alternative Approaches I Considered

### Pure Markdown

Keep standard behavior and educate users about two-space syntax.

**Verdict:** Confusing for users not familiar with markdown syntax.

### Convert to Paragraphs

Replace `\n` with `\n\n` to make everything a paragraph.

**Verdict:** Too much whitespace, breaks natural grouping.

### Complex Compromise

Preserve both behaviors with marker replacement:

```javascript
text
  .replace(/\n\n/g, "§PARAGRAPH§")
  .replace(/\n/g, "  \n")
  .replace(/§PARAGRAPH§/g, "\n\n");
```

**Verdict:** Overcomplicated for a problem that didn't actually exist (double newlines already worked).

## The Lesson

Sometimes the simplest solution is the right one. This one-line fix:

- Preserves existing markdown functionality
- Requires no user education
- Works intuitively

When building user-facing tools, I've learned not to be afraid of bending technical standards for better experience. Markdown "purity" matters less than users being able to communicate clearly.

For those curious about the technical details, the two-space + newline rule comes from the original CommonMark spec and is supported across all major markdown implementations.
