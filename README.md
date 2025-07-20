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

## Installation

1. Copy the plugin files to your vault's `.obsidian/plugins/jp-plugin/` directory
2. Enable the plugin in Obsidian Settings > Community Plugins
3. The commands will be available in the Command Palette (Ctrl/Cmd + P)
4. Context menu items will appear when right-clicking files

## Development

This plugin is built using TypeScript and the Obsidian API. Each feature is modular and well-documented for easy maintenance and extension.
