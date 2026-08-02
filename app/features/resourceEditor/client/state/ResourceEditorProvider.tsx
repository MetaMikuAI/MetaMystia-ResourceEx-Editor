'use client';

import {
	type PropsWithChildren,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { remapResourcePackAssetReferences } from '@/domain/resourcePack/assetReferences';
import type { ResourceEx } from '@/domain/resourcePack/contracts/resourceEx';
import { createBlankResourcePack } from '@/domain/resourcePack/createBlankResourcePack';

import { downloadResourcePack } from '@/features/resourceEditor/client/archive/downloadResourcePack';
import { writeResourcePackArchive } from '@/features/resourceEditor/client/archive/writeResourcePackArchive';
import type { IAssetPathOperation } from '@/features/resourceEditor/client/assets/contracts';
import { useAssetStore } from '@/features/resourceEditor/client/assets/useAssetStore';
import { useResourceWorkspaces } from '@/features/resourceEditor/client/workspaces/useResourceWorkspaces';

import type { IResourceEditorExportResult } from './contracts';
import { runResourcePackExport } from './runResourcePackExport';
import { ResourceEditorContext } from './useResourceEditor';

import '@/features/resourceEditor/client/assets/styles.scss';

function describeError(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}

const RESOURCE_EDITOR_UNMOUNTED_ERROR = '资源编辑器已卸载';
const RESOURCE_EDITOR_READ_ONLY_ERROR = '当前为只读查看，不能修改资源包';

export function ResourceEditorProvider({ children }: PropsWithChildren) {
	const {
		activeWorkspace,
		flushActiveSave,
		isReadOnly,
		promoteActiveCheckpoint,
		retryActiveSave,
		saveActiveSnapshot,
		saveError,
		saveStatus,
		storageMode,
	} = useResourceWorkspaces();
	const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
		null
	);
	const [resourcePack, setResourcePack] = useState<ResourceEx>(() =>
		createBlankResourcePack()
	);
	const [license, setLicense] = useState('');
	const [hasUnexportedChanges, setHasUnexportedChanges] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isLocalSavePending, setIsLocalSavePending] = useState(false);
	const [revision, setRevision] = useState(0);
	const hasLicenseFileRef = useRef(false);
	const isExportingRef = useRef(false);
	const isMountedRef = useRef(false);
	const isReadOnlyRef = useRef(isReadOnly);
	const licenseRef = useRef(license);
	const resourcePackRef = useRef(resourcePack);
	const revisionRef = useRef(revision);
	isReadOnlyRef.current = isReadOnly;
	const bumpRevision = useCallback(() => {
		const nextRevision = revisionRef.current + 1;
		revisionRef.current = nextRevision;
		setRevision(nextRevision);
		return nextRevision;
	}, []);
	const markDirty = useCallback(() => {
		if (isReadOnlyRef.current) return;
		bumpRevision();
		setHasUnexportedChanges(true);
		setIsLocalSavePending(true);
	}, [bumpRevision]);
	const {
		assetState,
		copyAssets: copyStoredAssets,
		createAssetFolder: createStoredAssetFolder,
		getAssetSnapshot,
		getAssetUrl,
		isAssetGenerationCurrent,
		moveAssets: moveStoredAssets,
		removeAsset: removeStoredAsset,
		removeAssets: removeStoredAssets,
		removeAssetFolders: removeStoredAssetFolders,
		replaceAssets,
		updateAsset: updateStoredAsset,
		updateAssets: updateStoredAssets,
	} = useAssetStore(markDirty);
	const copyAssets = useCallback(
		(operations: readonly IAssetPathOperation[]) => {
			if (isReadOnlyRef.current) return;
			copyStoredAssets(operations);
		},
		[copyStoredAssets]
	);
	const createAssetFolder = useCallback(
		(path: string) =>
			isReadOnlyRef.current
				? { error: RESOURCE_EDITOR_READ_ONLY_ERROR, isSuccess: false }
				: createStoredAssetFolder(path),
		[createStoredAssetFolder]
	);
	const removeAsset = useCallback(
		(path: string) => {
			if (isReadOnlyRef.current) return;
			removeStoredAsset(path);
		},
		[removeStoredAsset]
	);
	const removeAssets = useCallback(
		(paths: readonly string[]) => {
			if (isReadOnlyRef.current) return;
			removeStoredAssets(paths);
		},
		[removeStoredAssets]
	);
	const removeAssetFolders = useCallback(
		(paths: readonly string[]) => {
			if (isReadOnlyRef.current) return;
			removeStoredAssetFolders(paths);
		},
		[removeStoredAssetFolders]
	);
	const updateAsset = useCallback(
		(path: string, blob: Blob) =>
			isReadOnlyRef.current
				? { error: RESOURCE_EDITOR_READ_ONLY_ERROR, isSuccess: false }
				: updateStoredAsset(path, blob),
		[updateStoredAsset]
	);
	const updateAssets = useCallback(
		(updates: ReadonlyMap<string, Blob>) =>
			isReadOnlyRef.current
				? { error: RESOURCE_EDITOR_READ_ONLY_ERROR, isSuccess: false }
				: updateStoredAssets(updates),
		[updateStoredAssets]
	);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (
				!isLocalSavePending &&
				saveStatus !== 'saving' &&
				saveStatus !== 'error' &&
				saveStatus !== 'memory-only'
			) {
				return;
			}
			event.preventDefault();
			event.returnValue = '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () =>
			window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [isLocalSavePending, saveStatus]);

	const updateResourcePack = useCallback(
		(updater: (current: ResourceEx) => ResourceEx) => {
			if (isReadOnlyRef.current) return;
			const nextResourcePack = updater(resourcePackRef.current);
			resourcePackRef.current = nextResourcePack;
			setResourcePack(nextResourcePack);
			markDirty();
		},
		[markDirty]
	);

	const moveAssets = useCallback(
		(operations: readonly IAssetPathOperation[]) => {
			if (isReadOnlyRef.current) return;
			if (!moveStoredAssets(operations)) return;
			const pathMap = new Map(
				operations
					.filter(({ from }) => !from.endsWith('/'))
					.map(({ from, to }) => [from, to] as const)
			);
			const nextResourcePack = remapResourcePackAssetReferences(
				resourcePackRef.current,
				pathMap
			);
			if (nextResourcePack === resourcePackRef.current) return;
			resourcePackRef.current = nextResourcePack;
			setResourcePack(nextResourcePack);
		},
		[moveStoredAssets]
	);

	const replaceLicense = useCallback(
		(nextLicense: string) => {
			if (isReadOnlyRef.current) return;
			hasLicenseFileRef.current = nextLicense.length > 0;
			licenseRef.current = nextLicense;
			setLicense(nextLicense);
			markDirty();
		},
		[markDirty]
	);

	const readCurrentSnapshot = useCallback(
		(expectedRevision: number) => {
			if (!isMountedRef.current) return null;
			if (revisionRef.current !== expectedRevision) return null;
			const assets = getAssetSnapshot();
			if (revisionRef.current !== expectedRevision) return null;
			return {
				...assets,
				hasLicenseFile: hasLicenseFileRef.current,
				license: licenseRef.current,
				resourcePack: resourcePackRef.current,
				revision: expectedRevision,
			};
		},
		[getAssetSnapshot]
	);

	useEffect(() => {
		if (!activeWorkspace) {
			setActiveWorkspaceId(null);
			setIsLocalSavePending(false);
			return;
		}
		const { snapshot, workspace } = activeWorkspace;
		replaceAssets(snapshot.files, snapshot.folders);
		resourcePackRef.current = snapshot.resourcePack;
		hasLicenseFileRef.current = snapshot.hasLicenseFile;
		licenseRef.current = snapshot.license;
		revisionRef.current = snapshot.revision;
		setResourcePack(snapshot.resourcePack);
		setLicense(snapshot.license);
		setRevision(snapshot.revision);
		setHasUnexportedChanges(!workspace.isCurrentExported);
		setIsLocalSavePending(false);
		setActiveWorkspaceId(workspace.id);
	}, [activeWorkspace, replaceAssets]);

	useEffect(() => {
		if (
			!activeWorkspaceId ||
			activeWorkspace?.workspace.id !== activeWorkspaceId ||
			revisionRef.current !== revision
		) {
			return;
		}
		const snapshot = readCurrentSnapshot(revision);
		if (!snapshot) return;
		saveActiveSnapshot(snapshot);
	}, [
		activeWorkspace?.workspace.id,
		activeWorkspaceId,
		readCurrentSnapshot,
		revision,
		saveActiveSnapshot,
	]);

	useEffect(() => {
		if (saveStatus === 'saved') setIsLocalSavePending(false);
	}, [saveStatus]);

	const flushLocalSave = useCallback(async () => {
		if (activeWorkspaceId) {
			const snapshot = readCurrentSnapshot(revisionRef.current);
			if (snapshot) saveActiveSnapshot(snapshot);
		}
		const result = await flushActiveSave();
		if (result.isSuccess) setIsLocalSavePending(false);
		return result;
	}, [
		activeWorkspaceId,
		flushActiveSave,
		readCurrentSnapshot,
		saveActiveSnapshot,
	]);

	const retryLocalSave = useCallback(() => {
		const snapshot = readCurrentSnapshot(revisionRef.current);
		if (snapshot) saveActiveSnapshot(snapshot);
		retryActiveSave();
	}, [readCurrentSnapshot, retryActiveSave, saveActiveSnapshot]);

	const clearDirtyIfRevision = useCallback((expectedRevision: number) => {
		if (!isMountedRef.current) return false;
		if (revisionRef.current !== expectedRevision) return false;
		setHasUnexportedChanges(false);
		return true;
	}, []);

	const exportArchive = useCallback(
		async (
			expectedRevision: number,
			filename?: string
		): Promise<IResourceEditorExportResult> => {
			if (!isMountedRef.current) {
				return {
					isSuccess: false,
					error: RESOURCE_EDITOR_UNMOUNTED_ERROR,
				};
			}
			if (isExportingRef.current) {
				return { isSuccess: false, error: '资源包正在导出' };
			}
			isExportingRef.current = true;
			setIsExporting(true);
			try {
				const result = await runResourcePackExport({
					clearDirtyIfRevision,
					downloadArchive: downloadResourcePack,
					expectedRevision,
					...(filename === undefined ? {} : { filename }),
					readCurrentRevision: () => revisionRef.current,
					readSnapshot: readCurrentSnapshot,
					writeArchive: writeResourcePackArchive,
				});
				if (!result.isSuccess) return result;
				const checkpointResult =
					await promoteActiveCheckpoint(expectedRevision);
				return checkpointResult.isSuccess
					? result
					: {
							...result,
							warning: `资源包已导出，但本地恢复版本更新失败：${checkpointResult.error ?? '未知错误'}`,
						};
			} catch (error) {
				if (isMountedRef.current) console.error(error);
				return { isSuccess: false, error: describeError(error) };
			} finally {
				isExportingRef.current = false;
				if (isMountedRef.current) setIsExporting(false);
			}
		},
		[clearDirtyIfRevision, promoteActiveCheckpoint, readCurrentSnapshot]
	);

	const value = useMemo(
		() => ({
			activeWorkspaceId,
			assets: assetState,
			copyAssets,
			createAssetFolder,
			exportArchive,
			flushLocalSave,
			getAssetUrl,
			hasUnexportedChanges,
			isAssetGenerationCurrent,
			isExporting,
			isLocalSavePending,
			license,
			localSaveError: saveError,
			localSaveStatus: saveStatus,
			moveAssets,
			removeAsset,
			removeAssets,
			removeAssetFolders,
			replaceLicense,
			resourcePack,
			retryLocalSave,
			revision,
			storageMode,
			updateAsset,
			updateAssets,
			updateResourcePack,
		}),
		[
			activeWorkspaceId,
			assetState,
			copyAssets,
			createAssetFolder,
			exportArchive,
			flushLocalSave,
			getAssetUrl,
			hasUnexportedChanges,
			isAssetGenerationCurrent,
			isExporting,
			isLocalSavePending,
			license,
			moveAssets,
			removeAsset,
			removeAssets,
			removeAssetFolders,
			replaceLicense,
			resourcePack,
			retryLocalSave,
			revision,
			saveError,
			saveStatus,
			storageMode,
			updateAsset,
			updateAssets,
			updateResourcePack,
		]
	);

	return (
		<ResourceEditorContext.Provider value={value}>
			{children}
		</ResourceEditorContext.Provider>
	);
}
