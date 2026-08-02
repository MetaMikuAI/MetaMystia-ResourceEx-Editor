import type { ResourceEx } from '@/domain/resourcePack/contracts/resourceEx';

export type TWorkspaceImportMatchStrength = 'exact' | 'metadata';

export type TWorkspaceLoadSource = 'checkpoint' | 'current';

export type TWorkspaceLifecycleStatus =
	| 'editing'
	| 'hydrating'
	| 'importing'
	| 'manager'
	| 'opening'
	| 'recovering';

export type TWorkspaceSaveStatus =
	| 'error'
	| 'idle'
	| 'memory-only'
	| 'saved'
	| 'saving';

export type TWorkspaceStorageMode = 'memory' | 'persistent';

export type TWorkspacePersistenceErrorCode =
	| 'blocked'
	| 'corrupt'
	| 'lease-conflict'
	| 'not-found'
	| 'open-failed'
	| 'quota-exceeded'
	| 'stale-revision'
	| 'transaction-failed';

export interface IWorkspaceDocument {
	folders: readonly string[];
	hasLicenseFile: boolean;
	license: string;
	resourcePack: ResourceEx;
}

export interface IWorkspaceSnapshot extends IWorkspaceDocument {
	files: ReadonlyMap<string, Blob>;
	revision: number;
}

export interface IWorkspaceSummary {
	checkpointRevision: number;
	createdAt: number;
	currentRevision: number;
	displayName: string;
	id: string;
	isCheckpointExported: boolean;
	isCurrentExported: boolean;
	isEditing: boolean;
	label?: string;
	resourcePackName?: string;
	updatedAt: number;
	version?: string;
}

export interface IWorkspaceLoadedSnapshot {
	snapshot: IWorkspaceSnapshot;
	workspace: IWorkspaceSummary;
}

export interface ICreateWorkspaceArchiveInput extends IWorkspaceDocument {
	displayName?: string;
	files: ReadonlyMap<string, Blob>;
	isCheckpointExported?: boolean;
	sourceArchiveHash?: string;
}

export interface IWorkspaceImportCandidate {
	matchStrength: TWorkspaceImportMatchStrength;
	workspace: IWorkspaceSummary;
}

export interface IWorkspaceLease {
	expiresAt: number;
	leaseId: string;
	ownerId: string;
}

export interface IWorkspaceLeaseResult {
	isAcquired: boolean;
	lease?: IWorkspaceLease;
	ownerId?: string;
}

export interface IWorkspaceOperationResult {
	error?: string;
	isLeaseConflict?: boolean;
	isSuccess: boolean;
	workspaceId?: string;
}

export interface IWorkspaceDuplicateIntent {
	candidates: readonly IWorkspaceImportCandidate[];
	displayName: string;
}

export interface IWorkspaceLeaseConflict {
	ownerId?: string;
	workspace: IWorkspaceSummary;
}

export type TWorkspaceImportResolution = 'cancel' | 'copy' | 'open' | 'replace';

export interface IResourceWorkspaceContext {
	activeWorkspace: IWorkspaceLoadedSnapshot | null;
	duplicateIntent: IWorkspaceDuplicateIntent | null;
	isReadOnly: boolean;
	leaseConflict: IWorkspaceLeaseConflict | null;
	lifecycleStatus: TWorkspaceLifecycleStatus;
	pendingExportWorkspaceId: string | null;
	recoveryWorkspace: IWorkspaceSummary | null;
	saveError: string | null;
	saveStatus: TWorkspaceSaveStatus;
	storageError: string | null;
	storageMode: TWorkspaceStorageMode;
	workspaces: readonly IWorkspaceSummary[];
	closeWorkspace(): Promise<IWorkspaceOperationResult>;
	clearPendingWorkspaceExport(): void;
	continueRecovery(): void;
	createWorkspace(): Promise<IWorkspaceOperationResult>;
	dismissLeaseConflict(): void;
	discardRecovery(): Promise<IWorkspaceOperationResult>;
	duplicateWorkspace(id: string): Promise<IWorkspaceOperationResult>;
	flushActiveSave(): Promise<IWorkspaceOperationResult>;
	importWorkspace(file: File): Promise<IWorkspaceOperationResult>;
	openLastWorkspace(): Promise<IWorkspaceOperationResult>;
	openWorkspaceReadOnly(id: string): Promise<IWorkspaceOperationResult>;
	openWorkspace(id: string): Promise<IWorkspaceOperationResult>;
	promoteActiveCheckpoint(
		revision: number
	): Promise<IWorkspaceOperationResult>;
	removeWorkspace(
		id: string,
		isForced?: boolean
	): Promise<IWorkspaceOperationResult>;
	requestWorkspaceExport(id: string): Promise<IWorkspaceOperationResult>;
	renameWorkspace(
		id: string,
		displayName: string
	): Promise<IWorkspaceOperationResult>;
	resolveImport(
		resolution: TWorkspaceImportResolution,
		workspaceId?: string
	): Promise<IWorkspaceOperationResult>;
	retryActiveSave(): void;
	retryPersistentStorage(): Promise<IWorkspaceOperationResult>;
	saveActiveSnapshot(snapshot: IWorkspaceSnapshot): void;
	takeOverWorkspace(): Promise<IWorkspaceOperationResult>;
}

export interface IWorkspaceRepository {
	acquireLease(
		id: string,
		ownerId: string,
		leaseId: string,
		expiresAt: number,
		isTakeover?: boolean
	): Promise<IWorkspaceLeaseResult>;
	createBlank(): Promise<IWorkspaceLoadedSnapshot>;
	createFromArchive(
		input: ICreateWorkspaceArchiveInput
	): Promise<IWorkspaceLoadedSnapshot>;
	dispose(): void;
	duplicate(id: string): Promise<IWorkspaceLoadedSnapshot>;
	findImportCandidates(
		sourceArchiveHash: string | undefined,
		label: string | undefined,
		version: string | undefined
	): Promise<readonly IWorkspaceImportCandidate[]>;
	list(): Promise<readonly IWorkspaceSummary[]>;
	load(
		id: string,
		source: TWorkspaceLoadSource
	): Promise<IWorkspaceLoadedSnapshot>;
	readSourceArchiveHash(id: string): Promise<string | undefined>;
	promoteCheckpoint(
		id: string,
		leaseId: string,
		revision: number
	): Promise<void>;
	releaseLease(id: string, leaseId: string): Promise<void>;
	remove(id: string, leaseId?: string, isForced?: boolean): Promise<void>;
	rename(id: string, displayName: string, leaseId?: string): Promise<void>;
	renewLease(
		id: string,
		leaseId: string,
		expiresAt: number
	): Promise<IWorkspaceLeaseResult>;
	replaceFromArchive(
		id: string,
		leaseId: string,
		input: ICreateWorkspaceArchiveInput
	): Promise<IWorkspaceLoadedSnapshot>;
	restoreCheckpoint(
		id: string,
		leaseId: string
	): Promise<IWorkspaceLoadedSnapshot>;
	saveCurrent(
		id: string,
		leaseId: string,
		snapshot: IWorkspaceSnapshot
	): Promise<void>;
}
