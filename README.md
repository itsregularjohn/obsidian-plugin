# JP's Obsidian Plugin

A custom Obsidian plugin with utilities for enhanced file management and Zettelkasten workflows.

## Features

### Path Copying

Copy file paths to your clipboard for easy file access and reference in external applications.

#### Commands

- **Copy File Path (Full)** - Copies the complete absolute path of the active file to clipboard
- **Copy Relative Path** - Copies the vault-relative path of the active file to clipboard

#### Context Menu

Right-click on any file in the file explorer to access:
- **Copy path** - Copies the full absolute path
- **Copy relative path** - Copies the vault-relative path

#### Usage Examples

**Full Path Output:**
```
C:\Users\pedro\Desktop\Zettelkasten\My Note.md
```

**Relative Path Output:**
```
My Note.md
```
or
```
Folder/Subfolder/My Note.md
```

#### Use Cases

- **External Editing**: Quickly open files in external editors by copying the full path
- **File References**: Reference files in documentation or scripts using relative paths
- **Backup Scripts**: Use full paths for automated backup operations
- **Integration**: Share file locations with other applications or team members

### Date/Time Tracking

Track note creation dates and ages using Zettelkasten ID timestamps for better temporal organization.

#### Status Bar Display

- **Automatic Age Display**: Shows note age in the status bar when viewing notes with Zettelkasten IDs
- **Real-time Updates**: Updates automatically when switching between notes
- **Human-readable Format**: Displays age as "Age: X days ago", "Age: 2 months, 5 days ago", etc.

#### Commands

- **Current Note Date** - Shows a notice with the creation date distance of the active note

#### Zettelkasten ID Format

The plugin recognizes Zettelkasten IDs in the format `YYYYMMDDHHMM` at the beginning of filenames:
- `202507201930 My Important Note.md`
- `202501151420 Meeting Notes.md`

#### Usage Examples

**Status Bar Output:**
- `Age: Today` (for notes created today)
- `Age: 3 days ago`
- `Age: 1 month, 2 days ago`
- `Age: 2 years, 5 months ago`

**Notice Output (Current Note Date command):**
- `3 days ago`
- `about 1 month ago`
- `almost 2 years ago`

#### Use Cases

- **Temporal Context**: Quickly understand when notes were created
- **Archive Management**: Identify old notes that may need review or archival
- **Workflow Tracking**: Monitor note creation patterns and productivity
- **Research Timeline**: Track the chronological development of ideas and projects

### Zettelkasten ID Management

Generate and append timestamp-based unique identifiers to your notes for better organization and linking.

#### Commands

- **Append Zettelkasten ID** - Generates and appends a new Zettelkasten ID to the active note

#### Ribbon Icon

- **Message Square Plus Icon** - Quick access button in the left ribbon for appending IDs

#### ID Format

Zettelkasten IDs are generated in the format `YYYYMMDDHHMM`:
- `202507201930` (July 20, 2025 at 19:30)
- `202501151420` (January 15, 2025 at 14:20)
- `202412311159` (December 31, 2024 at 11:59)

#### Functionality

- **Timestamp-based**: IDs are generated using current date and time
- **Automatic Appending**: Adds the ID to the end of the active note content
- **Cursor Positioning**: Automatically moves cursor to the end after appending
- **Visual Feedback**: Shows a notice with the generated ID

#### Usage Examples

**Before:**
```
# My Research Note

This is some content about my research.
```

**After (using Append Zettelkasten ID):**
```
# My Research Note

This is some content about my research.

202507201930
```

**Notice Output:**
- `Zettelkasten ID appended: 202507201930`

#### Use Cases

- **Unique Identification**: Create unique identifiers for notes without changing filenames
- **Cross-referencing**: Use IDs for linking and referencing between notes
- **Chronological Organization**: Maintain temporal order in your note system
- **Backup References**: Have internal IDs that persist regardless of file location
- **Integration**: Use with other Zettelkasten tools and workflows

## Installation

1. Copy the plugin files to your vault's `.obsidian/plugins/jp-plugin/` directory
2. Enable the plugin in Obsidian Settings > Community Plugins
3. Install dependencies: `npm install` or `pnpm install`
4. Build the plugin: `npm run build` or `pnpm run build`
5. The commands will be available in the Command Palette (Ctrl/Cmd + P)
6. Context menu items will appear when right-clicking files
7. Status bar will show note ages automatically

## Development

This plugin is built using TypeScript and the Obsidian API. Each feature is modular and well-documented for easy maintenance and extension.

### Dependencies

- **date-fns**: For human-readable date formatting and calculations
- **Standard Obsidian API**: For core plugin functionality
