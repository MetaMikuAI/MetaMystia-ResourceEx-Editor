import type { IAssetPathOperation } from './contracts';

export type AssetEntryKind = 'folder' | 'image' | 'audio' | 'file';

export interface AssetEntry {
	kind: AssetEntryKind;
	name: string;
	path: string;
	url?: string;
}

export interface FolderStats {
	files: number;
	folders: number;
}

const INVALID_PATH_CHARS = /[:*?"<>|\x00-\x1f]/;

export function normalizeAssetFolderPath(
	value: string,
	root = 'assets/'
): string | null {
	const normalizedRoot = root.endsWith('/') ? root : `${root}/`;
	const trimmed = value.trim().replace(/\\/g, '/').replace(/^\/+/, '');
	const collapsed = trimmed.replace(/\/+/g, '/').replace(/\/+$/, '');
	const folder = collapsed ? `${collapsed}/` : normalizedRoot;

	if (!folder.startsWith(normalizedRoot)) return null;
	if (folder.includes('..')) return null;

	const segments = folder.split('/').filter(Boolean);
	if (segments.length === 0) return null;
	for (const segment of segments) {
		if (segment === '.' || segment === '..') return null;
		if (INVALID_PATH_CHARS.test(segment)) return null;
	}

	return folder;
}

export function normalizeAssetFilename(name: string): string {
	return name.trim().replace(/[\\/:*?"<>|\x00-\x1f]/g, '_') || 'untitled';
}

export function joinAssetPath(folder: string, name: string): string {
	const normalizedFolder = folder.endsWith('/') ? folder : `${folder}/`;
	return `${normalizedFolder}${normalizeAssetFilename(name)}`;
}

export function getAssetName(path: string): string {
	const trimmed = path.endsWith('/') ? path.slice(0, -1) : path;
	return trimmed.slice(trimmed.lastIndexOf('/') + 1);
}

export function getAssetParentFolder(path: string, root = 'assets/'): string {
	const normalizedRoot = root.endsWith('/') ? root : `${root}/`;
	const trimmed = path.endsWith('/') ? path.slice(0, -1) : path;
	const index = trimmed.lastIndexOf('/');
	if (index < 0) return normalizedRoot;
	const parent = `${trimmed.slice(0, index)}/`;
	return parent.startsWith(normalizedRoot) ? parent : normalizedRoot;
}

export function getAssetKind(path: string, url?: string): AssetEntryKind {
	if (path.endsWith('/')) return 'folder';
	const lower = path.toLowerCase();
	if (
		lower.endsWith('.png') ||
		lower.endsWith('.jpg') ||
		lower.endsWith('.jpeg') ||
		lower.endsWith('.gif') ||
		lower.endsWith('.webp') ||
		lower.endsWith('.bmp') ||
		lower.endsWith('.svg')
	) {
		return 'image';
	}
	if (
		lower.endsWith('.wav') ||
		lower.endsWith('.mp3') ||
		lower.endsWith('.ogg') ||
		lower.endsWith('.flac')
	) {
		return 'audio';
	}
	if (url?.startsWith('blob:')) return 'file';
	return 'file';
}

export function listAssetFolder(
	assetUrls: Record<string, string>,
	currentFolder: string,
	root = 'assets/',
	virtualFolders: Set<string> = new Set()
): AssetEntry[] {
	const normalizedRoot = root.endsWith('/') ? root : `${root}/`;
	const folder = currentFolder.endsWith('/')
		? currentFolder
		: `${currentFolder}/`;
	const childFolders = new Set<string>();
	const files: AssetEntry[] = [];

	for (const path of Object.keys(assetUrls)) {
		if (!path.startsWith(normalizedRoot)) continue;
		if (!path.startsWith(folder)) continue;
		const rest = path.slice(folder.length);
		if (!rest) continue;
		const slashIndex = rest.indexOf('/');
		if (slashIndex >= 0) {
			childFolders.add(`${folder}${rest.slice(0, slashIndex + 1)}`);
		} else {
			const url = assetUrls[path];
			files.push({
				kind: getAssetKind(path, url),
				name: rest,
				path,
				...(url ? { url } : {}),
			});
		}
	}

	for (const path of virtualFolders) {
		if (!path.startsWith(normalizedRoot)) continue;
		if (!path.startsWith(folder) || path === folder) continue;
		const rest = path.slice(folder.length);
		const slashIndex = rest.indexOf('/');
		if (slashIndex >= 0) {
			childFolders.add(`${folder}${rest.slice(0, slashIndex + 1)}`);
		}
	}

	const folders: AssetEntry[] = Array.from(childFolders).map((path) => ({
		kind: 'folder',
		name: getAssetName(path),
		path,
	}));

	return [...folders, ...files].sort((a, b) => {
		if (a.kind === 'folder' && b.kind !== 'folder') return -1;
		if (a.kind !== 'folder' && b.kind === 'folder') return 1;
		return a.name.localeCompare(b.name, 'zh-CN');
	});
}

export function collectAssetFolders(
	assetPaths: string[],
	root = 'assets/'
): string[] {
	const normalizedRoot = root.endsWith('/') ? root : `${root}/`;
	const folders = new Set<string>([normalizedRoot]);

	for (const path of assetPaths) {
		if (!path.startsWith(normalizedRoot)) continue;
		const parts = path.split('/');
		for (let i = 1; i < parts.length; i++) {
			const folder = `${parts.slice(0, i).join('/')}/`;
			if (folder.startsWith(normalizedRoot)) folders.add(folder);
		}
	}

	return Array.from(folders).sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

export function getFolderStats(
	assetUrls: Record<string, string>,
	folder: string,
	root = 'assets/'
): FolderStats {
	const entries = listAssetFolder(assetUrls, folder, root);
	return {
		files: entries.filter((entry) => entry.kind !== 'folder').length,
		folders: entries.filter((entry) => entry.kind === 'folder').length,
	};
}

export function expandAssetSelection(
	selectedPaths: Set<string>,
	assetPaths: string[]
): string[] {
	const expanded = new Set<string>();

	for (const selected of selectedPaths) {
		if (selected.endsWith('/')) {
			for (const path of assetPaths) {
				if (path.startsWith(selected)) expanded.add(path);
			}
		} else {
			expanded.add(selected);
		}
	}

	return Array.from(expanded).sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

export function compactAssetSelection(selectedPaths: Set<string>): string[] {
	const ordered = Array.from(selectedPaths).sort((a, b) => {
		if (a.length !== b.length) return a.length - b.length;
		return a.localeCompare(b, 'zh-CN');
	});
	const compact: string[] = [];

	for (const path of ordered) {
		const isCovered = compact.some((parent) => {
			if (!parent.endsWith('/')) return false;
			return path !== parent && path.startsWith(parent);
		});
		if (!isCovered) compact.push(path);
	}

	return compact;
}

export function buildAssetPathOperations(
	selectedPaths: Set<string>,
	assetPaths: string[],
	targetFolder: string,
	mode: 'copy' | 'move'
): IAssetPathOperation[] | null {
	const roots = compactAssetSelection(selectedPaths);
	const target = targetFolder.endsWith('/')
		? targetFolder
		: `${targetFolder}/`;
	const operations: IAssetPathOperation[] = [];

	for (const root of roots) {
		if (root.endsWith('/')) {
			if (mode === 'move' && target.startsWith(root)) return null;
			const folderName = getAssetName(root);
			for (const path of assetPaths) {
				if (!path.startsWith(root)) continue;
				operations.push({
					from: path,
					to: `${target}${folderName}/${path.slice(root.length)}`,
				});
			}
		} else {
			operations.push({
				from: root,
				to: `${target}${getAssetName(root)}`,
			});
		}
	}

	const targets = new Set<string>();
	for (const operation of operations) {
		if (targets.has(operation.to)) return null;
		targets.add(operation.to);
	}

	return operations.filter((operation) => operation.from !== operation.to);
}
