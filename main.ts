import { App, Notice, Plugin, PluginSettingTab, Setting, Menu, TAbstractFile } from 'obsidian';
import { join } from 'path';
import { formatDistance } from "date-fns";

interface JpPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: JpPluginSettings = {
	mySetting: 'default'
}

export default class JpPlugin extends Plugin {
	settings: JpPluginSettings;
	statusBarItem: HTMLElement;

	async onload() {
		await this.loadSettings();

		// Path copying commands
		this.addCommand({
			id: 'copy-file-path',
			name: 'Copy File Path (Full)',
			callback: () => this.copyFullPath(),
		});

		this.addCommand({
			id: 'copy-relative-path',
			name: 'Copy Relative Path',
			callback: () => this.copyRelativePath(),
		});

		// Date/Time tracking commands
		this.addCommand({
			id: "current-note-date",
			name: "Current Note Date",
			callback: () => this.currentNodeDate(),
		});

		// Zettelkasten ID management commands
		this.addCommand({
			id: "append-zettelkasten-id",
			name: "Append Zettelkasten ID",
			callback: () => this.appendZettelkastenID(),
		});

		// Add ribbon icon for quick access
		this.addRibbonIcon("message-square-plus", "Append Zettelkasten ID", () => this.appendZettelkastenID());

		// Register file open event for status bar updates
		this.registerEvent(this.app.workspace.on("file-open", this.updateInfo.bind(this)));
		this.addInfoToStatusBar();

		// Register file context menu
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				this.addFileContextMenuItems(menu, file);
			}),
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new JpSettingTab(this.app, this));
	}

	onunload() {
		// Cleanup if needed
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Copies the full absolute path of the active file to clipboard
	 */
	copyFullPath() {
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			new Notice("No active file");
			return;
		}

		const vaultPath = (this.app.vault.adapter as any).basePath || (this.app.vault.adapter as any).path;
		const fullPath = join(vaultPath, file.path);
		navigator.clipboard
			.writeText(fullPath)
			.then(() => {
				new Notice(`Copied full path: ${fullPath}`);
			})
			.catch(() => {
				new Notice("Failed to copy full path to clipboard");
			});
	}

	/**
	 * Copies the relative path (within vault) of the active file to clipboard
	 */
	copyRelativePath() {
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			new Notice("No active file");
			return;
		}

		const relativePath = file.path;
		navigator.clipboard
			.writeText(relativePath)
			.then(() => {
				new Notice(`Copied relative path: ${relativePath}`);
			})
			.catch(() => {
				new Notice("Failed to copy relative path to clipboard");
			});
	}

	/**
	 * Adds path copying options to the file context menu
	 */
	addFileContextMenuItems(menu: Menu, file: TAbstractFile) {
		if (!file) return;

		menu.addSeparator();

		menu.addItem((item) => {
			item.setTitle("Copy path")
				.setIcon("copy")
				.setSection("copy")
				.onClick(() => {
					const vaultPath = (this.app.vault.adapter as any).basePath || (this.app.vault.adapter as any).path;
					const fullPath = join(vaultPath, file.path);
					navigator.clipboard
						.writeText(fullPath)
						.then(() => {
							new Notice(`Path copied to the clipboard`);
						})
						.catch(() => {
							new Notice("Failed to copy path to the clipboard.");
						});
				});
		});

		menu.addItem((item) => {
			item.setTitle("Copy relative path")
				.setIcon("copy")
				.setSection("copy")
				.onClick(() => {
					const relativePath = file.path;
					navigator.clipboard
						.writeText(relativePath)
						.then(() => {
							new Notice(`Relative path copied to the clipboard`);
						})
						.catch(() => {
							new Notice("Failed to copy relative path to the clipboard");
						});
				});
		});
	}

	/**
	 * Converts a Zettelkasten ID to a Date object
	 */
	zettelkastenIdToDate(id: string): Date | null {
		if (!/^\d{12}$/.test(id)) {
			console.error("Invalid Zettelkasten ID. It must be a 12-digit string.");
			return null;
		}

		const year = parseInt(id.slice(0, 4), 10);
		const month = parseInt(id.slice(4, 6), 10) - 1; // Months are zero-indexed in JavaScript Date
		const day = parseInt(id.slice(6, 8), 10);
		const hour = parseInt(id.slice(8, 10), 10);
		const minute = parseInt(id.slice(10, 12), 10);

		return new Date(year, month, day, hour, minute);
	}

	/**
	 * Calculates the distance between two dates in a human-readable format
	 */
	getDateDistance(d1: Date, d2: Date): string {
		let years = d2.getFullYear() - d1.getFullYear();
		let months = d2.getMonth() - d1.getMonth();
		let days = d2.getDate() - d1.getDate();

		if (days < 0) {
			months--;
			const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
			days += prevMonth.getDate();
		}

		if (months < 0) {
			years--;
			months += 12;
		}

		const isNegative = d1 > d2;
		const parts = [];
		if (years !== 0) parts.push(`${Math.abs(years)} year(s)`);
		if (months !== 0) parts.push(`${Math.abs(months)} month(s)`);
		if (days !== 0) parts.push(`${Math.abs(days)} day(s)`);

		if (!parts.length) return "Age: Today";

		let result = parts.join(", ");
		if (isNegative) result = `Age: ${result} remaining`;

		return `Age: ${result} ago`;
	}

	/**
	 * Adds the status bar item for displaying note age
	 */
	addInfoToStatusBar() {
		this.statusBarItem = this.addStatusBarItem();
		this.statusBarItem.className = "extra-note-info";
		this.statusBarItem.textContent = "";

		this.updateInfo();
	}

	/**
	 * Updates the status bar with current note age information
	 */
	async updateInfo() {
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			this.statusBarItem.textContent = "";
			return;
		}

		const zettelRegex = /^(\d{12})(?: (.+))?$/;
		const match = file.basename.match(zettelRegex);

		if (!match) {
			this.statusBarItem.textContent = "";
			return;
		}

		const [, zettelkastenId] = match;
		const noteDate = this.zettelkastenIdToDate(zettelkastenId);
		if (!noteDate) {
			this.statusBarItem.textContent = "";
			return;
		}

		this.statusBarItem.textContent = this.getDateDistance(noteDate, new Date());
	}

	/**
	 * Shows the creation date of the current note as a notice
	 */
	currentNodeDate() {
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			new Notice("No active file");
			return;
		}

		const zettelRegex = /^(\d{12})(?: (.+))?$/;
		const match = file.basename.match(zettelRegex);

		if (!match) {
			new Notice("No valid Zettelkasten ID found in the file name.");
			return;
		}

		const [, zettelkastenId] = match;
		const noteDate = this.zettelkastenIdToDate(zettelkastenId);
		if (!noteDate) {
			new Notice("Invalid Zettelkasten ID format.");
			return;
		}

		new Notice(formatDistance(noteDate, new Date()) + " ago");
	}

	/**
	 * Generates a Zettelkasten ID based on current timestamp
	 */
	generateZettelkastenID(): string {
		const now = new Date();
		const year = now.getFullYear();
		const month = (now.getMonth() + 1).toString().padStart(2, "0");
		const day = now.getDate().toString().padStart(2, "0");
		const hour = now.getHours().toString().padStart(2, "0");
		const minute = now.getMinutes().toString().padStart(2, "0");

		return `${year}${month}${day}${hour}${minute}`;
	}

	/**
	 * Appends a new Zettelkasten ID to the active file
	 */
	async appendZettelkastenID() {
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			new Notice("No active file");
			return;
		}

		const fileContent = await this.app.vault.read(file);
		const zettelID = this.generateZettelkastenID();
		const updatedContent = `${fileContent}\n${zettelID}`;

		await this.app.vault.modify(file, updatedContent);

		// Move cursor to the end of the file if editor is available
		const editor = this.app.workspace.activeEditor;
		if (editor?.editor) {
			editor.editor?.setCursor(updatedContent.length);
		}

		new Notice(`Zettelkasten ID appended: ${zettelID}`);
	}
}

class JpSettingTab extends PluginSettingTab {
	plugin: JpPlugin;

	constructor(app: App, plugin: JpPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
