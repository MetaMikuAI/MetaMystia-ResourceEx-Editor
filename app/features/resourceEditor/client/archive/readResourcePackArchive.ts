import 'client-only';

import JSZip from 'jszip';

import { normalizeResourcePack } from '@/domain/resourcePack/normalization';

import type {
	IReadResourcePackArchiveResult,
	TResourcePackArchiveInput,
} from './contracts';

const DISCARDABLE_ARCHIVE_FILE_NAMES = new Set([
	'.ds_store',
	'desktop.ini',
	'ehthumbs.db',
	'ehthumbs_vista.db',
	'thumb.db',
	'thumbs.db',
]);

function shouldDiscardArchiveEntry(path: string, isDirectory: boolean) {
	const normalizedPath = path.replace(/\/+$/, '');
	const filename = normalizedPath.slice(normalizedPath.lastIndexOf('/') + 1);

	if (DISCARDABLE_ARCHIVE_FILE_NAMES.has(filename.toLowerCase())) {
		return true;
	}

	const isMacOsMetadataPath =
		normalizedPath === '__MACOSX' || normalizedPath.startsWith('__MACOSX/');

	return isMacOsMetadataPath && (isDirectory || filename.startsWith('._'));
}

export class ResourcePackArchiveError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'ResourcePackArchiveError';
	}
}

function addParentFolders(path: string, folders: Set<string>) {
	const parts = path.split('/');
	for (let index = 1; index < parts.length; index++) {
		folders.add(`${parts.slice(0, index).join('/')}/`);
	}
}

export async function readResourcePackArchive(
	archiveInput: TResourcePackArchiveInput
): Promise<IReadResourcePackArchiveResult> {
	let zip: JSZip;
	try {
		zip = await JSZip.loadAsync(archiveInput);
	} catch (error) {
		throw new ResourcePackArchiveError('无法读取ZIP压缩包', {
			cause: error,
		});
	}

	const resourcePackEntry = zip.file('ResourceEx.json');
	if (!resourcePackEntry) {
		throw new ResourcePackArchiveError('压缩包中未找到ResourceEx.json');
	}

	let resourcePack: IReadResourcePackArchiveResult['resourcePack'];
	try {
		const resourcePackText = await resourcePackEntry.async('string');
		resourcePack = normalizeResourcePack(JSON.parse(resourcePackText));
	} catch (error) {
		throw new ResourcePackArchiveError(
			`ResourceEx.json无效：${error instanceof Error ? error.message : String(error)}`,
			{ cause: error }
		);
	}

	const licenseEntry = zip.file('LICENSE.md');
	const license = licenseEntry ? await licenseEntry.async('string') : '';
	const files = new Map<string, Blob>();
	const folders = new Set<string>(['assets/']);

	for (const entry of Object.values(zip.files)) {
		if (
			entry.name === 'ResourceEx.json' ||
			entry.name === 'LICENSE.md' ||
			shouldDiscardArchiveEntry(entry.name, entry.dir)
		) {
			continue;
		}

		if (entry.dir) {
			addParentFolders(entry.name, folders);
			folders.add(entry.name);
			continue;
		}

		const blob = await entry.async('blob');
		files.set(entry.name, blob);
		addParentFolders(entry.name, folders);
	}

	for (const path of files.keys()) {
		if (folders.has(`${path}/`)) {
			throw new ResourcePackArchiveError(
				`压缩包中的路径同时被用作文件和目录：${path}`
			);
		}
	}
	for (const reservedPath of ['ResourceEx.json', 'LICENSE.md']) {
		if (folders.has(`${reservedPath}/`)) {
			throw new ResourcePackArchiveError(
				`压缩包中的保留文件路径被用作目录：${reservedPath}`
			);
		}
	}

	return {
		files,
		folders: Array.from(folders).sort((a, b) =>
			a.localeCompare(b, 'zh-CN')
		),
		hasLicenseFile: licenseEntry !== null,
		license,
		resourcePack,
	};
}
