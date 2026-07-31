'use client';

import {
	type PropsWithChildren,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import type { ResourceEx } from '@/domain/resourcePack/contracts/resourceEx';
import { createBlankResourcePack } from '@/domain/resourcePack/createBlankResourcePack';

import { downloadResourcePack } from '@/features/resourceEditor/client/archive/downloadResourcePack';
import { readResourcePackArchive } from '@/features/resourceEditor/client/archive/readResourcePackArchive';
import { writeResourcePackArchive } from '@/features/resourceEditor/client/archive/writeResourcePackArchive';
import { useAssetStore } from '@/features/resourceEditor/client/assets/useAssetStore';

import type {
	IResourceEditorExportResult,
	IResourceEditorOperationResult,
} from './contracts';
import { runResourcePackExport } from './runResourcePackExport';
import { ResourceEditorContext } from './useResourceEditor';

function describeError(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}

const RESOURCE_EDITOR_UNMOUNTED_ERROR = '资源编辑器已卸载';

export function ResourceEditorProvider({ children }: PropsWithChildren) {
	const [resourcePack, setResourcePack] = useState<ResourceEx>(() =>
		createBlankResourcePack()
	);
	const [license, setLicense] = useState('');
	const [isDirty, setIsDirty] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [revision, setRevision] = useState(0);
	const isExportingRef = useRef(false);
	const isImportingRef = useRef(false);
	const isMountedRef = useRef(false);
	const licenseRef = useRef(license);
	const resourcePackRef = useRef(resourcePack);
	const revisionRef = useRef(revision);
	const bumpRevision = useCallback(() => {
		const nextRevision = revisionRef.current + 1;
		revisionRef.current = nextRevision;
		setRevision(nextRevision);
		return nextRevision;
	}, []);
	const markDirty = useCallback(() => {
		bumpRevision();
		setIsDirty(true);
	}, [bumpRevision]);
	const {
		assetState,
		clearAssets,
		copyAssets,
		createAssetFolder,
		getAssetSnapshot,
		getAssetUrl,
		moveAssets,
		removeAsset,
		removeAssetFolders,
		replaceAssets,
		updateAsset,
	} = useAssetStore(markDirty);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!isDirty) return;
			event.preventDefault();
			event.returnValue = '';
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		return () =>
			window.removeEventListener('beforeunload', handleBeforeUnload);
	}, [isDirty]);

	const updateResourcePack = useCallback(
		(updater: (current: ResourceEx) => ResourceEx) => {
			const nextResourcePack = updater(resourcePackRef.current);
			resourcePackRef.current = nextResourcePack;
			setResourcePack(nextResourcePack);
			markDirty();
		},
		[markDirty]
	);

	const replaceLicense = useCallback(
		(nextLicense: string) => {
			licenseRef.current = nextLicense;
			setLicense(nextLicense);
			markDirty();
		},
		[markDirty]
	);

	const importArchive = useCallback(
		async (file: File): Promise<IResourceEditorOperationResult> => {
			if (!isMountedRef.current) {
				return {
					isSuccess: false,
					error: RESOURCE_EDITOR_UNMOUNTED_ERROR,
				};
			}
			if (isImportingRef.current) {
				return { isSuccess: false, error: '资源包正在导入' };
			}
			isImportingRef.current = true;
			setIsImporting(true);
			try {
				const archive = await readResourcePackArchive(file);
				if (!isMountedRef.current) {
					return {
						isSuccess: false,
						error: RESOURCE_EDITOR_UNMOUNTED_ERROR,
					};
				}
				replaceAssets(archive.files, archive.folders);
				resourcePackRef.current = archive.resourcePack;
				licenseRef.current = archive.license;
				setResourcePack(archive.resourcePack);
				setLicense(archive.license);
				bumpRevision();
				setIsDirty(false);
				return { isSuccess: true };
			} catch (error) {
				if (isMountedRef.current) console.error(error);
				return { isSuccess: false, error: describeError(error) };
			} finally {
				isImportingRef.current = false;
				if (isMountedRef.current) setIsImporting(false);
			}
		},
		[bumpRevision, replaceAssets]
	);

	const createBlank = useCallback(() => {
		const nextResourcePack = createBlankResourcePack();
		clearAssets();
		resourcePackRef.current = nextResourcePack;
		licenseRef.current = '';
		setResourcePack(nextResourcePack);
		setLicense('');
		bumpRevision();
		setIsDirty(false);
	}, [bumpRevision, clearAssets]);

	const readExportSnapshot = useCallback(
		(expectedRevision: number) => {
			if (!isMountedRef.current) return null;
			if (revisionRef.current !== expectedRevision) return null;
			const assets = getAssetSnapshot();
			if (revisionRef.current !== expectedRevision) return null;
			return {
				...assets,
				license: licenseRef.current,
				resourcePack: resourcePackRef.current,
				revision: expectedRevision,
			};
		},
		[getAssetSnapshot]
	);

	const clearDirtyIfRevision = useCallback((expectedRevision: number) => {
		if (!isMountedRef.current) return false;
		if (revisionRef.current !== expectedRevision) return false;
		setIsDirty(false);
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
				return await runResourcePackExport({
					clearDirtyIfRevision,
					downloadArchive: downloadResourcePack,
					expectedRevision,
					...(filename === undefined ? {} : { filename }),
					readCurrentRevision: () => revisionRef.current,
					readSnapshot: readExportSnapshot,
					writeArchive: writeResourcePackArchive,
				});
			} catch (error) {
				if (isMountedRef.current) console.error(error);
				return { isSuccess: false, error: describeError(error) };
			} finally {
				isExportingRef.current = false;
				if (isMountedRef.current) setIsExporting(false);
			}
		},
		[clearDirtyIfRevision, readExportSnapshot]
	);

	const value = useMemo(
		() => ({
			assets: assetState,
			copyAssets,
			createAssetFolder,
			createBlankResourcePack: createBlank,
			exportArchive,
			getAssetUrl,
			importArchive,
			isDirty,
			isExporting,
			isImporting,
			license,
			moveAssets,
			removeAsset,
			removeAssetFolders,
			replaceLicense,
			resourcePack,
			revision,
			updateAsset,
			updateResourcePack,
		}),
		[
			assetState,
			copyAssets,
			createAssetFolder,
			createBlank,
			exportArchive,
			getAssetUrl,
			importArchive,
			isDirty,
			isExporting,
			isImporting,
			license,
			moveAssets,
			removeAsset,
			removeAssetFolders,
			replaceLicense,
			resourcePack,
			revision,
			updateAsset,
			updateResourcePack,
		]
	);

	return (
		<ResourceEditorContext.Provider value={value}>
			{children}
		</ResourceEditorContext.Provider>
	);
}
