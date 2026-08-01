import {
	isValidPackLabel,
	KNOWN_DEPENDENCIES,
	PACK_LABEL_ALLOWED_DESCRIPTION,
} from '@/domain/resourcePack/constants';
import type { ResourceEx } from '@/domain/resourcePack/contracts/resourceEx';
import { createResourcePackExportView } from '@/domain/resourcePack/serialization';

import type { IWriteResourcePackArchiveInput } from '@/features/resourceEditor/client/archive/contracts';
import type { IAssetSnapshot } from '@/features/resourceEditor/client/assets/contracts';

import type { IResourceEditorExportResult } from './contracts';

export interface IResourcePackExportSnapshot extends IAssetSnapshot {
	license: string;
	resourcePack: ResourceEx;
	revision: number;
}

interface IRunResourcePackExportInput {
	expectedRevision: number;
	filename?: string;
	readCurrentRevision(): number;
	readSnapshot(expectedRevision: number): IResourcePackExportSnapshot | null;
	writeArchive(input: IWriteResourcePackArchiveInput): Promise<Blob>;
	downloadArchive(
		archive: Blob,
		resourcePack: ResourceEx,
		filename?: string
	): string;
	clearDirtyIfRevision(expectedRevision: number): boolean;
}

const REVISION_CHANGED_ERROR = '资源包内容已变化，请重新验证后导出';

function getLabelExportError(resourcePack: ResourceEx) {
	const label = resourcePack.packInfo.label;
	if (!label) return null;
	if (KNOWN_DEPENDENCIES.some((dependency) => dependency === label)) {
		return `资源包标识符（Label）不能使用保留关键字“${label}”`;
	}
	if (!isValidPackLabel(label)) {
		return `资源包标识符（Label）“${label}”含非法字符。${PACK_LABEL_ALLOWED_DESCRIPTION}。`;
	}
	return null;
}

function describeError(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}

export async function runResourcePackExport({
	clearDirtyIfRevision,
	downloadArchive,
	expectedRevision,
	filename,
	readCurrentRevision,
	readSnapshot,
	writeArchive,
}: IRunResourcePackExportInput): Promise<IResourceEditorExportResult> {
	if (readCurrentRevision() !== expectedRevision) {
		return { isSuccess: false, error: REVISION_CHANGED_ERROR };
	}

	const snapshot = readSnapshot(expectedRevision);
	if (
		!snapshot ||
		snapshot.revision !== expectedRevision ||
		readCurrentRevision() !== expectedRevision
	) {
		return { isSuccess: false, error: REVISION_CHANGED_ERROR };
	}

	const labelError = getLabelExportError(snapshot.resourcePack);
	if (labelError) return { isSuccess: false, error: labelError };

	try {
		const exportView = createResourcePackExportView(snapshot.resourcePack);
		const archive = await writeArchive({
			files: snapshot.files,
			folders: snapshot.folders,
			license: snapshot.license,
			referencedPaths: exportView.referencedPaths,
			resourcePackJson: exportView.resourcePackJson,
		});
		const resolvedFilename = downloadArchive(
			archive,
			exportView.resourcePack,
			filename
		);
		clearDirtyIfRevision(expectedRevision);
		return { isSuccess: true, filename: resolvedFilename };
	} catch (error) {
		return { isSuccess: false, error: describeError(error) };
	}
}
