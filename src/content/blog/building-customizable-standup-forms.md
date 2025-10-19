---
title: "Building customizable standup forms"
slug: "customizable-standup-forms"
description: "How we built a flexible form builder that lets teams customize their standup structure, and the technical decisions behind it."
pubDate: "2025-10-18"
author: "H. Alex Kwon"
authorTitle: "Product Engineer"
authorLink: "https://x.com/hyokualexkwon"
tags: ["Engineering", "Product", "Features"]
draft: true
---

Different teams run standups differently. Some follow the classic "Yesterday/Today/Blockers" format. Others prefer "Done/Doing/Next" or want to track specific metrics like mood or confidence levels. Until now, Standup Kiwi forced everyone into the same three-question format.

This felt wrong. If we're building a standup record tool, it should adapt to how teams actually work, not the other way around.

So we built a customizable form builder that lets teams design their own standup structure.

## The problem

The original Standup Kiwi shipped with a hardcoded form:

- What did you do yesterday?
- What will you do today?
- Do you have any blockers?

This is a solid default based on the traditional standup format. But different teams have different needs:

- **Product teams** might want to track "Progress on OKRs" or "Customer feedback"
- **Design teams** might care about "Design reviews scheduled" or "Handoffs to engineering"
- **Solo developers** might just want a simple "What I'm working on" field
- **Some teams** don't care about blockers at all, while others need multiple blocker fields

A rigid form structure meant teams had to bend their workflow to fit our tool. That's backwards.

## The solution

We built a form builder that gives teams full control over their standup structure. Users can now:

- **Add new fields** with custom labels, descriptions, and placeholders
- **Edit existing fields** to change labels, mark as required/optional, and add helper text
- **Remove fields** they don't need (with a minimum of one field)
- **Reorder fields** using drag and drop or arrow buttons
- **Duplicate fields** to quickly create similar questions

The builder maintains all the defaults, so teams that are happy with "Yesterday/Today/Blockers" don't have to change anything. But for teams that need something different, the flexibility is there.

<!-- ## See it in action -->

<!--
TODO: Record demo video
Demo video plan:
- UI-only screen capture (no voiceover)
- Show: adding field → editing field → drag & drop reordering → saving
- Keep it 30-60 seconds, clean and smooth
- Video should be placed in /Users/hyokualexkwon/Repositories/standup-kiwi-website/public/ before publishing
-->

<!-- <video controls width="100%">
  <source src="/customizable-standup-forms-demo.mp4" type="video/mp4">
</video> -->

## Technical implementation

### Schema-driven architecture

Forms in Standup Kiwi are stored as JSON schemas in the database. Here's what the default schema looks like:

```typescript
export const DEFAULT_STANDUP_FORM_SCHEMA = {
  fields: [
    {
      name: "yesterday",
      label: "What did you do yesterday?",
      placeholder: "Write your reply here...",
      type: "textarea",
      required: true,
    },
    {
      name: "today",
      label: "What will you do today?",
      placeholder: "Write your reply here...",
      type: "textarea",
      required: true,
    },
    {
      name: "blockers",
      label: "Do you have any blockers?",
      placeholder: "Write your reply here...",
      description:
        "Share any challenges or obstacles that might slow down your progress",
      type: "textarea",
      required: false,
    },
  ],
};
```

Each field has:

- `name` - A unique identifier (auto-generated from the label)
- `label` - The question text shown to users
- `type` - Field type (currently only textarea, but extensible)
- `required` - Whether the field must be filled out
- `placeholder` and `description` - Optional helper text

This schema approach makes forms flexible and future-proof. We can add new field types, validation rules, or metadata without changing the database structure.

### Backend: Transactional form creation

When a user saves a new form, we need to create it and set it as the active form of the target board atomically. Here's how we handle that:

```typescript
createActive(boardId: number, schema: object) {
  return this.db.transaction(async (tx) => {
    const [standupForm] = await tx
      .insert(standupForms)
      .values({ boardId, schema })
      .returning();

    await tx
      .update(boards)
      .set({ activeStandupFormId: standupForm.id })
      .where(eq(boards.id, boardId));

    return standupForm;
  });
}
```

The transaction ensures that if either operation fails, nothing changes. This prevents situations where a form exists but isn't activated, or where we try to activate a form that failed to create.

The `standup_forms` table stores:

- The form schema as JSON
- A reference to the parent board
- Timestamps for creation and updates

