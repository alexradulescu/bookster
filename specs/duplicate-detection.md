# Duplicate Detection Feature Specification

## Overview

Add functionality to detect and manage duplicate books in the library. Users can check for duplicates from the Settings page and delete unwanted entries.

## Definition of Duplicate

A book is considered a **duplicate** when:
- It has the **same title** as another book (case-insensitive)
- Author does **NOT** need to match - same title = duplicate
- `isSample` status is irrelevant - a sample and full book with same title are duplicates
- Category/Location differences are irrelevant - same title in different categories = duplicate

### Examples

| Book A | Book B | Duplicate? |
|--------|--------|------------|
| "The Hobbit" by Tolkien | "The Hobbit" by Tolkien | Yes |
| "The Hobbit" by Tolkien | "the hobbit" by Tolkien | Yes (case-insensitive) |
| "The Hobbit" by Tolkien | "The Hobbit" by Unknown | Yes (author ignored) |
| "The Hobbit" (sample) | "The Hobbit" (full) | Yes |
| "The Hobbit" in Fiction | "The Hobbit" in Fantasy | Yes |
| "The Hobbit" | "The Lord of the Rings" | No |

## User Interface

### Location in Settings

Add a new **"Duplicates"** tab to the existing Settings page tabs:
- Config | Categories | Locations | **Duplicates**

### Duplicates Tab Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Duplicates                                                   │
│                                                              │
│ Check your library for books with the same title.           │
│                                                              │
│ ┌─────────────────────────────────────────────┐             │
│ │  🔍 Check for Duplicates                     │             │
│ └─────────────────────────────────────────────┘             │
│                                                              │
│ [Results appear here after clicking button]                  │
└─────────────────────────────────────────────────────────────┘
```

### No Duplicates Found State

When no duplicates exist:

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ No duplicates found!                                      │
│   Your library is clean.                                    │
└─────────────────────────────────────────────────────────────┘
```

### Duplicates Found State

When duplicates exist, display a table grouped by title:

```
┌─────────────────────────────────────────────────────────────┐
│ Found 3 duplicate groups (6 books)                          │
│                                                              │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Title           │ Author      │ Sample │ Location │   │   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ "The Hobbit"                                     [group]│   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ The Hobbit      │ J.R.R Tolkien│ No    │ Shelf 1  │ 🗑│   │
│ │ The Hobbit      │ J.R.R Tolkien│ Yes   │ Kindle   │ 🗑│   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ "1984"                                           [group]│   │
│ ├───────────────────────────────────────────────────────┤   │
│ │ 1984            │ George Orwell│ No    │ Shelf 2  │ 🗑│   │
│ │ 1984            │ G. Orwell    │ No    │ Box 1    │ 🗑│   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Table Columns

| Column | Description |
|--------|-------------|
| Title | Book title |
| Author | Book author |
| Sample | "Yes" or "No" (or badge) |
| Location | Comma-separated list of location labels, or "—" if none |
| Delete | Trash icon button to delete this specific book |

### Visual Grouping

- Books with the same normalized title are grouped together
- Each group has a visual separator/header showing the title
- Groups are sorted alphabetically by title
- Within each group, books are listed (order doesn't matter)

## User Flow

### Checking for Duplicates

1. User navigates to Settings
2. User clicks "Duplicates" tab
3. User clicks "Check for Duplicates" button
4. System scans all books (client-side, using existing `useBooks()` data)
5. Results displayed:
   - If none: Success message
   - If found: Grouped table of duplicates

### Deleting a Duplicate

1. User clicks delete (trash) button on a book row
2. Confirmation dialog appears:
   - Title: "Delete Book"
   - Message: "Are you sure you want to delete '{book title}'? This action cannot be undone."
   - Buttons: "Cancel" | "Delete"
3. User confirms deletion
4. Book is deleted via existing `useDeleteBook()` mutation
5. Table automatically refreshes (removed book disappears)
6. Success notification/toast: "Book deleted successfully"

## Technical Implementation

### New Files

1. **`src/components/settings/DuplicatesTab.tsx`**
   - New React component for the Duplicates tab
   - Contains check button, results display, and table

### Modified Files

1. **`src/routes/settings.tsx`**
   - Add new "Duplicates" tab to Tabs component
   - Import and render `DuplicatesTab`

### No Backend Changes Required

- Duplicate detection happens client-side using existing `useBooks()` hook
- Deletion uses existing `useDeleteBook()` mutation
- No new Convex queries/mutations needed

### Duplicate Detection Algorithm (Client-Side)

```typescript
function findDuplicates(books: Book[]): Map<string, Book[]> {
  const groups = new Map<string, Book[]>();

  for (const book of books) {
    const normalizedTitle = book.title.toLowerCase().trim();

    if (!groups.has(normalizedTitle)) {
      groups.set(normalizedTitle, []);
    }
    groups.get(normalizedTitle)!.push(book);
  }

  // Filter to only groups with 2+ books (actual duplicates)
  const duplicates = new Map<string, Book[]>();
  for (const [title, bookGroup] of groups) {
    if (bookGroup.length > 1) {
      duplicates.set(title, bookGroup);
    }
  }

  return duplicates;
}
```

### Location Display

To display location labels:
- Use existing `useLocations()` hook to get all locations
- Map `book.locationIds` to location labels
- Display as comma-separated string, or "—" if empty

### UI Components (Mantine)

- `Button` - Check for Duplicates button
- `Table` - Duplicates table
- `ActionIcon` - Delete button
- `Text` - Messages and labels
- `Alert` or custom Box - Success/info messages
- `Modal` - Delete confirmation dialog
- `notifications.show()` - Success toast after deletion

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Empty library | "No duplicates found" message |
| No duplicates | "No duplicates found" message |
| Book deleted, was last in group | Group removed from table |
| All duplicates deleted | Switch to "No duplicates found" message |
| Location was deleted (soft delete) | Show "Unknown" or omit from list |
| Book has no locations | Show "—" in location column |
| Book has multiple locations | Show comma-separated: "Shelf 1, Kindle" |

## Summary

| Aspect | Decision |
|--------|----------|
| Duplicate definition | Same title only (case-insensitive) |
| Trigger | On-demand (button click) |
| UI location | New "Duplicates" tab in Settings |
| Display mode | Inline table (not modal) |
| Grouping | Group by normalized title |
| Empty state | Success message |
| Delete confirmation | Yes, modal dialog |
| After delete | Auto-refresh + toast notification |
| Bulk delete | No, individual only |
