import 'client-only';

import { saveAs } from 'file-saver';

import type { ResourceEx } from '@/domain/resourcePack/contracts/resourceEx';

export function createResourcePackArchiveFilename(resourcePack: ResourceEx) {
	const label = resourcePack.packInfo.label || 'ResourceEx';
	const version = resourcePack.packInfo.version || '1.0.0';
	return `${label}-v${version}.zip`;
}

export function downloadResourcePack(
	archive: Blob,
	resourcePack: ResourceEx,
	filename?: string
) {
	const resolvedFilename =
		filename || createResourcePackArchiveFilename(resourcePack);
	saveAs(archive, resolvedFilename);
	return resolvedFilename;
}
