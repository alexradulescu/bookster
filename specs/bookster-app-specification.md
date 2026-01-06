# Bookster - Personal Book Library Tracker

## Project Overview

A personal Progressive Web App (PWA) for tracking books across multiple libraries (Kindle, Apple Books, physical bookshelves, etc.). Primarily designed for mobile iOS usage with minimal desktop access.

## Tech Stack

- **Frontend Framework**: React SPA with Vite
- **Routing**: TanStack Router
- **Backend/Database**: Convex (no authentication required)
- **UI Components**: Mantine UI
- **List Virtualization**: TanStack Virtual
- **PWA**: Configured for iOS devices

## Core Features

1. Book list with virtual scrolling
2. Add books (single or bulk CSV import)
3. Edit and delete books
4. Search and filter books
5. Customizable categories and locations
6. Book cover fallback with pastel colors and initials
7. Settings management
8. PWA optimized for iOS

---

## Data Model

### Books Collection

```typescript
{
  _id: Id<"books">,
  title: string,                    // Required
  author: string,                   // Required
  categoryIds: Id<"categories">[],  // Multi-select, optional
  locationIds: Id<"locations">[],   // Multi-select, optional
  isSample: boolean,                // Default: false
  dateAdded: number,                // Timestamp, auto-generated
  lastUpdated: number,              // Timestamp, auto-updated
}
```

### Categories Collection

```typescript
{
  _id: Id<"categories">,
  id: string,           // UUID
  label: string,        // Display name
  deletedAt?: number,   // Soft delete timestamp
}
```

### Locations Collection

```typescript
{
  _id: Id<"locations">,
  id: string,           // UUID
  label: string,        // Display name
  deletedAt?: number,   // Soft delete timestamp
}
```

**Default Locations** (created on first app initialization):
- Bookshelf
- Kindle
- Apple Books
- Google Books
- PDF

**Default Categories**: None (user creates as needed)

### Settings Collection

```typescript
{
  _id: Id<"settings">,
  userId: "default",                                    // Single user app
  defaultSortOrder: "dateAdded" | "title" | "author" | "category" | "location",
  theme: "system" | "light" | "dark",
}
```

---

## User Interface

### 1. Main Screen - Book List

#### Header (Sticky, 48px height)
- **Position**: Sticky at top
- **Background**: Same as app background
- **Height**: 48px
- **Layout**:
  - Left: "Bookster" text (app name)
  - Right: Settings icon button (cog icon)

#### Book List (Virtual Scrolling)
- **Implementation**: TanStack Virtual for performance
- **Important**: Check latest TanStack Virtual version and docs (do not rely on LLM memory)
- **Item Layout**:
  ```
  [Cover] Title
          Author
          [Category Badges] [Location Badges]
  ```
- **Book Cover**:
  - Very small thumbnail (like Kindle/Apple Books iOS)
  - Standard book aspect ratio (2:3)
  - Design: Pastel color background + 3-letter initials rotated 90° counter-clockwise (vertical text on left side)
  - Font size: 10-12px (whichever fits elegantly)
  - Color generation: Hash-based on book title for consistency (same book always same color)
  - Text color: Auto-calculated for contrast based on theme

- **Category Badges**:
  - Mantine Badge component
  - Size: xs
  - Variant: light
  - Color: cyan (all same color)

- **Location Badges**:
  - Mantine Badge component
  - Size: xs
  - Variant: light
  - Color: lime (all same color)
  - Position: Below author text

#### Bottom Bar (Sticky)
- **Position**: Fixed at bottom, 2px above safe environment padding
- **Layout**: Horizontal
  - Search input (takes most width)
  - 8px gap
  - Add button (+) inline with search

- **Search Input**:
  - Filter starts after user types 3+ characters
  - No search button needed (real-time filtering)
  - Clear button (X) appears as right decorator when value exists
  - Case-insensitive search
  - Search scope: titles and authors
  - Sort order for results:
    1. title.startsWith(search term)
    2. title.contains(search term)
    3. author.contains(search term)
  - Empty state: "No '{searchTerm}' book exists yet. Are you buying it?"
  - Search clears when:
    - User opens any modal
    - User navigates to settings page
    - User clicks clear button

- **Add Button Behavior**:
  - If search term exists when clicking +, auto-populate the title field in add modal
  - Auto-focus the title input in add modal

#### Default Sorting
- **Default**: Latest added (dateAdded descending)
- **User configurable** in Settings: dateAdded, title, author, category, location

#### Empty State
- Message: "No books here yet. Let's add some"

---

### 2. Add Book Modal

#### Two Tabs

