import 'client-only';

import JSZip from 'jszip';

import { normalizeResourcePack } from '@/domain/resourcePack/normalization';

import type {
	IReadResourcePackArchiveResult,
	TResourcePackArchiveInput,
} from './contracts';

export class ResourcePackArchiveError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'ResourcePackArchiveError';
	}
}

function addAssetParentFolders(path: string, folders: Set<string>) {
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
		throw new ResourcePackArchiveError('无法读取 ZIP 压缩包', {
			cause: error,
		});
	}

	const resourcePackEntry = zip.file('ResourceEx.json');
	if (!resourcePackEntry) {
		throw new ResourcePackArchiveError('压缩包中未找到 ResourceEx.json');
	}

	let resourcePack: IReadResourcePackArchiveResult['resourcePack'];
	try {
		const resourcePackText = await resourcePackEntry.async('string');
		resourcePack = normalizeResourcePack(JSON.parse(resourcePackText));
	} catch (error) {
		throw new ResourcePackArchiveError(
			`ResourceEx.json 无效: ${error instanceof Error ? error.message : String(error)}`,
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
			entry.name.startsWith('__MACOSX/')
		) {
			continue;
		}

		if (entry.dir) {
			if (entry.name.startsWith('assets/')) folders.add(entry.name);
			continue;
		}

		const blob = await entry.async('blob');
		files.set(entry.name, blob);
		if (entry.name.startsWith('assets/')) {
			addAssetParentFolders(entry.name, folders);
		}
	}

	return {
		resourcePack,
		license,
		files,
		folders: Array.from(folders).sort((a, b) =>
			a.localeCompare(b, 'zh-CN')
		),
	};
}