Boards have an `activeStandupFormId` that points to the currently active form. This allows us to keep a history of form versions (though we don't expose this in the UI yet).

### Frontend: React Hook Form + Zod validation

The form builder itself is a complex piece of UI with lots of state. We used React Hook Form for field-level validation:

```typescript
const fieldEditSchema = z.object({
  label: z.string().min(1, "Label is required"),
  required: z.boolean(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
});

const {
  control,
  handleSubmit,
  reset,
  formState: { errors, isDirty },
} = useForm<FieldEditFormData>({
  resolver: zodResolver(fieldEditSchema),
  defaultValues: {
    label: field.label || "",
    required: field.required ?? true,
    description: field.description || "",
    placeholder: field.placeholder || "",
  },
});
```

Each field card can toggle between view and edit mode. The form tracks whether changes have been made (`isDirty`) and only enables the save button when there are unsaved changes.

### Drag and drop with Motion

For reordering fields, we used Motion's `Reorder` components:

```typescript
<Reorder.Group
  axis="y"
  values={draftSchema.fields}
  onReorder={handleReorder}
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-5)",
    listStyle: "none",
    padding: 0,
  }}
  transition={{ duration: 0.2 }}
>
  {draftSchema.fields.map((field, index) => (
    <Reorder.Item
      key={field.name}
      value={field}
      dragListener={false}
      dragControls={controls}
      transition={{ duration: 0.2 }}
      layout="position"
    >
      <FieldCard field={field} ... />
    </Reorder.Item>
  ))}
</Reorder.Group>
```

We set `dragListener={false}` and use custom drag controls so users can only drag from the grip handle, not from anywhere on the card. This prevents accidental reordering when trying to click buttons or edit fields.

## Design decisions and trade-offs

### Why drag and drop?

Drag and drop is a natural way to reorder items on desktop. Grab the handle, move the field, done.

But drag and drop doesn't work as well on mobile. Touch interfaces can make it hard to distinguish between scrolling and dragging. So we also added up/down arrow buttons that appear on smaller screens.

### Edit mode vs modal

We considered two approaches for editing fields:

1. **Modal dialog** - Click "Edit" → modal opens → make changes → close
2. **Edit mode** - Click "Edit" → card switches to edit mode → make changes → save

We chose edit mode because modals create confusion when you have multiple fields. If you click "Edit" on one field and a modal pops up, it's not immediately clear which field you're editing. With edit mode, the card itself switches to show the editing form, so there's no ambiguity.

The tradeoff is that edit mode takes up more space on the page. But since we're already showing one field per card, this seemed reasonable.

<!-- TODO: Proofread up to here. Continue proofreading from this point -->

### Auto-slugification

When users create a field, they just type a label like "What are you working on today?" The system automatically generates a `name` from the label:

```typescript
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces with dashes
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing dashes
}
```

So "What are you working on today?" becomes `what-are-you-working-on-today`. This gives us a stable identifier for the field that won't change if the user edits the label later.

Users never see these field names—they're purely internal. This keeps the interface simple while maintaining data integrity.

### Preventing empty forms

You can't save a form with zero fields. The "Remove" button is disabled when there's only one field left.

This prevents users from getting into a broken state where they can't create standups. There's always at least one field to fill out.

### Duplicate field feature

The "Duplicate" button creates a copy of a field with "(Copy)" appended to the label. This is useful when you want to create fields with similar properties:

- "What did you do yesterday?" → "What did you do yesterday? (Copy)"
- Edit to → "What will you do today?"

Instead of creating a new field and retyping similar labels, descriptions, or placeholder text, you can duplicate and modify what you need.

### Only textarea for now

The form builder currently only supports textarea fields. Checkboxes, dropdowns, number inputs, or date pickers aren't available yet, but textarea fields cover most standup use cases. We can add more field types later based on user feedback.

### Schema versioning

Forms are versioned by creating new records rather than updating existing ones. When a user saves form changes, we create a new `standup_form` and update the board's `activeStandupFormId`.

This solves an important problem: existing standups need the original schema to render properly. If a user posts a standup with form schema A, then the admin changes to schema B, that old standup still needs schema A to display correctly. By keeping all schema versions, every standup can reference the schema it was created with.

The tradeoff is slightly more complex data model. But it prevents breaking existing standups when the form structure changes.

### Balancing flexibility with simplicity

We could have made forms infinitely customizable—conditional logic, calculated fields, custom validation rules. But that would turn Standup Kiwi into a form builder tool rather than a standup tool.

The current design tries to balance flexibility with simplicity. You can customize what you need without getting overwhelmed by options.

## What's next

This is just the beginning for customizable forms. Here's what we're considering:

### More field types

Checkboxes, dropdowns, and number inputs would enable new use cases:

- "Blocked or need help?" (checkbox)
- "Work type: Bug fix / Feature / Tech debt" (dropdown)
- "Risk level for today's tasks" (1-5 scale)

<!-- TODO: need better examples? -->

### Form templates

Pre-built form templates for common workflows:

- Scrum teams: "Sprint tasks completed", "Sprint backlog", "Blockers"
- Design teams: "Designs completed", "Reviews scheduled", "Feedback needed"
- Solo developers: "Focus for today", "Distractions", "Tomorrow's plan"

Templates would make it easier for teams to get started without building forms from scratch.

## Try it out

This feature is live now in Standup Kiwi. If you want to customize your standup form:

1. Go to your board settings
2. Click the "Standups" tab
3. Add, edit, or reorder fields
4. Hit save

You can try it at [standupkiwi.com](https://app.standupkiwi.com).

If you run into issues or have ideas for improvements, [open an issue on GitHub](https://github.com/kiwinight/standup-kiwi). I'd love to hear how different teams are using this feature.
