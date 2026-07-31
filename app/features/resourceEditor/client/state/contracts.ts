import type { ResourceEx } from '@/domain/resourcePack/contracts/resourceEx';

import type { IAssetPathOperation, IAssetState } from '../assets/contracts';

export interface IResourceEditorOperationResult {
	isSuccess: boolean;
	error?: string;
}

export interface IResourceEditorExportResult extends IResourceEditorOperationResult {
	filename?: string;
}

export interface IResourceEditorContext {
	resourcePack: ResourceEx;
	license: string;
	isDirty: boolean;
	isExporting: boolean;
	isImporting: boolean;
	revision: number;
	assets: IAssetState;
	updateResourcePack(updater: (current: ResourceEx) => ResourceEx): void;
	replaceLicense(license: string): void;
	importArchive(file: File): Promise<IResourceEditorOperationResult>;
	createBlankResourcePack(): void;
	exportArchive(
		expectedRevision: number,
		filename?: string
	): Promise<IResourceEditorExportResult>;
	updateAsset(path: string, blob: Blob): void;
	removeAsset(path: string): void;
	createAssetFolder(path: string): void;
	removeAssetFolders(paths: readonly string[]): void;
	moveAssets(operations: readonly IAssetPathOperation[]): void;
	copyAssets(operations: readonly IAssetPathOperation[]): void;
	getAssetUrl(path: string | undefined): string | undefined;
}