**Tab 1: Single Book**
- **Fields**:
  - Title (required, inline validation)
  - Author (required, inline validation)
  - Categories (multi-select dropdown with filter capability)
  - Locations (multi-select dropdown with filter capability)
  - Is Sample (toggle switch, default: false)

- **Behavior**:
  - After successful add: Clear form and keep modal open
  - User manually closes modal when done
  - Validation: Inline error messages under title/author if empty on blur
  - No character limits on any field

- **Duplicate Detection**:
  - Check if book with same title + author exists (case-insensitive)
  - If duplicate: Skip and show notification "Book already exists"

**Tab 2: Bulk CSV Import**
- **CSV Format**:
  ```
  title,author,isSample
  "The Great Gatsby","F. Scott Fitzgerald",false
  "1984","George Orwell",true
  ```
  - Headers required: `title`, `author`, `isSample`
  - isSample values: `true` or `false`

- **Form Fields**:
  - CSV textarea (paste CSV content)
  - Location dropdown (optional, single-select)
    - Selected location applies to ALL books in the CSV
  - "Process" button

- **Workflow**:
  1. User pastes CSV + optionally selects location
  2. User clicks "Process"
  3. Show validation preview:
     - "Imported 45 books, skipped 5 duplicates, failed 2 due to missing data"
  4. User confirms
  5. Books are added to database
  6. User manually adds invalid entries one by one if needed

- **Validation**:
  - Rows missing title or author are skipped and counted as "failed"
  - Duplicates (same title + author, case-insensitive) are skipped

- **Duplicate Detection**: Same as single book (title + author, case-insensitive)

#### Modal Behavior
- Close on backdrop click (with "unsaved changes" prompt if applicable)
- Smart title pre-fill: If search term exists when opening modal, populate title field and auto-focus

---

### 3. Book Detail/Edit Modal

#### Layout
```
[Cover]    Title: [input]
(small)    Author: [input]
           Categories: [multi-select]
           Locations: [multi-select]
           Is Sample: [toggle]

           Date Added: [read-only]
           Last Updated: [read-only]

           [Save Button] [Delete Button]
```

- **Cover**: Small thumbnail on the left
- **Fields**: On the right, editable
- **Dates**: Read-only, displayed below main fields

