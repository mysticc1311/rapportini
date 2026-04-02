# Rapportini - Architecture Guide

## Overview
Rapportini is a field report management app built with React Native/Expo. It tracks work activities, customers, items used, and generates PDF reports.

## Key Concepts

### Database Schema

```
customers (1) ──┐
                 ├──> (N) reports (1) ──┐
                 │                       ├──> (N) report_items (M) ──> (N) items
                 └──────────────────────┘
```

#### Tables

**customers**
- Profile data for clients/companies
- Foreign key referenced by reports

**reports**
- Field reports with activity details
- Contains: activity, customer, date, hours_worked, hour_cost, notes
- Links to items via report_items bridge table

**items**
- Inventory of products/services that can be used
- Contains: name, description, cost

**report_items** (Bridge Table)
- N:N relationship between reports and items
- Tracks: report_id, item_id, quantity
- Allows multiple items per report with individual quantities

## Architecture Components

### 1. Database Layer (`/database`)

#### `db.ts`
- Database initialization and schema setup
- Handles migrations from old schema (time_start/time_end → hours_worked/hour_cost)
- Creates all tables on app start

#### `reports.ts`, `items.ts`, `customers.ts`
- CRUD operations for main entities
- Type definitions (interface + NewX type)
- Return type: mostly void or array of entities
- Example: `addReport()` returns `SQLiteRunResult` with `lastInsertRowId`

#### `reportItems.ts`
- Bridge table operations
- Key function: `addItemToReport(reportId, itemId, quantity)`
- Provides: `getItemsOfReport()` to fetch items with details

### 2. Context Layer (`/context`)

#### `ItemContext.tsx`
- **Purpose**: Manage items selected during report creation
- **State**: `selectedItems: SelectedItem[]` (with id, name, cost, quantity)
- **Functions**:
  - `addItem()` - Add item with default quantity 1
  - `updateQuantity()` - Modify quantity for selected item
  - `removeItem()` - Remove from selection
  - `clearItems()` - Reset after report saved
- **Lifecycle**: Items persist while on select-items screen, cleared after save

#### `CustomerContext.tsx`, `LanguageContext.tsx`, `ThemeContext.tsx`
- Similar pattern for customer selection, language preference, theme

### 3. Screens (`/app`)

#### `index.tsx` (Reports List)
- Main screen showing all reports
- Features:
  - Search/filter with FlatList
  - Long-press for multi-select
  - Share single report or batch
  - Delete with confirmation
  - Real-time updates via `useFocusEffect()`

#### `reports/create.tsx` (Create Report)
- Form for new report with:
  1. Activity description
  2. Customer picker (button → select-customer screen)
  3. Date (formatted as DD/MM/YYYY)
  4. Hours worked (decimal)
  5. Hourly cost (decimal)
  6. Items picker (button → select-items screen with quantities)
  7. Optional notes
- On save:
  1. Validate all fields
  2. Insert report
  3. Loop through `selectedItems` and call `addItemToReport()` with quantity
  4. Clear state and return

#### `reports/select-items.tsx` (Item Selection)
- Browse and select items with checkboxes
- For each selected item, show quantity controls:
  - Input field for direct entry
  - +/- buttons (increment/decrement by 0.5)
- Search to filter items
- Button to create new item inline
- "Done" button returns to create screen (items stay in context)

#### `items/create.tsx` (Create Item)
- Simple form: name, description, cost
- Saves to items table
- Adds to ItemContext for immediate selection

#### `reports/select-customer.tsx`, `customers/create.tsx`
- Similar pattern to items selection/creation

### 4. Utilities

#### `utils/pdf.ts`
- Convert reports to HTML table
- Generate PDF using expo-print
- Open native share dialog
- Called from main screen or single report

#### `constants/translations.ts`
- i18n strings in English (en) and Italian (it)
- Used with `t(key, language)` function

## Data Flow Examples

### Creating a Report

```
User fills form
     ↓
User taps "Items Used" → navigates to select-items screen
     ↓
User selects items, sets quantities in ItemContext
     ↓
User taps "Done" → returns to create screen
     ↓
Items displayed as badges with quantities (×2.5, etc)
     ↓
User taps "Save Report"
     ↓
handleSave() validates → addReport() → get lastInsertRowId
     ↓
For each item in selectedItems:
  addItemToReport(reportId, item.id, item.quantity)
     ↓
clearItems() resets context
```

### Viewing Reports

```
index.tsx loads on focus
     ↓
getAllReports() joins reports + customers
     ↓
Render as FlatList with customer name, date, activity
     ↓
Display hours/cost summary: "2.50h · €25.00/h"
```

## Important Patterns

### Context + Navigation
- Customer/Item contexts hold selections during multi-step flows
- Navigate to picker screen → user selects → return automatically at `router.back()`
- Context persists selection across navigation

### Quantities
- Stored as REAL (decimal) in database
- Minimum 0.1 to prevent zero quantities
- Displayed with 1 decimal place where needed

### Dates
- Stored as ISO strings in SQLite
- Text input formats on entry: DD/MM/YYYY
- No time component (just date)

### Validation
- Happens before database insert
- Returns early with Alert.alert() on error
- Required fields: activity, customer, date, hours, cost

### Type Safety
- Interfaces for database records (Report, Item, etc.)
- NewX types for creation (exclude auto-generated id/createdAt)
- Omit<> utility makes this DRY

## Debugging Tips

1. **Items not linking to report?** Check:
   - `lastInsertRowId` from addReport() result
   - `addItemToReport()` called with correct reportId
   - Quantity passed correctly

2. **Items not loading?** Check:
   - ItemProvider wraps the app in _layout.tsx
   - useItems() called within provider

3. **Database issues?** Check:
   - initDatabase() runs on app start
   - Migration logic handles old schema
   - Foreign key constraints (ON DELETE CASCADE)

4. **State not updating?** Check:
   - useFocusEffect() in index.tsx refreshes on screen focus
   - clearItems() called after report save
   - setSelectedCustomer(null) called to reset

## File Organization

```
/app
  ├── _layout.tsx           (Providers + root stack)
  ├── index.tsx             (Main report list)
  ├── reports/
  │   ├── create.tsx        (New report form)
  │   ├── select-items.tsx  (Item picker)
  │   └── select-customer.tsx
  ├── items/
  │   └── create.tsx        (New item form)
  └── customers/
      └── create.tsx

/database
  ├── db.ts                 (Schema + init)
  ├── reports.ts            (Report CRUD)
  ├── items.ts              (Item CRUD)
  ├── reportItems.ts        (Bridge table)
  └── customers.ts

/context
  ├── ItemContext.tsx       (Item selection state)
  ├── CustomerContext.tsx
  ├── LanguageContext.tsx
  └── ThemeContext.tsx

/utils
  └── pdf.ts                (PDF export)

/constants
  ├── theme.ts              (Colors + dark/light mode)
  └── translations.ts       (i18n)
```
