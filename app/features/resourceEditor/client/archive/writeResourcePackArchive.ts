import 'client-only';

import JSZip from 'jszip';

import type { IWriteResourcePackArchiveInput } from './contracts';

export async function writeResourcePackArchive({
	resourcePackJson,
	license,
	files,
	folders,
	referencedPaths,
}: IWriteResourcePackArchiveInput): Promise<Blob> {
	const zip = new JSZip();
	zip.file('ResourceEx.json', resourcePackJson);
	if (license) zip.file('LICENSE.md', license);

	const assetFolders = new Set<string>(['assets/']);
	folders.forEach((folder) => {
		if (folder.startsWith('assets/')) {
			assetFolders.add(folder.endsWith('/') ? folder : `${folder}/`);
		}
	});
	Array.from(assetFolders)
		.sort((a, b) => a.localeCompare(b, 'zh-CN'))
		.forEach((folder) => zip.folder(folder));

	for (const [path, blob] of files) {
		if (path.startsWith('assets/') || referencedPaths.has(path)) {
			zip.file(path, await blob.arrayBuffer());
		}
	}

	return zip.generateAsync({ type: 'blob' });
}