#### Save Behavior
- After save: Stay on the detail modal (don't close)
- Show success notification

#### Delete Button (Double Confirmation)
- **Initial state**: Outlined red button, label "Delete"
- **First click**: Button changes to filled red, label "Are you sure?"
- **10-second timeout**: If no second click within 10s, button reverts to initial state
- **Second click**: Book is permanently deleted (hard delete)
- **After delete**: Close modal, show success notification

#### Modal Behavior
- Close on backdrop click (with "unsaved changes" prompt if form is dirty)
- Inline validation for title and author

---

### 4. Settings Page

#### Navigation
- Back button to return to book list

#### Three Tabs

**Tab 1: Config**
- **Default Sort Order**: Dropdown
  - Options: Date Added, Title, Author, Category, Location
- **Theme**: Dropdown
  - Options: System, Light, Dark

**Tab 2: Categories**
- **UI**: Table with inline editing
- **Columns**: Label, Actions (Edit, Delete)
- **Features**:
  - Add new category
  - Edit category label (inline)
  - Delete category (soft delete with confirmation)
  - No visual indicator of book count
  - No reordering capability
- **Empty state**: "No categories yet"
- **Soft Delete**: Categories are hidden forever but kept in DB for data integrity

**Tab 3: Locations**
- Same as Categories tab
- **Empty state**: "No locations yet"
- **Default locations**: Bookshelf, Kindle, Apple Books, Google Books, PDF (created on app initialization)

#### Category & Location Dropdowns (in Add/Edit Modals)
- Mantine Select component with filter capability
- Show only non-deleted items
- Multi-select enabled

---

## Technical Implementation Details

### 1. PWA Configuration

- **Target Platform**: iOS devices (iPhone/iPad)
- **Important**: Add meta tag to prevent zoom on input focus if font size < 16px
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  ```
- **Manifest**: Configure for "Add to Home Screen" functionality
- **Service Worker**: Basic offline caching (optional for V1)
- **Safe Area Padding**: Account for iOS notches and home indicators

### 2. Book Cover Design

**Important**: Book covers are NOT fetched from external APIs. All covers use the generated design below.

- **Aspect Ratio**: Standard book cover (2:3 width:height)
- **Background**: Pastel color
  - Generated using hash of book title for consistency
  - Ensure same book always gets same color
- **Text**: 3-letter initials, rotated 90° counter-clockwise (vertical text on left side of cover)
  - Logic:
    - If title has multiple words: First letter of each of first 3 words (e.g., "The Great Gatsby" → "TGG")
    - If title has 2 words: First letter of each + first letter again (e.g., "American Gods" → "AGa")
    - If title has 1 word: First 3 letters (e.g., "Dune" → "Dun")
  - Font size: 10-12px
  - Color: Auto-calculated for contrast against background color and current theme
- **Positioning**: Letters rotated 90° counter-clockwise, positioned vertically along the left side of the book cover

### 3. Search & Filter

- **Trigger**: After 3+ characters typed
- **Debounce**: Optional (100-200ms) for performance
- **Algorithm**:
  1. Filter books where title or author contains search term (case-insensitive)
  2. Sort results:
     - Books where title starts with search term (highest priority)
     - Books where title contains search term
     - Books where author contains search term
- **Clear behavior**: When modal opens or page changes

### 4. Duplicate Detection

- **Logic**: Compare `title.toLowerCase()` + `author.toLowerCase()`
- **Action**: Skip duplicate, increment "skipped" counter, show in summary

### 5. Virtual Scrolling

- **Library**: TanStack Virtual (formerly React Virtual)
- **Important**: Use latest documentation, not LLM memory
- **Configuration**:
  - Estimate item size based on book card height
  - Overscan: 5-10 items for smooth scrolling
  - Dynamic sizing if book cards vary in height

### 6. Notifications

- **Library**: Mantine Notifications
- **Position**: Top of page, under header
- **Vibration**: 50-100ms haptic feedback on mobile
- **Types**:
  - Success: Book added/updated/deleted
  - Error: Validation errors, API failures (future)
  - Info: Bulk import summary

### 7. Loading States

- **Initial Load**: "Loading books..." message
- **Convex Strategy**: Use `useQuery` with infinite cache, keep previous data while fetching updates
- **Button States**: Loading state on "Save" and "Delete" buttons

### 8. Theme

- **Default**: System theme (follows OS preference)
- **Override**: User can set Light or Dark in Settings
- **Mantine**: Use Mantine's theme system
- **Header Background**: Same as app background color

### 9. Animations

- **Philosophy**: Minimal, use Mantine defaults
- **Modal**: Default Mantine modal transitions
- **List**: No special animations for items appearing/updating

### 10. Error Handling

- **Error Boundary**: One top-level error boundary for the entire app
- **Assumption**: App is always online (no offline handling for V1)
- **Convex Errors**: Show error notification if Convex query/mutation fails

---

## Convex Schema

### Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  books: defineTable({
    title: v.string(),
    author: v.string(),
    categoryIds: v.array(v.string()),
    locationIds: v.array(v.string()),
    isSample: v.boolean(),
    dateAdded: v.number(),
    lastUpdated: v.number(),
  }),

  categories: defineTable({
    id: v.string(),
    label: v.string(),
    deletedAt: v.optional(v.number()),
  }),

  locations: defineTable({
    id: v.string(),
    label: v.string(),
    deletedAt: v.optional(v.number()),
  }),

  settings: defineTable({
    userId: v.string(),
    defaultSortOrder: v.string(),
    theme: v.string(),
  }),
});
```

### Convex Functions

#### Queries

- `books:list` - Get all non-deleted books
- `books:get(id)` - Get single book by ID
- `books:search(term)` - Search books by title/author
- `categories:list` - Get all non-deleted categories
- `locations:list` - Get all non-deleted locations
- `settings:get` - Get user settings

#### Mutations

- `books:add(book)` - Add single book with duplicate check
- `books:addBulk(books)` - Add multiple books from CSV
- `books:update(id, updates)` - Update book
- `books:delete(id)` - Hard delete book
- `categories:create(label)` - Create category with UUID
- `categories:update(id, label)` - Update category label
- `categories:delete(id)` - Soft delete category
- `locations:create(label)` - Create location with UUID
- `locations:update(id, label)` - Update location label
- `locations:delete(id)` - Soft delete location
- `settings:update(updates)` - Update user settings
- `init:createDefaults` - Create default locations on first run

---

## Project Structure

```
/bookster
├── /public
│   ├── manifest.json
│   └── icons/
├── /src
│   ├── /components
│   │   ├── /book
│   │   │   ├── BookCard.tsx
│   │   │   ├── BookList.tsx
│   │   │   ├── BookDetailModal.tsx
│   │   │   ├── AddBookModal.tsx
│   │   │   └── BookCover.tsx
│   │   ├── /settings
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── ConfigTab.tsx
│   │   │   ├── CategoriesTab.tsx
│   │   │   └── LocationsTab.tsx
│   │   ├── /common
│   │   │   ├── Header.tsx
│   │   │   ├── BottomBar.tsx
│   │   │   └── ErrorBoundary.tsx
│   ├── /hooks
│   │   ├── useBooks.ts
│   │   ├── useCategories.ts
│   │   ├── useLocations.ts
│   │   ├── useSettings.ts
│   │   └── useSearch.ts
│   ├── /utils
│   │   ├── bookCover.ts (color generation, initials logic)
│   │   ├── csv.ts (CSV parsing and validation)
│   │   ├── duplicate.ts (duplicate detection)
│   │   └── validation.ts (form validation)
│   ├── /routes
│   │   ├── __root.tsx
│   │   ├── index.tsx (book list)
│   │   └── settings.tsx
│   ├── /styles
│   │   └── theme.ts (Mantine theme configuration)
│   ├── main.tsx
│   └── App.tsx
├── /convex
│   ├── schema.ts
│   ├── books.ts (queries and mutations)
│   ├── categories.ts
│   ├── locations.ts
│   ├── settings.ts
│   └── init.ts (initialization logic)
├── specs/
│   └── bookster-app-specification.md (this file)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

**Principles**:
- Separate visual components from business logic
- Keep hooks and utility functions isolated
- Easy to follow and extend for humans and LLMs
- Clear separation of concerns

---

## Implementation Steps

### Phase 1: Project Setup
1. Initialize Vite + React + TypeScript project
2. Install dependencies:
   - TanStack Router
   - Convex
   - Mantine UI
   - TanStack Virtual
3. Configure Vite for PWA
4. Setup Mantine theme with system/light/dark modes
5. Configure TanStack Router
6. Setup Convex project and link to frontend

### Phase 2: Convex Backend
1. Define schema (books, categories, locations, settings)
2. Implement initialization logic (default locations)
3. Implement book queries and mutations
4. Implement categories CRUD
5. Implement locations CRUD
6. Implement settings queries and mutations
7. Test all functions in Convex dashboard

### Phase 3: Core UI Components
1. Create Header component (sticky, app name, settings icon)
2. Create BottomBar component (search input, add button)
3. Create BookCover component (pastel colors and 3-letter initials rotated 90° counter-clockwise)
4. Create BookCard component (layout with cover, title, author, badges)
5. Create BookList component with TanStack Virtual
6. Implement error boundary

### Phase 4: Book Management
1. Create AddBookModal component
   - Single book tab with form
   - Bulk CSV tab with validation preview
2. Create BookDetailModal component (view/edit/delete)
3. Implement duplicate detection logic
4. Implement CSV parsing and validation
5. Connect to Convex mutations
6. Add notifications for success/error states

### Phase 5: Search & Filter
1. Implement search hook with debouncing
2. Implement search algorithm (startsWith > contains priority)
3. Add clear button to search input
4. Handle empty states
5. Implement search term auto-populate in add modal

### Phase 6: Settings Page
1. Create SettingsPage with tabs (Config, Categories, Locations)
2. Implement ConfigTab (sort order and theme settings)
3. Implement CategoriesTab (table with inline editing)
4. Implement LocationsTab (same as categories)
5. Implement soft delete logic
6. Add back button to home

### Phase 7: Polish & PWA
1. Add PWA manifest and icons
2. Add meta tags for iOS (prevent zoom on input focus)
3. Configure safe area padding for iOS
4. Test on iOS devices (iPhone/iPad)
5. Implement haptic feedback for notifications
6. Test all animations and transitions
7. Verify theme switching works correctly

### Phase 8: Testing & Deployment
1. Test all CRUD operations
2. Test bulk CSV import with various edge cases
3. Test duplicate detection
4. Test search and filtering
5. Test on multiple iOS devices and screen sizes
6. Test in both light and dark modes
7. Deploy Convex backend
8. Deploy frontend

---

## Edge Cases & Validation

### Books
- Empty title/author: Show inline validation error
- Duplicate book: Skip and notify user
- CSV with missing data: Show in preview, skip invalid rows
- Book with deleted category/location: Display with ID only (gracefully handle)

### Categories & Locations
- Delete category/location in use: Soft delete, keep reference in books
- Empty label: Don't allow save
- Duplicate labels: Allow (no validation needed)

### Search
- Less than 3 characters: Show all books (no filtering)
- No results: Show "No '{searchTerm}' book exists yet. Are you buying it?"
- Special characters: Handle gracefully (escape for search)

### CSV Import
- Invalid CSV format: Show error message
- Missing headers: Show error message
- Empty rows: Skip silently
- Malformed data: Skip row, count as "failed"

---

## Future Features (Out of Scope for V1)

- Cover image fetching from OpenLibrary & Google Books APIs (with manual refetch option)
- ISBN field for better API lookups
- Reading status (not started, reading, finished)
- Personal notes/comments per book
- Data export to CSV
- Reading stats and analytics
- Multiple user support with authentication
- Book recommendations
- Goodreads integration
- Library syncing with Kindle/Apple Books

---

## Design Mockups (Text Description)

### Main Screen (Book List)
```
┌─────────────────────────────────────┐
│ Bookster                    [⚙️]    │ ← Header (48px, sticky)
├─────────────────────────────────────┤
│                                     │
│ [📕] The Great Gatsby               │
│      F. Scott Fitzgerald            │
│      [Fiction] [Kindle] [Bookshelf] │
│                                     │
│ [📘] 1984                           │
│      George Orwell                  │
│      [Dystopian] [Apple Books]      │
│                                     │
│ [📗] ...                            │
│                                     │
│     (virtual scrolled list)         │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ [🔍 Search...]            [+]       │ ← Bottom Bar (sticky)
└─────────────────────────────────────┘
```

### Add Book Modal - Single Tab
```
┌─────────────────────────────────────┐
│ Add Book                      [×]   │
├─────────────────────────────────────┤
│ [Single Book] [Bulk CSV]            │ ← Tabs
├─────────────────────────────────────┤
│                                     │
│ Title: [_____________________]      │
│                                     │
│ Author: [_____________________]     │
│                                     │
│ Categories: [Select...]             │
│                                     │
│ Locations: [Select...]              │
│                                     │
│ Is Sample: [ ] Toggle               │
│                                     │
│          [Add Book]                 │
│                                     │
└─────────────────────────────────────┘
```

### Book Detail Modal
```
┌─────────────────────────────────────┐
│ Book Details                  [×]   │
├─────────────────────────────────────┤
│ [📕]  Title: [The Great Gatsby]     │
│       Author: [F. Scott Fitzgerald] │
│       Categories: [Fiction] [×]     │
│       Locations: [Kindle] [×]       │
│       Is Sample: [ ] Toggle         │
│                                     │
│       Date Added: 2024-01-15        │
│       Last Updated: 2024-01-20      │
│                                     │
│       [Save]  [Delete]              │
└─────────────────────────────────────┘
```

### Settings Page - Config Tab
```
┌─────────────────────────────────────┐
│ [←] Settings                        │
├─────────────────────────────────────┤
│ [Config] [Categories] [Locations]   │ ← Tabs
├─────────────────────────────────────┤
│                                     │
│ Default Sort Order:                 │
│ [Date Added ▼]                      │
│                                     │
│ Theme:                              │
│ [System ▼]                          │
│                                     │
└─────────────────────────────────────┘
```

---

## Success Criteria

- ✅ User can add books individually with all metadata
- ✅ User can bulk import books via CSV
- ✅ User can edit and delete books
- ✅ User can search and filter books efficiently
- ✅ User can manage categories and locations
- ✅ App works smoothly on iOS devices as PWA
- ✅ Virtual scrolling performs well with 500-1000 books
- ✅ Duplicate detection prevents adding the same book twice
- ✅ Book covers have consistent, visually appealing fallbacks
- ✅ App respects user's theme preference (system/light/dark)
- ✅ All data persists in Convex backend

---

## Notes for Implementation

1. **TanStack Virtual**: Check the latest documentation before implementation - the API may have changed since LLM training.

2. **iOS PWA Meta Tags**: Ensure proper viewport configuration to prevent zoom on input focus.

3. **Pastel Color Generation**: Use a deterministic hash function (e.g., simple string hash) to ensure the same book title always generates the same color.

4. **CSV Parsing**: Consider using a library like `papaparse` for robust CSV parsing.

5. **Form Validation**: Use Mantine's form validation features for inline errors.

6. **Soft Deletes**: Always filter out `deletedAt !== undefined` in queries for categories and locations.

7. **UUID Generation**: Use a library like `uuid` for generating category and location IDs.

8. **Safe Area Padding**: Use CSS `env(safe-area-inset-*)` variables for iOS notch/home indicator support.

9. **Code Organization**: Keep components small and focused. Extract complex logic into custom hooks.

10. **Type Safety**: Use TypeScript strictly. Define types for all Convex queries/mutations.

---

## Conclusion

This specification provides a comprehensive blueprint for building the Bookster app. The implementation should follow React and Convex best practices while keeping the code clean, maintainable, and easy to extend. The app is designed to be simple, fast, and delightful to use on iOS devices.
