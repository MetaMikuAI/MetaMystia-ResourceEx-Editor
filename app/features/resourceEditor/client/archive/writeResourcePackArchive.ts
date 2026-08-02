import 'client-only';

import JSZip from 'jszip';

import type { IWriteResourcePackArchiveInput } from './contracts';

export async function writeResourcePackArchive({
	resourcePackJson,
	hasLicenseFile,
	license,
	files,
	folders,
}: IWriteResourcePackArchiveInput): Promise<Blob> {
	const zip = new JSZip();
	zip.file('ResourceEx.json', resourcePackJson);
	if (hasLicenseFile) zip.file('LICENSE.md', license);

	const archiveFolders = new Set<string>(['assets/']);
	folders.forEach((folder) => {
		archiveFolders.add(folder.endsWith('/') ? folder : `${folder}/`);
	});
	Array.from(archiveFolders)
		.sort((a, b) => a.localeCompare(b, 'zh-CN'))
		.forEach((folder) => zip.folder(folder));

	for (const [path, blob] of files) {
		zip.file(path, await blob.arrayBuffer());
	}

	return zip.generateAsync({ type: 'blob' });
}
