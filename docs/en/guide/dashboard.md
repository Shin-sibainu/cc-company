# Dashboard

An optional tool to view your cc-company organization status in the browser.

## Installation & Usage

Run the following in a project that has a `.company/` folder:

```bash
npx cc-company-dashboard
```

A browser will automatically open at http://localhost:3939 showing your dashboard.

### Options

```bash
npx cc-company-dashboard --port 4000    # Change port
npx cc-company-dashboard --no-open      # Disable auto browser open
npx cc-company-dashboard --dir /path    # Specify directory to search for .company/
```

## Features

### Dashboard

See your organization overview at a glance.

- **TODO**: Today's incomplete / completed count
- **Inbox**: Number of unprocessed notes
- **Departments**: Active department count
- **Activity Heatmap**: 14-day GitHub-style heatmap of file edits
- **TODO Trend**: 7-day stacked chart of completed vs open TODOs
- **Today's TODO**: Task list by priority
- **Inbox Preview**: Latest inbox captures with body text
- **Recent Activity**: Recent file changes
- **Department Cards**: Status summary per department

### Keyboard Shortcuts

- `⌘ + K` / `Ctrl + K`: Open search
- `Esc`: Close mobile sidebar

### Explorer

Tree view of the entire `.company/` structure.

- Collapsible folders
- Subfolder hierarchy
- Click files to navigate to department detail
- Status badges

### Graph

Obsidian-style network visualization.

- `.company` at the center with departments and subfolders as nodes
- Drag nodes to rearrange freely
- Scroll to zoom in/out
- Drag background to pan camera
- Light/dark mode support

### Search

Full-text search across all files.

- Real-time search as you type
- Searches both filenames and content
- Highlighted match lines
- Click results to navigate to department detail

### Department Detail

Click a department name in the sidebar.

- Left: File list grouped by subfolder (collapsible)
- Right: Markdown preview / raw text toggle
- Frontmatter auto-stripped in preview mode

## Real-time Updates

The dashboard watches the `.company/` folder. Changes made through `/company` are automatically reflected in the dashboard.

## Light / Dark Mode

Toggle with the ☀/☽ button in the top bar. Your preference is saved in the browser.

## Works Without Dashboard

The dashboard is optional. The `/company` secretary works perfectly fine without it.
