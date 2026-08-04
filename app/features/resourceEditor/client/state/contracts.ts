import type {
	LikeTag,
	SpawnConfig,
} from '@/domain/resourcePack/contracts/character';
import type { ResourceEx } from '@/domain/resourcePack/contracts/resourceEx';

import type {
	IAssetMutationResult,
	IAssetPathOperation,
	IAssetState,
} from '@/features/resourceEditor/client/assets/contracts';
import type {
	TWorkspaceSaveStatus,
	TWorkspaceStorageMode,
} from '@/features/resourceEditor/client/workspaces/contracts';
import { type TGuestLikeTagDraftField } from '@/features/resourceEditor/client/workspaces/workspaceEditorState';

export type TResourceExportStatus = 'exported' | 'modified' | 'unexported';

export interface IResourceEditorOperationResult {
	isSuccess: boolean;
	error?: string;
}

export interface IResourceEditorExportResult extends IResourceEditorOperationResult {
	filename?: string;
	warning?: string;
}

export interface IResourceEditorContext {
	activeWorkspaceId: string | null;
	assets: IAssetState;
	exportStatus: TResourceExportStatus;
	isExporting: boolean;
	isLocalSavePending: boolean;
	license: string;
	localSaveError: string | null;
	localSaveStatus: TWorkspaceSaveStatus;
	resourcePack: ResourceEx;
	revision: number;
	storageMode: TWorkspaceStorageMode;
	clearGuestDrafts(characterId: number): void;
	getGuestLikeTagDraft(
		characterId: number,
		field: TGuestLikeTagDraftField,
		tagId: number
	): LikeTag | undefined;
	getGuestSpawnDraft(
		characterId: number,
		izakayaId: number
	): SpawnConfig | undefined;
	replaceGuestLikeTagDraft(
		characterId: number,
		field: TGuestLikeTagDraftField,
		tagId: number,
		tag: LikeTag | undefined
	): void;
	replaceGuestSpawnDraft(
		characterId: number,
		izakayaId: number,
		spawn: SpawnConfig | undefined
	): void;
	replaceGuestDraftCharacterId(
		previousCharacterId: number,
		nextCharacterId: number
	): void;
	flushLocalSave(): Promise<IResourceEditorOperationResult>;
	retryLocalSave(): void;
	updateResourcePack(updater: (current: ResourceEx) => ResourceEx): void;
	replaceLicense(license: string): void;
	exportArchive(
		expectedRevision: number,
		filename?: string
	): Promise<IResourceEditorExportResult>;
	updateAsset(path: string, blob: Blob): IAssetMutationResult;
	updateAssets(updates: ReadonlyMap<string, Blob>): IAssetMutationResult;
	removeAsset(path: string): void;
	removeAssets(paths: readonly string[]): void;
	createAssetFolder(path: string): IAssetMutationResult;
	removeAssetFolders(paths: readonly string[]): void;
	moveAssets(operations: readonly IAssetPathOperation[]): void;
	copyAssets(operations: readonly IAssetPathOperation[]): void;
	getAssetUrl(path: string | undefined): string | undefined;
	isAssetGenerationCurrent(generation: number): boolean;
}
