import { App, Notice, Plugin, PluginSettingTab, Setting, Menu, TAbstractFile } from 'obsidian';
import { join } from 'path';

interface JpPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: JpPluginSettings = {
	mySetting: 'default'
}

export default class JpPlugin extends Plugin {
	settings: JpPluginSettings;

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
