export interface IWorkspaceFileBinding {
	blob: Blob;
	fileId: string;
}

interface IWorkspaceManifestUpdateInput {
	createFileId(): string;
	currentBindings: ReadonlyMap<string, IWorkspaceFileBinding>;
	files: ReadonlyMap<string, Blob>;
	retainedFileIds: ReadonlySet<string>;
}

interface IWorkspaceFileToAdd extends IWorkspaceFileBinding {}

interface IWorkspaceManifestUpdate {
	bindings: ReadonlyMap<string, IWorkspaceFileBinding>;
	fileIdsToRemove: readonly string[];
	filesToAdd: readonly IWorkspaceFileToAdd[];
	manifest: Readonly<Record<string, string>>;
}

export function planWorkspaceManifestUpdate(
	input: IWorkspaceManifestUpdateInput
): IWorkspaceManifestUpdate {
	const fileIdsByBlob = new Map<Blob, string>();
	const currentFileIds = new Set<string>();
	input.currentBindings.forEach(({ blob, fileId }) => {
		fileIdsByBlob.set(blob, fileId);
		currentFileIds.add(fileId);
	});

	const bindings = new Map<string, IWorkspaceFileBinding>();
	const filesToAdd: IWorkspaceFileToAdd[] = [];
	const manifest: Record<string, string> = {};

	input.files.forEach((blob, path) => {
		const currentBinding = input.currentBindings.get(path);
		const reusableFileId =
			currentBinding?.blob === blob
				? currentBinding.fileId
				: fileIdsByBlob.get(blob);
		const fileId = reusableFileId ?? input.createFileId();

		if (reusableFileId === undefined) {
			filesToAdd.push({ blob, fileId });
			fileIdsByBlob.set(blob, fileId);
		}
		bindings.set(path, { blob, fileId });
		manifest[path] = fileId;
	});

	const retainedFileIds = new Set(input.retainedFileIds);
	Object.values(manifest).forEach((fileId) => retainedFileIds.add(fileId));
	const fileIdsToRemove = Array.from(currentFileIds).filter(
		(fileId) => !retainedFileIds.has(fileId)
	);

	return { bindings, fileIdsToRemove, filesToAdd, manifest };
}
