'use client';

import {
	type PropsWithChildren,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { createBlankResourcePack } from '@/domain/resourcePack/createBlankResourcePack';

import { readResourcePackArchive } from '@/features/resourceEditor/client/archive/readResourcePackArchive';

import { safeStorage } from '@/infrastructure/browser/storage/safeStorage';

import type {
	ICreateWorkspaceArchiveInput,
	IWorkspaceDuplicateIntent,
	IWorkspaceImportCandidate,
	IWorkspaceLeaseConflict,
	IWorkspaceLoadedSnapshot,
	IWorkspaceOperationResult,
	IWorkspaceRepository,
	IWorkspaceSnapshot,
	IWorkspaceSummary,
	TWorkspaceImportResolution,
	TWorkspaceLifecycleStatus,
	TWorkspaceSaveStatus,
	TWorkspaceStorageMode,
} from './contracts';
import { createMemoryWorkspaceRepository } from './memoryWorkspaceRepository';
import { ResourceWorkspaceContext } from './useResourceWorkspaces';
import {
	createWorkspaceCatalogSync,
	type IWorkspaceCatalogSync,
	WORKSPACE_CATALOG_CHANNEL_NAME,
} from './workspaceCatalogSync';
import { WorkspacePersistenceError } from './workspaceDatabase';
import { calculateBlobSha256 } from './workspaceHash';
import {
	claimWorkspaceOwnerId,
	createWorkspaceLeaseController,
	type IWorkspaceLeaseController,
} from './workspaceLease';
import { migrateTemporaryWorkspaces } from './workspaceMigration';
import { createWorkspaceRepository } from './workspaceRepository';
import {
	createWorkspaceSaveQueue,
	type IWorkspaceSaveQueue,
} from './workspaceSaveQueue';

const LAST_ACTIVE_WORKSPACE_SESSION_KEY = 'resourceEditorLastWorkspaceIdV2';
const LEGACY_LAST_ACTIVE_WORKSPACE_STORAGE_KEY =
	'resourceEditorLastWorkspaceId';
const WORKSPACE_AUTOSAVE_DELAY_MS = 400;
const WORKSPACE_OWNER_CHANNEL_NAME = 'resourceEditorWorkspaceOwners';
const WORKSPACE_OWNER_CLAIM_DELAY_MS = 50;
const WORKSPACE_RECOVERY_COPY_SUFFIX = '（恢复副本）';

interface IPendingImport {
	candidates: readonly IWorkspaceImportCandidate[];
	input: ICreateWorkspaceArchiveInput;
}

function describeError(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}

function operationError(error: unknown): IWorkspaceOperationResult {
	return { error: describeError(error), isSuccess: false };
}

function shouldUseMemoryFallback(error: unknown) {
	if (error instanceof DOMException) return true;
	return (
		error instanceof WorkspacePersistenceError &&
		error.code !== 'lease-conflict' &&
		error.code !== 'stale-revision'
	);
}

function isLeaseConflictError(error: unknown) {
	return (
		(error instanceof WorkspacePersistenceError &&
			error.code === 'lease-conflict') ||
		(error instanceof Error && error.message.includes('正在其他页面中编辑'))
	);
}

function snapshotToArchiveInput(
	snapshot: IWorkspaceSnapshot,
	displayName: string,
	isCheckpointExported: boolean,
	sourceArchiveHash: string | undefined
): ICreateWorkspaceArchiveInput {
	return {
		displayName,
		files: snapshot.files,
		folders: snapshot.folders,
		hasLicenseFile: snapshot.hasLicenseFile,
		isCheckpointExported,
		license: snapshot.license,
		resourcePack: snapshot.resourcePack,
		...(sourceArchiveHash === undefined ? {} : { sourceArchiveHash }),
	};
}

async function loadCurrentAndCheckpoint(
	repository: IWorkspaceRepository,
	workspaceId: string
) {
	const current = await repository.load(workspaceId, 'current');
	const checkpointSnapshot =
		current.workspace.currentRevision ===
		current.workspace.checkpointRevision
			? current.snapshot
			: (await repository.load(workspaceId, 'checkpoint')).snapshot;
	return { checkpointSnapshot, current };
}

export function ResourceWorkspaceProvider({ children }: PropsWithChildren) {
	const [memoryRepository] = useState<IWorkspaceRepository>(() =>
		createMemoryWorkspaceRepository({
			createBlankResourcePack,
			createId: () => crypto.randomUUID(),
			now: () => Date.now(),
		})
	);
	const [activeWorkspace, setActiveWorkspace] =
		useState<IWorkspaceLoadedSnapshot | null>(null);
	const [duplicateIntent, setDuplicateIntent] =
		useState<IWorkspaceDuplicateIntent | null>(null);
	const [leaseConflict, setLeaseConflict] =
		useState<IWorkspaceLeaseConflict | null>(null);
	const [isReadOnly, setIsReadOnly] = useState(false);
	const [lifecycleStatus, setLifecycleStatus] =
		useState<TWorkspaceLifecycleStatus>('hydrating');
	const [pendingExportWorkspaceId, setPendingExportWorkspaceId] = useState<
		string | null
	>(null);
	const [recoveryWorkspace, setRecoveryWorkspace] =
		useState<IWorkspaceSummary | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [saveStatus, setSaveStatus] = useState<TWorkspaceSaveStatus>('idle');
	const [storageError, setStorageError] = useState<string | null>(null);
	const [storageMode, setStorageMode] =
		useState<TWorkspaceStorageMode>('memory');
	const [workspaces, setWorkspaces] = useState<readonly IWorkspaceSummary[]>(
		[]
	);
	const activeLeaseIdRef = useRef<string | null>(null);
	const activeCheckpointIsExportedRef = useRef(false);
	const activeCheckpointRevisionRef = useRef<number | null>(null);
	const activeCheckpointSnapshotRef = useRef<IWorkspaceSnapshot | null>(null);
	const activeWorkspaceRef = useRef<IWorkspaceLoadedSnapshot | null>(null);
	const autosaveTimeoutRef = useRef<number | null>(null);
	const fallbackPromiseRef = useRef<Promise<void> | null>(null);
	const fallbackToMemoryRef = useRef<
		((error: unknown) => Promise<void>) | null
	>(null);
	const initializationGenerationRef = useRef(0);
	const lastActiveWorkspaceIdRef = useRef<string | null>(null);
	const leaseControllerRef = useRef<IWorkspaceLeaseController | null>(null);
	const latestSnapshotRef = useRef<IWorkspaceSnapshot | null>(null);
	const isReadOnlyRef = useRef(false);
	const pendingImportRef = useRef<IPendingImport | null>(null);
	const pendingExportWorkspaceIdRef = useRef<string | null>(null);
	const pendingRecoveryRef = useRef<IWorkspaceLoadedSnapshot | null>(null);
	const ownerClaimDisposeRef = useRef<(() => void) | null>(null);
	const publishLoadedWorkspaceRef = useRef<
		| ((
				loaded: IWorkspaceLoadedSnapshot,
				leaseId: string,
				checkpointSnapshot: IWorkspaceSnapshot
		  ) => void)
		| null
	>(null);
	const repositoryRef = useRef<IWorkspaceRepository>(memoryRepository);
	const saveQueueRef = useRef<IWorkspaceSaveQueue | null>(null);
	const storageModeRef = useRef<TWorkspaceStorageMode>('memory');
	const workspaceCatalogSyncRef = useRef<IWorkspaceCatalogSync | null>(null);
	const workspaceOwnerIdRef = useRef<string | null>(null);

	const clearAutosaveTimeout = useCallback(() => {
		if (autosaveTimeoutRef.current === null) return;
		window.clearTimeout(autosaveTimeoutRef.current);
		autosaveTimeoutRef.current = null;
	}, []);

	const enqueueLatestSnapshot = useCallback(() => {
		clearAutosaveTimeout();
		const snapshot = latestSnapshotRef.current;
		if (snapshot) saveQueueRef.current?.enqueue(snapshot);
	}, [clearAutosaveTimeout]);

	const flushCurrentWorkspace = useCallback(async () => {
		enqueueLatestSnapshot();
		await saveQueueRef.current?.flush();
	}, [enqueueLatestSnapshot]);

	const restoreCurrentLifecycle = useCallback(() => {
		setLifecycleStatus(
			pendingRecoveryRef.current
				? 'recovering'
				: activeWorkspaceRef.current
					? 'editing'
					: 'manager'
		);
	}, []);

	const clearPendingWorkspaceExport = useCallback(() => {
		pendingExportWorkspaceIdRef.current = null;
		setPendingExportWorkspaceId(null);
	}, []);

	const dismissLeaseConflict = useCallback(() => {
		setLeaseConflict(null);
		clearPendingWorkspaceExport();
		restoreCurrentLifecycle();
	}, [clearPendingWorkspaceExport, restoreCurrentLifecycle]);

	const readLastActiveWorkspaceId = useCallback(() => {
		try {
			const workspaceId = sessionStorage.getItem(
				LAST_ACTIVE_WORKSPACE_SESSION_KEY
			);
			lastActiveWorkspaceIdRef.current = workspaceId;
			return workspaceId;
		} catch {
			return lastActiveWorkspaceIdRef.current;
		}
	}, []);

	const rememberLastActiveWorkspaceId = useCallback((workspaceId: string) => {
		lastActiveWorkspaceIdRef.current = workspaceId;
		try {
			sessionStorage.setItem(
				LAST_ACTIVE_WORKSPACE_SESSION_KEY,
				workspaceId
			);
		} catch {
			// The in-memory fallback remains available for the current page.
		}
	}, []);

	const forgetLastActiveWorkspaceId = useCallback(() => {
		lastActiveWorkspaceIdRef.current = null;
		try {
			sessionStorage.removeItem(LAST_ACTIVE_WORKSPACE_SESSION_KEY);
		} catch {
			// The in-memory fallback was already cleared.
		}
	}, []);

	const syncActiveWorkspaceSummary = useCallback(
		(summary: IWorkspaceSummary) => {
			const loaded = activeWorkspaceRef.current;
			if (!loaded || loaded.workspace.id !== summary.id) return;
			const nextLoaded = {
				snapshot: latestSnapshotRef.current ?? loaded.snapshot,
				workspace: summary,
			};
			activeWorkspaceRef.current = nextLoaded;
			if (pendingRecoveryRef.current) {
				pendingRecoveryRef.current = nextLoaded;
				setRecoveryWorkspace(summary);
				return;
			}
			setActiveWorkspace(nextLoaded);
		},
		[]
	);

	const refreshSummaries = useCallback(
		async (isCatalogMutation = false) => {
			const summaries = await repositoryRef.current.list();
			setWorkspaces(summaries);
			const activeWorkspaceId = activeWorkspaceRef.current?.workspace.id;
			const activeSummary = summaries.find(
				(summary) => summary.id === activeWorkspaceId
			);
			if (activeSummary) syncActiveWorkspaceSummary(activeSummary);
			if (
				activeWorkspaceId &&
				!activeSummary &&
				storageModeRef.current === 'persistent'
			) {
				await fallbackToMemoryRef.current?.(
					new Error('当前工作区已在其他页面中删除')
				);
			}
			if (isCatalogMutation && storageModeRef.current === 'persistent') {
				workspaceCatalogSyncRef.current?.notify();
			}
			return summaries;
		},
		[syncActiveWorkspaceSummary]
	);

	const notifyPersistentCatalogChange = useCallback(() => {
		if (storageModeRef.current === 'persistent') {
			workspaceCatalogSyncRef.current?.notify();
		}
	}, []);

	const createLeaseController = useCallback(
		(repository: IWorkspaceRepository) => {
			const ownerId = workspaceOwnerIdRef.current;
			if (!ownerId) throw new Error('资源包编辑状态尚未就绪');
			return createWorkspaceLeaseController({
				clearInterval: (intervalId) => window.clearInterval(intervalId),
				createLeaseId: () => crypto.randomUUID(),
				now: () => Date.now(),
				onLeaseLost: (ownerIdValue) => {
					activeLeaseIdRef.current = null;
					setSaveError(
						ownerIdValue
							? '该资源包已被其他页面接管，当前修改仅临时保留'
							: '无法续期资源包编辑权，当前修改仅临时保留'
					);
					setSaveStatus('memory-only');
					void fallbackToMemoryRef
						.current?.(
							new Error(
								ownerIdValue
									? '该资源包已被其他页面接管'
									: '无法续期资源包编辑权'
							)
						)
						?.catch((error) =>
							setStorageError(describeError(error))
						);
				},
				ownerId,
				repository,
				setInterval: (callback, intervalMs) =>
					window.setInterval(callback, intervalMs),
			});
		},
		[]
	);

	const installLeaseController = useCallback(
		(
			repository: IWorkspaceRepository,
			controller = createLeaseController(repository)
		) => {
			leaseControllerRef.current?.dispose();
			leaseControllerRef.current = controller;
		},
		[createLeaseController]
	);

	const installRepository = useCallback(
		(
			repository: IWorkspaceRepository,
			mode: TWorkspaceStorageMode,
			error: string | null,
			controller?: IWorkspaceLeaseController
		) => {
			const previousRepository = repositoryRef.current;
			repositoryRef.current = repository;
			storageModeRef.current = mode;
			setStorageMode(mode);
			setStorageError(error);
			installLeaseController(repository, controller);
			if (previousRepository !== repository) previousRepository.dispose();
		},
		[installLeaseController]
	);

	const fallbackToMemory = useCallback(
		async (error: unknown) => {
			if (storageModeRef.current === 'memory') {
				setStorageError(describeError(error));
				return;
			}
			if (fallbackPromiseRef.current) {
				await fallbackPromiseRef.current;
				return;
			}

			const fallbackPromise = (async () => {
				const loadedWorkspace = activeWorkspaceRef.current;
				const checkpointSnapshot = activeCheckpointSnapshotRef.current;
				const sourceWorkspaceId = loadedWorkspace?.workspace.id;
				let temporaryWorkspace: IWorkspaceLoadedSnapshot | null = null;
				if (loadedWorkspace && checkpointSnapshot) {
					let sourceArchiveHash: string | undefined;
					try {
						sourceArchiveHash =
							await repositoryRef.current.readSourceArchiveHash(
								loadedWorkspace.workspace.id
							);
					} catch {
						// The live snapshot remains usable without exact-match metadata.
					}
					temporaryWorkspace =
						await memoryRepository.createFromArchive(
							snapshotToArchiveInput(
								checkpointSnapshot,
								loadedWorkspace.workspace.displayName.endsWith(
									WORKSPACE_RECOVERY_COPY_SUFFIX
								)
									? loadedWorkspace.workspace.displayName
									: `${loadedWorkspace.workspace.displayName}${WORKSPACE_RECOVERY_COPY_SUFFIX}`,
								activeCheckpointIsExportedRef.current,
								sourceArchiveHash
							)
						);
				}

				try {
					await leaseControllerRef.current?.release();
				} catch {
					// A failed durable release must not block the temporary copy.
				}
				notifyPersistentCatalogChange();
				clearAutosaveTimeout();
				saveQueueRef.current?.dispose();
				saveQueueRef.current = null;
				activeLeaseIdRef.current = null;
				installRepository(
					memoryRepository,
					'memory',
					describeError(error)
				);
				clearPendingWorkspaceExport();

				if (temporaryWorkspace && sourceWorkspaceId) {
					const leaseResult =
						await leaseControllerRef.current?.acquire(
							temporaryWorkspace.workspace.id
						);
					if (!leaseResult?.isAcquired || !leaseResult.lease) {
						throw new Error('无法取得临时资源包的编辑权');
					}
					let persistedRevision =
						temporaryWorkspace.snapshot.revision;
					while (
						activeWorkspaceRef.current?.workspace.id ===
						sourceWorkspaceId
					) {
						const latestSnapshot = latestSnapshotRef.current;
						if (!latestSnapshot) break;
						const isCheckpointSnapshot =
							activeCheckpointRevisionRef.current ===
							latestSnapshot.revision;
						if (
							!isCheckpointSnapshot &&
							latestSnapshot.revision > persistedRevision
						) {
							await memoryRepository.saveCurrent(
								temporaryWorkspace.workspace.id,
								leaseResult.lease.leaseId,
								latestSnapshot
							);
							persistedRevision = latestSnapshot.revision;
						}
						const copiedSourceRevision = latestSnapshot.revision;
						const [loadedCurrent, loadedCheckpoint] =
							await Promise.all([
								memoryRepository.load(
									temporaryWorkspace.workspace.id,
									'current'
								),
								memoryRepository.load(
									temporaryWorkspace.workspace.id,
									'checkpoint'
								),
							]);
						if (
							latestSnapshotRef.current?.revision !==
							copiedSourceRevision
						) {
							continue;
						}
						publishLoadedWorkspaceRef.current?.(
							loadedCurrent,
							leaseResult.lease.leaseId,
							loadedCheckpoint.snapshot
						);
						break;
					}
				}
				await refreshSummaries(true);
			})();
			fallbackPromiseRef.current = fallbackPromise;
			try {
				await fallbackPromise;
			} finally {
				if (fallbackPromiseRef.current === fallbackPromise) {
					fallbackPromiseRef.current = null;
				}
			}
		},
		[
			clearPendingWorkspaceExport,
			clearAutosaveTimeout,
			installRepository,
			memoryRepository,
			notifyPersistentCatalogChange,
			refreshSummaries,
		]
	);
	fallbackToMemoryRef.current = fallbackToMemory;
	const safelyFallbackToMemory = useCallback(
		async (error: unknown) => {
			try {
				await fallbackToMemory(error);
				return null;
			} catch (fallbackError) {
				const message = describeError(fallbackError);
				setStorageError(message);
				return operationError(fallbackError);
			}
		},
		[fallbackToMemory]
	);

	useEffect(() => {
		const generation = initializationGenerationRef.current + 1;
		initializationGenerationRef.current = generation;
		const refreshExternalCatalog = () => {
			if (storageModeRef.current !== 'persistent') return;
			void refreshSummaries().catch((error) =>
				setStorageError(describeError(error))
			);
		};
		let catalogChannel: BroadcastChannel | null = null;
		try {
			catalogChannel = new BroadcastChannel(
				WORKSPACE_CATALOG_CHANNEL_NAME
			);
		} catch {
			// Window focus still refreshes the shared persistent catalog.
		}
		const catalogSync = createWorkspaceCatalogSync({
			channel: catalogChannel,
			onCatalogChange: refreshExternalCatalog,
		});
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible')
				refreshExternalCatalog();
		};
		workspaceCatalogSyncRef.current?.dispose();
		workspaceCatalogSyncRef.current = catalogSync;
		safeStorage.removeItem(LEGACY_LAST_ACTIVE_WORKSPACE_STORAGE_KEY);
		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('focus', refreshExternalCatalog);
		void (async () => {
			try {
				let ownerChannel: BroadcastChannel | null = null;
				let ownerClaim: Awaited<
					ReturnType<typeof claimWorkspaceOwnerId>
				> | null = null;
				try {
					ownerChannel = new BroadcastChannel(
						WORKSPACE_OWNER_CHANNEL_NAME
					);
				} catch {
					// Browsers without BroadcastChannel retain session-only ownership.
				}
				try {
					ownerClaim = await claimWorkspaceOwnerId({
						channel: ownerChannel,
						createId: () => crypto.randomUUID(),
						storage: sessionStorage,
						waitForClaims: () =>
							new Promise((resolve) =>
								window.setTimeout(
									resolve,
									WORKSPACE_OWNER_CLAIM_DELAY_MS
								)
							),
					});
				} catch {
					ownerChannel?.close();
				}
				if (initializationGenerationRef.current !== generation) {
					ownerClaim?.dispose();
					return;
				}
				if (ownerClaim) {
					ownerClaimDisposeRef.current?.();
					ownerClaimDisposeRef.current = ownerClaim.dispose;
					workspaceOwnerIdRef.current = ownerClaim.ownerId;
				} else {
					workspaceOwnerIdRef.current = crypto.randomUUID();
				}
				const repository = await createWorkspaceRepository();
				if (initializationGenerationRef.current !== generation) {
					repository.dispose();
					return;
				}
				installRepository(repository, 'persistent', null);
				setWorkspaces(await repository.list());
				try {
					void navigator.storage?.persist?.().catch(() => undefined);
				} catch {
					// Persistent-storage requests are best effort only.
				}
			} catch (error) {
				if (initializationGenerationRef.current !== generation) return;
				workspaceOwnerIdRef.current ??= crypto.randomUUID();
				const repository = memoryRepository;
				installRepository(repository, 'memory', describeError(error));
				setWorkspaces(await repository.list());
			} finally {
				if (initializationGenerationRef.current === generation) {
					setLifecycleStatus('manager');
				}
			}
		})();
		return () => {
			initializationGenerationRef.current += 1;
			clearAutosaveTimeout();
			document.removeEventListener(
				'visibilitychange',
				handleVisibilityChange
			);
			window.removeEventListener('focus', refreshExternalCatalog);
			if (workspaceCatalogSyncRef.current === catalogSync) {
				workspaceCatalogSyncRef.current = null;
			}
			catalogSync.dispose();
			ownerClaimDisposeRef.current?.();
			ownerClaimDisposeRef.current = null;
			leaseControllerRef.current?.dispose();
			saveQueueRef.current?.dispose();
			const repository = repositoryRef.current;
			queueMicrotask(() => repository.dispose());
		};
	}, [
		clearAutosaveTimeout,
		installRepository,
		memoryRepository,
		refreshSummaries,
	]);

	const installSaveQueue = useCallback(
		(workspaceId: string, leaseId: string, initialRevision: number) => {
			saveQueueRef.current?.dispose();
			saveQueueRef.current = createWorkspaceSaveQueue({
				initialRevision,
				onStatusChange: (status, error) => {
					if (status === 'error') {
						const message = describeError(error);
						setSaveError(message);
						setStorageError(message);
						setSaveStatus('memory-only');
						void fallbackToMemory(error).catch((fallbackError) =>
							setStorageError(describeError(fallbackError))
						);
						return;
					}
					setSaveError(null);
					setSaveStatus(
						storageModeRef.current === 'memory'
							? 'memory-only'
							: status
					);
				},
				save: async (snapshot) => {
					await repositoryRef.current.saveCurrent(
						workspaceId,
						leaseId,
						snapshot
					);
					await refreshSummaries(true);
				},
			});
		},
		[fallbackToMemory, refreshSummaries]
	);

	const publishLoadedWorkspace = useCallback(
		(
			loaded: IWorkspaceLoadedSnapshot,
			leaseId: string,
			checkpointSnapshot: IWorkspaceSnapshot
		) => {
			clearAutosaveTimeout();
			activeLeaseIdRef.current = leaseId;
			activeCheckpointIsExportedRef.current =
				loaded.workspace.isCheckpointExported;
			activeCheckpointRevisionRef.current =
				loaded.workspace.checkpointRevision;
			activeCheckpointSnapshotRef.current = checkpointSnapshot;
			latestSnapshotRef.current = loaded.snapshot;
			pendingRecoveryRef.current = null;
			setRecoveryWorkspace(null);
			setLeaseConflict(null);
			activeWorkspaceRef.current = loaded;
			setActiveWorkspace(loaded);
			isReadOnlyRef.current = false;
			setIsReadOnly(false);
			setLifecycleStatus('editing');
			if (storageModeRef.current === 'persistent') setSaveError(null);
			setSaveStatus(
				storageModeRef.current === 'memory' ? 'memory-only' : 'saved'
			);
			rememberLastActiveWorkspaceId(loaded.workspace.id);
			installSaveQueue(
				loaded.workspace.id,
				leaseId,
				loaded.snapshot.revision
			);
		},
		[clearAutosaveTimeout, installSaveQueue, rememberLastActiveWorkspaceId]
	);
	publishLoadedWorkspaceRef.current = publishLoadedWorkspace;

	const publishReadOnlyWorkspace = useCallback(
		(
			loaded: IWorkspaceLoadedSnapshot,
			checkpointSnapshot: IWorkspaceSnapshot
		) => {
			clearAutosaveTimeout();
			saveQueueRef.current?.dispose();
			saveQueueRef.current = null;
			activeLeaseIdRef.current = null;
			activeCheckpointIsExportedRef.current =
				loaded.workspace.isCheckpointExported;
			activeCheckpointRevisionRef.current =
				loaded.workspace.checkpointRevision;
			activeCheckpointSnapshotRef.current = checkpointSnapshot;
			latestSnapshotRef.current = loaded.snapshot;
			pendingRecoveryRef.current = null;
			setRecoveryWorkspace(null);
			setLeaseConflict(null);
			activeWorkspaceRef.current = loaded;
			setActiveWorkspace(loaded);
			isReadOnlyRef.current = true;
			setIsReadOnly(true);
			setLifecycleStatus('editing');
			setSaveError(null);
			setSaveStatus(
				storageModeRef.current === 'memory' ? 'memory-only' : 'saved'
			);
			rememberLastActiveWorkspaceId(loaded.workspace.id);
		},
		[clearAutosaveTimeout, rememberLastActiveWorkspaceId]
	);

	const finishWorkspaceOpen = useCallback(
		(
			loaded: IWorkspaceLoadedSnapshot,
			leaseId: string,
			checkpointSnapshot: IWorkspaceSnapshot
		) => {
			activeCheckpointSnapshotRef.current = checkpointSnapshot;
			activeCheckpointIsExportedRef.current =
				loaded.workspace.isCheckpointExported;
			if (
				loaded.workspace.currentRevision !==
					loaded.workspace.checkpointRevision &&
				pendingExportWorkspaceIdRef.current !== loaded.workspace.id
			) {
				clearAutosaveTimeout();
				saveQueueRef.current?.dispose();
				saveQueueRef.current = null;
				activeLeaseIdRef.current = leaseId;
				activeCheckpointRevisionRef.current =
					loaded.workspace.checkpointRevision;
				activeWorkspaceRef.current = loaded;
				latestSnapshotRef.current = loaded.snapshot;
				pendingRecoveryRef.current = loaded;
				setActiveWorkspace(null);
				setRecoveryWorkspace(loaded.workspace);
				setLifecycleStatus('recovering');
				return;
			}
			publishLoadedWorkspace(loaded, leaseId, checkpointSnapshot);
		},
		[clearAutosaveTimeout, publishLoadedWorkspace]
	);

	const openWorkspace = useCallback(
		async (id: string): Promise<IWorkspaceOperationResult> => {
			setLifecycleStatus('opening');
			let preparedController: IWorkspaceLeaseController | null = null;
			try {
				await flushCurrentWorkspace();
				if (
					activeWorkspaceRef.current?.workspace.id === id &&
					!isReadOnlyRef.current &&
					!pendingRecoveryRef.current
				) {
					setLeaseConflict(null);
					setLifecycleStatus('editing');
					return { isSuccess: true, workspaceId: id };
				}
				const summary =
					workspaces.find((workspace) => workspace.id === id) ??
					(await repositoryRef.current.list()).find(
						(workspace) => workspace.id === id
					);
				if (!summary) throw new Error('未找到要打开的资源包');
				preparedController = createLeaseController(
					repositoryRef.current
				);
				const leaseResult = await preparedController.acquire(id);
				if (!leaseResult.isAcquired || !leaseResult.lease) {
					preparedController.dispose();
					preparedController = null;
					setLeaseConflict({
						...(leaseResult.ownerId === undefined
							? {}
							: { ownerId: leaseResult.ownerId }),
						workspace: summary,
					});
					restoreCurrentLifecycle();
					return {
						error: '该资源包正在其他页面中编辑',
						isLeaseConflict: true,
						isSuccess: false,
					};
				}
				const { checkpointSnapshot, current } =
					await loadCurrentAndCheckpoint(repositoryRef.current, id);
				installLeaseController(
					repositoryRef.current,
					preparedController
				);
				preparedController = null;
				finishWorkspaceOpen(
					current,
					leaseResult.lease.leaseId,
					checkpointSnapshot
				);
				await refreshSummaries(true);
				return { isSuccess: true, workspaceId: id };
			} catch (error) {
				if (preparedController) {
					try {
						await preparedController.release();
					} catch {
						// The prepared lease expires naturally if cleanup fails.
					}
				}
				const fallbackResult = shouldUseMemoryFallback(error)
					? await safelyFallbackToMemory(error)
					: null;
				restoreCurrentLifecycle();
				if (fallbackResult) return fallbackResult;
				return operationError(error);
			}
		},
		[
			createLeaseController,
			finishWorkspaceOpen,
			flushCurrentWorkspace,
			installLeaseController,
			refreshSummaries,
			restoreCurrentLifecycle,
			safelyFallbackToMemory,
			workspaces,
		]
	);

	const openWorkspaceReadOnly = useCallback(
		async (id: string): Promise<IWorkspaceOperationResult> => {
			setLifecycleStatus('opening');
			try {
				await flushCurrentWorkspace();
				if (
					activeWorkspaceRef.current?.workspace.id === id &&
					isReadOnlyRef.current
				) {
					setLeaseConflict(null);
					setLifecycleStatus('editing');
					return { isSuccess: true, workspaceId: id };
				}
				const { checkpointSnapshot, current } =
					await loadCurrentAndCheckpoint(repositoryRef.current, id);
				await leaseControllerRef.current?.release();
				publishReadOnlyWorkspace(current, checkpointSnapshot);
				await refreshSummaries(true);
				return { isSuccess: true, workspaceId: id };
			} catch (error) {
				const fallbackResult = shouldUseMemoryFallback(error)
					? await safelyFallbackToMemory(error)
					: null;
				restoreCurrentLifecycle();
				if (fallbackResult) return fallbackResult;
				return operationError(error);
			}
		},
		[
			flushCurrentWorkspace,
			publishReadOnlyWorkspace,
			refreshSummaries,
			restoreCurrentLifecycle,
			safelyFallbackToMemory,
		]
	);

	const createWorkspace = useCallback(async () => {
		setLifecycleStatus('opening');
		try {
			await flushCurrentWorkspace();
			let loaded: IWorkspaceLoadedSnapshot;
			try {
				loaded = await repositoryRef.current.createBlank();
			} catch (error) {
				if (!shouldUseMemoryFallback(error)) throw error;
				await fallbackToMemory(error);
				loaded = await memoryRepository.createBlank();
			}
			await refreshSummaries(true);
			return openWorkspace(loaded.workspace.id);
		} catch (error) {
			restoreCurrentLifecycle();
			return operationError(error);
		}
	}, [
		fallbackToMemory,
		flushCurrentWorkspace,
		memoryRepository,
		openWorkspace,
		refreshSummaries,
		restoreCurrentLifecycle,
	]);

	const importWorkspace = useCallback(
		async (file: File) => {
			setLifecycleStatus('importing');
			try {
				const archive = await readResourcePackArchive(file);
				let sourceArchiveHash: string | undefined;
				try {
					sourceArchiveHash = await calculateBlobSha256(file);
				} catch {
					// A valid archive remains importable when exact hashing is unavailable.
				}
				const input: ICreateWorkspaceArchiveInput = {
					files: archive.files,
					folders: archive.folders,
					hasLicenseFile: archive.hasLicenseFile,
					isCheckpointExported: false,
					license: archive.license,
					resourcePack: archive.resourcePack,
					...(sourceArchiveHash === undefined
						? {}
						: { sourceArchiveHash }),
				};
				await flushCurrentWorkspace();
				let candidates: readonly IWorkspaceImportCandidate[];
				try {
					candidates =
						await repositoryRef.current.findImportCandidates(
							sourceArchiveHash,
							archive.resourcePack.packInfo.label,
							archive.resourcePack.packInfo.version
						);
				} catch (error) {
					if (!shouldUseMemoryFallback(error)) throw error;
					await fallbackToMemory(error);
					candidates = await memoryRepository.findImportCandidates(
						sourceArchiveHash,
						archive.resourcePack.packInfo.label,
						archive.resourcePack.packInfo.version
					);
				}
				if (candidates.length > 0) {
					pendingImportRef.current = { candidates, input };
					setDuplicateIntent({
						candidates,
						displayName:
							archive.resourcePack.packInfo.name?.trim() ||
							archive.resourcePack.packInfo.label?.trim() ||
							file.name,
					});
					restoreCurrentLifecycle();
					return { isSuccess: true };
				}
				let loaded: IWorkspaceLoadedSnapshot;
				try {
					loaded =
						await repositoryRef.current.createFromArchive(input);
				} catch (error) {
					if (!shouldUseMemoryFallback(error)) throw error;
					await fallbackToMemory(error);
					loaded = await memoryRepository.createFromArchive(input);
				}
				await refreshSummaries(true);
				restoreCurrentLifecycle();
				return { isSuccess: true, workspaceId: loaded.workspace.id };
			} catch (error) {
				restoreCurrentLifecycle();
				return operationError(error);
			}
		},
		[
			fallbackToMemory,
			flushCurrentWorkspace,
			memoryRepository,
			refreshSummaries,
			restoreCurrentLifecycle,
		]
	);

	const continueRecovery = useCallback(() => {
		const loaded = pendingRecoveryRef.current;
		const leaseId = activeLeaseIdRef.current;
		const checkpointSnapshot = activeCheckpointSnapshotRef.current;
		if (!loaded || !leaseId || !checkpointSnapshot) return;
		publishLoadedWorkspace(loaded, leaseId, checkpointSnapshot);
	}, [publishLoadedWorkspace]);

	const discardRecovery = useCallback(async () => {
		const workspace = pendingRecoveryRef.current?.workspace;
		const leaseId = activeLeaseIdRef.current;
		if (!workspace || !leaseId) {
			return { error: '没有可放弃的本地修改', isSuccess: false };
		}
		try {
			const loaded = await repositoryRef.current.restoreCheckpoint(
				workspace.id,
				leaseId
			);
			await refreshSummaries(true);
			publishLoadedWorkspace(loaded, leaseId, loaded.snapshot);
			return { isSuccess: true, workspaceId: workspace.id };
		} catch (error) {
			const fallbackResult = shouldUseMemoryFallback(error)
				? await safelyFallbackToMemory(error)
				: null;
			return fallbackResult ?? operationError(error);
		}
	}, [publishLoadedWorkspace, refreshSummaries, safelyFallbackToMemory]);

	const closeWorkspace = useCallback(async () => {
		try {
			enqueueLatestSnapshot();
			await saveQueueRef.current?.flush();
			await leaseControllerRef.current?.release();
		} catch (error) {
			const fallbackResult = shouldUseMemoryFallback(error)
				? await safelyFallbackToMemory(error)
				: null;
			return fallbackResult ?? operationError(error);
		}
		saveQueueRef.current?.dispose();
		saveQueueRef.current = null;
		clearAutosaveTimeout();
		activeLeaseIdRef.current = null;
		activeCheckpointIsExportedRef.current = false;
		activeCheckpointRevisionRef.current = null;
		activeCheckpointSnapshotRef.current = null;
		activeWorkspaceRef.current = null;
		latestSnapshotRef.current = null;
		isReadOnlyRef.current = false;
		setActiveWorkspace(null);
		setIsReadOnly(false);
		setLeaseConflict(null);
		clearPendingWorkspaceExport();
		setRecoveryWorkspace(null);
		setLifecycleStatus('manager');
		forgetLastActiveWorkspaceId();
		try {
			await refreshSummaries(true);
		} catch (error) {
			setStorageError(describeError(error));
		}
		return { isSuccess: true };
	}, [
		clearAutosaveTimeout,
		clearPendingWorkspaceExport,
		enqueueLatestSnapshot,
		forgetLastActiveWorkspaceId,
		refreshSummaries,
		safelyFallbackToMemory,
	]);

	const duplicateWorkspace = useCallback(
		async (id: string): Promise<IWorkspaceOperationResult> => {
			const isActiveSource =
				activeWorkspaceRef.current?.workspace.id === id;
			try {
				await flushCurrentWorkspace();
				const loaded = await repositoryRef.current.duplicate(id);
				await refreshSummaries(true);
				return { isSuccess: true, workspaceId: loaded.workspace.id };
			} catch (error) {
				if (shouldUseMemoryFallback(error)) {
					const fallbackResult = await safelyFallbackToMemory(error);
					if (fallbackResult) {
						restoreCurrentLifecycle();
						return fallbackResult;
					}
					const temporarySource = activeWorkspaceRef.current;
					if (
						isActiveSource &&
						storageModeRef.current === 'memory' &&
						temporarySource
					) {
						try {
							const loaded =
								await repositoryRef.current.duplicate(
									temporarySource.workspace.id
								);
							await refreshSummaries(true);
							return {
								isSuccess: true,
								workspaceId: loaded.workspace.id,
							};
						} catch (fallbackError) {
							return operationError(fallbackError);
						}
					}
				}
				restoreCurrentLifecycle();
				return operationError(error);
			}
		},
		[
			flushCurrentWorkspace,
			refreshSummaries,
			restoreCurrentLifecycle,
			safelyFallbackToMemory,
		]
	);

	const requestWorkspaceExport = useCallback(
		async (id: string) => {
			pendingExportWorkspaceIdRef.current = id;
			setPendingExportWorkspaceId(id);
			const result = await openWorkspace(id);
			if (!result.isSuccess && !result.isLeaseConflict) {
				clearPendingWorkspaceExport();
			}
			return result;
		},
		[clearPendingWorkspaceExport, openWorkspace]
	);

	const renameWorkspace = useCallback(
		async (id: string, displayName: string) => {
			const isActiveTarget =
				activeWorkspaceRef.current?.workspace.id === id;
			try {
				if (isActiveTarget) await flushCurrentWorkspace();
				const leaseId =
					activeWorkspaceRef.current?.workspace.id === id
						? (activeLeaseIdRef.current ?? undefined)
						: undefined;
				await repositoryRef.current.rename(id, displayName, leaseId);
				await refreshSummaries(true);
				return { isSuccess: true };
			} catch (error) {
				if (shouldUseMemoryFallback(error)) {
					const fallbackResult = await safelyFallbackToMemory(error);
					if (fallbackResult) return fallbackResult;
					const temporaryTarget = activeWorkspaceRef.current;
					if (
						isActiveTarget &&
						storageModeRef.current === 'memory' &&
						temporaryTarget
					) {
						try {
							await repositoryRef.current.rename(
								temporaryTarget.workspace.id,
								displayName,
								activeLeaseIdRef.current ?? undefined
							);
							await refreshSummaries(true);
							return { isSuccess: true };
						} catch (fallbackError) {
							return operationError(fallbackError);
						}
					}
				}
				return operationError(error);
			}
		},
		[flushCurrentWorkspace, refreshSummaries, safelyFallbackToMemory]
	);

	const removeWorkspace = useCallback(
		async (id: string, isForced = false) => {
			try {
				if (activeWorkspaceRef.current?.workspace.id === id) {
					const closeResult = await closeWorkspace();
					if (!closeResult.isSuccess) return closeResult;
				}
				await repositoryRef.current.remove(id, undefined, isForced);
				await refreshSummaries(true);
				return { isSuccess: true };
			} catch (error) {
				if (isLeaseConflictError(error)) {
					return {
						error: describeError(error),
						isLeaseConflict: true,
						isSuccess: false,
					};
				}
				const fallbackResult = shouldUseMemoryFallback(error)
					? await safelyFallbackToMemory(error)
					: null;
				return fallbackResult ?? operationError(error);
			}
		},
		[closeWorkspace, refreshSummaries, safelyFallbackToMemory]
	);

	const resolveImport = useCallback(
		async (
			resolution: TWorkspaceImportResolution,
			workspaceId?: string
		): Promise<IWorkspaceOperationResult> => {
			const pendingImport = pendingImportRef.current;
			if (!pendingImport) {
				return { error: '没有等待处理的导入资源包', isSuccess: false };
			}
			if (resolution === 'cancel') {
				pendingImportRef.current = null;
				setDuplicateIntent(null);
				restoreCurrentLifecycle();
				return { isSuccess: true };
			}
			if (!workspaceId && resolution !== 'copy') {
				return { error: '未选择已有资源包', isSuccess: false };
			}
			const targetWorkspaceId = workspaceId;
			const pendingDisplayName =
				duplicateIntent?.displayName ||
				pendingImport.input.resourcePack.packInfo.name?.trim() ||
				pendingImport.input.resourcePack.packInfo.label?.trim() ||
				'资源包';
			const refreshPendingImportCandidates = async () => {
				const candidates =
					await repositoryRef.current.findImportCandidates(
						pendingImport.input.sourceArchiveHash,
						pendingImport.input.resourcePack.packInfo.label,
						pendingImport.input.resourcePack.packInfo.version
					);
				pendingImportRef.current = { ...pendingImport, candidates };
				setDuplicateIntent({
					candidates,
					displayName: pendingDisplayName,
				});
			};
			try {
				if (resolution === 'open') {
					if (!targetWorkspaceId) {
						return { error: '未选择已有资源包', isSuccess: false };
					}
					const result = await openWorkspace(targetWorkspaceId);
					if (result.isSuccess || result.isLeaseConflict) {
						pendingImportRef.current = null;
						setDuplicateIntent(null);
					} else if (storageModeRef.current === 'memory') {
						await refreshPendingImportCandidates();
					}
					return result;
				}
				if (resolution === 'replace') {
					await flushCurrentWorkspace();
					if (!targetWorkspaceId) {
						return { error: '未选择已有资源包', isSuccess: false };
					}
					const isActiveTarget =
						activeWorkspaceRef.current?.workspace.id ===
						targetWorkspaceId;
					const activeLeaseId =
						isActiveTarget && !isReadOnlyRef.current
							? activeLeaseIdRef.current
							: null;
					let preparedController: IWorkspaceLeaseController | null =
						null;
					let leaseId = activeLeaseId;
					if (!leaseId) {
						preparedController = createLeaseController(
							repositoryRef.current
						);
						const leaseResult =
							await preparedController.acquire(targetWorkspaceId);
						if (!leaseResult.isAcquired || !leaseResult.lease) {
							preparedController.dispose();
							return {
								error: '该资源包正在其他页面中编辑，不能覆盖',
								isSuccess: false,
							};
						}
						leaseId = leaseResult.lease.leaseId;
					}
					if (!leaseId) {
						throw new Error('无法取得该资源包的编辑权');
					}
					let loaded: IWorkspaceLoadedSnapshot;
					try {
						loaded = await repositoryRef.current.replaceFromArchive(
							targetWorkspaceId,
							leaseId,
							pendingImport.input
						);
					} catch (error) {
						if (preparedController) {
							try {
								await preparedController.release();
							} catch {
								// The prepared lease expires naturally if cleanup fails.
							}
						}
						throw error;
					}
					if (preparedController) {
						await preparedController.release();
						preparedController.dispose();
						preparedController = null;
					}
					pendingImportRef.current = null;
					setDuplicateIntent(null);
					if (isActiveTarget && activeLeaseId) {
						publishLoadedWorkspace(
							loaded,
							activeLeaseId,
							loaded.snapshot
						);
					} else if (isActiveTarget && isReadOnlyRef.current) {
						publishReadOnlyWorkspace(loaded, loaded.snapshot);
					} else {
						restoreCurrentLifecycle();
					}
					await refreshSummaries(true);
					return {
						isSuccess: true,
						workspaceId: loaded.workspace.id,
					};
				}
				await flushCurrentWorkspace();
				const loaded = await repositoryRef.current.createFromArchive({
					...pendingImport.input,
					displayName: `${pendingDisplayName}（副本）`,
				});
				pendingImportRef.current = null;
				setDuplicateIntent(null);
				await refreshSummaries(true);
				restoreCurrentLifecycle();
				return { isSuccess: true, workspaceId: loaded.workspace.id };
			} catch (error) {
				const fallbackResult = shouldUseMemoryFallback(error)
					? await safelyFallbackToMemory(error)
					: null;
				restoreCurrentLifecycle();
				if (fallbackResult) return fallbackResult;
				if (
					shouldUseMemoryFallback(error) &&
					pendingImportRef.current === pendingImport
				) {
					try {
						if (resolution === 'copy') {
							const loaded =
								await repositoryRef.current.createFromArchive({
									...pendingImport.input,
									displayName: `${pendingDisplayName}（副本）`,
								});
							pendingImportRef.current = null;
							setDuplicateIntent(null);
							await refreshSummaries(true);
							restoreCurrentLifecycle();
							return {
								isSuccess: true,
								workspaceId: loaded.workspace.id,
							};
						}
						await refreshPendingImportCandidates();
					} catch (fallbackError) {
						return operationError(fallbackError);
					}
				}
				return operationError(error);
			}
		},
		[
			createLeaseController,
			duplicateIntent?.displayName,
			flushCurrentWorkspace,
			openWorkspace,
			publishLoadedWorkspace,
			publishReadOnlyWorkspace,
			refreshSummaries,
			restoreCurrentLifecycle,
			safelyFallbackToMemory,
		]
	);

	const takeOverWorkspace = useCallback(async () => {
		const conflict = leaseConflict;
		if (!conflict) {
			return { error: '没有需要接管的资源包', isSuccess: false };
		}
		setLifecycleStatus('opening');
		let preparedController: IWorkspaceLeaseController | null =
			createLeaseController(repositoryRef.current);
		try {
			const result = await preparedController.takeOver(
				conflict.workspace.id
			);
			if (!result.isAcquired || !result.lease) {
				throw new Error('无法接管该资源包');
			}
			const { checkpointSnapshot, current } =
				await loadCurrentAndCheckpoint(
					repositoryRef.current,
					conflict.workspace.id
				);
			installLeaseController(repositoryRef.current, preparedController);
			preparedController = null;
			finishWorkspaceOpen(
				current,
				result.lease.leaseId,
				checkpointSnapshot
			);
			await refreshSummaries(true);
			return { isSuccess: true, workspaceId: conflict.workspace.id };
		} catch (error) {
			if (preparedController) {
				try {
					await preparedController.release();
				} catch {
					// The prepared lease expires naturally if cleanup fails.
				}
			}
			const fallbackResult = shouldUseMemoryFallback(error)
				? await safelyFallbackToMemory(error)
				: null;
			restoreCurrentLifecycle();
			if (fallbackResult) return fallbackResult;
			return operationError(error);
		}
	}, [
		createLeaseController,
		finishWorkspaceOpen,
		installLeaseController,
		leaseConflict,
		refreshSummaries,
		restoreCurrentLifecycle,
		safelyFallbackToMemory,
	]);

	const saveActiveSnapshot = useCallback(
		(snapshot: IWorkspaceSnapshot) => {
			if (isReadOnlyRef.current) return;
			latestSnapshotRef.current = snapshot;
			clearAutosaveTimeout();
			autosaveTimeoutRef.current = window.setTimeout(
				enqueueLatestSnapshot,
				WORKSPACE_AUTOSAVE_DELAY_MS
			);
		},
		[clearAutosaveTimeout, enqueueLatestSnapshot]
	);

	const flushActiveSave = useCallback(async () => {
		try {
			enqueueLatestSnapshot();
			await saveQueueRef.current?.flush();
			return { isSuccess: true };
		} catch (error) {
			return operationError(error);
		}
	}, [enqueueLatestSnapshot]);

	const retryActiveSave = useCallback(() => {
		saveQueueRef.current?.retry();
		enqueueLatestSnapshot();
	}, [enqueueLatestSnapshot]);

	const promoteActiveCheckpoint = useCallback(
		async (revision: number) => {
			const workspaceId = activeWorkspace?.workspace.id;
			const leaseId = activeLeaseIdRef.current;
			if (isReadOnlyRef.current) {
				return {
					error: '只读查看不会修改本地恢复版本',
					isSuccess: false,
				};
			}
			if (!workspaceId || !leaseId) {
				return {
					error: '当前没有可更新本地恢复版本的资源包',
					isSuccess: false,
				};
			}
			try {
				enqueueLatestSnapshot();
				await saveQueueRef.current?.flush();
				await repositoryRef.current.promoteCheckpoint(
					workspaceId,
					leaseId,
					revision
				);
				activeCheckpointRevisionRef.current = revision;
				activeCheckpointIsExportedRef.current = true;
				if (latestSnapshotRef.current?.revision === revision) {
					activeCheckpointSnapshotRef.current =
						latestSnapshotRef.current;
				}
				await refreshSummaries(true);
				return { isSuccess: true };
			} catch (error) {
				if (shouldUseMemoryFallback(error)) {
					try {
						await fallbackToMemory(error);
						const temporaryWorkspace = activeWorkspaceRef.current;
						const temporaryLeaseId = activeLeaseIdRef.current;
						if (
							temporaryWorkspace?.snapshot.revision ===
								revision &&
							temporaryLeaseId
						) {
							await repositoryRef.current.promoteCheckpoint(
								temporaryWorkspace.workspace.id,
								temporaryLeaseId,
								revision
							);
							const { checkpointSnapshot, current } =
								await loadCurrentAndCheckpoint(
									repositoryRef.current,
									temporaryWorkspace.workspace.id
								);
							publishLoadedWorkspace(
								current,
								temporaryLeaseId,
								checkpointSnapshot
							);
							await refreshSummaries(true);
						}
					} catch (fallbackError) {
						setStorageError(describeError(fallbackError));
					}
				}
				if (storageModeRef.current === 'memory') {
					const temporaryWorkspace = activeWorkspaceRef.current;
					if (
						temporaryWorkspace?.snapshot.revision === revision &&
						activeCheckpointRevisionRef.current === revision
					) {
						return { isSuccess: true };
					}
				}
				return operationError(error);
			}
		},
		[
			activeWorkspace?.workspace.id,
			enqueueLatestSnapshot,
			fallbackToMemory,
			publishLoadedWorkspace,
			refreshSummaries,
		]
	);

	const openLastWorkspace = useCallback(async () => {
		const id = readLastActiveWorkspaceId();
		return id
			? openWorkspace(id)
			: { error: '没有上次打开的资源包', isSuccess: false };
	}, [openWorkspace, readLastActiveWorkspaceId]);

	const retryPersistentStorage = useCallback(async () => {
		let candidateRepository: IWorkspaceRepository | null = null;
		try {
			if (fallbackPromiseRef.current) {
				await fallbackPromiseRef.current;
			}
			if (storageModeRef.current === 'persistent') {
				saveQueueRef.current?.retry();
				enqueueLatestSnapshot();
				await saveQueueRef.current?.flush();
				await refreshSummaries(true);
				setStorageError(null);
				return {
					isSuccess: true,
					...(activeWorkspaceRef.current === null
						? {}
						: {
								workspaceId:
									activeWorkspaceRef.current.workspace.id,
							}),
				};
			}
			await flushCurrentWorkspace();
			const repository = await createWorkspaceRepository();
			candidateRepository = repository;
			const temporaryWorkspaces = await memoryRepository.list();
			const activeTemporaryId = activeWorkspaceRef.current?.workspace.id;
			const migratedIds = await migrateTemporaryWorkspaces({
				createExpiresAt: () => Date.now() + 60_000,
				createLeaseId: () => crypto.randomUUID(),
				ownerId: `migration-${crypto.randomUUID()}`,
				source: memoryRepository,
				target: repository,
			});
			const preparedController = createLeaseController(repository);
			let isPreparedControllerInstalled = false;
			let migratedActiveId: string | undefined;
			let preparedActive:
				| {
						checkpointSnapshot: IWorkspaceSnapshot;
						current: IWorkspaceLoadedSnapshot;
						leaseId: string;
				  }
				| undefined;
			try {
				if (activeTemporaryId) {
					migratedActiveId = migratedIds.get(activeTemporaryId);
					if (migratedActiveId) {
						const leaseResult =
							await preparedController.acquire(migratedActiveId);
						if (!leaseResult.isAcquired || !leaseResult.lease) {
							throw new Error('无法取得已保存资源包的编辑权');
						}
						const loaded = await loadCurrentAndCheckpoint(
							repository,
							migratedActiveId
						);
						preparedActive = {
							...loaded,
							leaseId: leaseResult.lease.leaseId,
						};
					}
				}
				await leaseControllerRef.current?.release();
				clearAutosaveTimeout();
				saveQueueRef.current?.dispose();
				saveQueueRef.current = null;
				activeLeaseIdRef.current = null;
				activeCheckpointIsExportedRef.current = false;
				activeCheckpointRevisionRef.current = null;
				activeCheckpointSnapshotRef.current = null;
				activeWorkspaceRef.current = null;
				latestSnapshotRef.current = null;
				isReadOnlyRef.current = false;
				setActiveWorkspace(null);
				setIsReadOnly(false);
				installRepository(
					repository,
					'persistent',
					null,
					preparedController
				);
				candidateRepository = null;
				isPreparedControllerInstalled = true;
				if (preparedActive) {
					publishLoadedWorkspace(
						preparedActive.current,
						preparedActive.leaseId,
						preparedActive.checkpointSnapshot
					);
				}
				await Promise.allSettled(
					temporaryWorkspaces.map((workspace) =>
						memoryRepository.remove(workspace.id)
					)
				);
				await refreshSummaries(true);
				return {
					isSuccess: true,
					...(migratedActiveId === undefined
						? {}
						: { workspaceId: migratedActiveId }),
				};
			} catch (error) {
				if (!isPreparedControllerInstalled) {
					try {
						await preparedController.release();
					} catch {
						// Rollback below still attempts every newly created target.
					}
					await Promise.allSettled(
						Array.from(migratedIds.values(), (id) =>
							repository.remove(id)
						)
					);
				}
				throw error;
			}
		} catch (error) {
			candidateRepository?.dispose();
			setStorageError(describeError(error));
			return operationError(error);
		}
	}, [
		clearAutosaveTimeout,
		createLeaseController,
		enqueueLatestSnapshot,
		flushCurrentWorkspace,
		installRepository,
		memoryRepository,
		publishLoadedWorkspace,
		refreshSummaries,
	]);

	const value = useMemo(
		() => ({
			activeWorkspace,
			clearPendingWorkspaceExport,
			closeWorkspace,
			continueRecovery,
			createWorkspace,
			discardRecovery,
			dismissLeaseConflict,
			duplicateIntent,
			duplicateWorkspace,
			flushActiveSave,
			importWorkspace,
			isReadOnly,
			leaseConflict,
			lifecycleStatus,
			openLastWorkspace,
			openWorkspace,
			openWorkspaceReadOnly,
			pendingExportWorkspaceId,
			promoteActiveCheckpoint,
			recoveryWorkspace,
			removeWorkspace,
			requestWorkspaceExport,
			renameWorkspace,
			resolveImport,
			retryActiveSave,
			retryPersistentStorage,
			saveActiveSnapshot,
			saveError,
			saveStatus,
			storageError,
			storageMode,
			takeOverWorkspace,
			workspaces,
		}),
		[
			activeWorkspace,
			clearPendingWorkspaceExport,
			closeWorkspace,
			continueRecovery,
			createWorkspace,
			discardRecovery,
			dismissLeaseConflict,
			duplicateIntent,
			duplicateWorkspace,
			flushActiveSave,
			importWorkspace,
			isReadOnly,
			leaseConflict,
			lifecycleStatus,
			openLastWorkspace,
			openWorkspace,
			openWorkspaceReadOnly,
			pendingExportWorkspaceId,
			promoteActiveCheckpoint,
			recoveryWorkspace,
			removeWorkspace,
			requestWorkspaceExport,
			renameWorkspace,
			resolveImport,
			retryActiveSave,
			retryPersistentStorage,
			saveActiveSnapshot,
			saveError,
			saveStatus,
			storageError,
			storageMode,
			takeOverWorkspace,
			workspaces,
		]
	);

	return (
		<ResourceWorkspaceContext.Provider value={value}>
			{children}
		</ResourceWorkspaceContext.Provider>
	);
}
