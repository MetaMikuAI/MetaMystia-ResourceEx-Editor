'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
	copyAssetMaps,
	createObjectUrlRegistry,
	type IAssetMapsTransaction,
	type IObjectUrlRegistry,
	moveAssetMaps,
	removeAssetMaps,
	replaceAssetMaps,
	updateAssetMaps,
} from './assetStoreTransactions';
import type {
	IAssetPathOperation,
	IAssetSnapshot,
	IAssetState,
} from './contracts';

const EMPTY_FOLDERS = ['assets/'] as const;
const EMPTY_ASSET_STATE: IAssetState = { folders: EMPTY_FOLDERS, urls: {} };

function normalizeFolders(folders: readonly string[]) {
	const normalized = new Set<string>(EMPTY_FOLDERS);
	folders.forEach((folder) => {
		if (folder.startsWith('assets/')) {
			normalized.add(folder.endsWith('/') ? folder : `${folder}/`);
		}
	});
	return Array.from(normalized).sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function mapUrlsToRecord(urls: ReadonlyMap<string, string>) {
	return Object.fromEntries(urls) as Record<string, string>;
}

export function useAssetStore(onMutation: () => void) {
	const filesRef = useRef<Map<string, Blob>>(new Map());
	const foldersRef = useRef<readonly string[]>(EMPTY_FOLDERS);
	const isMountedRef = useRef(false);
	const urlsRef = useRef<Map<string, string>>(new Map());
	const urlRegistryRef = useRef<IObjectUrlRegistry | null>(null);
	const [assetState, setAssetState] =
		useState<IAssetState>(EMPTY_ASSET_STATE);

	useEffect(() => {
		const urlRegistry = createObjectUrlRegistry({
			createObjectURL: (blob) => URL.createObjectURL(blob),
			revokeObjectURL: (url) => URL.revokeObjectURL(url),
		});
		isMountedRef.current = true;
		urlRegistryRef.current = urlRegistry;
		return () => {
			if (urlRegistryRef.current === urlRegistry) {
				isMountedRef.current = false;
				urlRegistryRef.current = null;
			}
			urlRegistry.dispose();
		};
	}, []);

	const readActiveUrlRegistry = useCallback(() => {
		if (!isMountedRef.current) return null;
		return urlRegistryRef.current;
	}, []);

	const commitTransaction = useCallback(
		(
			transaction: IAssetMapsTransaction,
			urlRegistry: IObjectUrlRegistry
		) => {
			filesRef.current = transaction.files;
			urlsRef.current = transaction.urls;
			const publishedUrls = mapUrlsToRecord(transaction.urls);
			setAssetState((current) => ({ ...current, urls: publishedUrls }));
			transaction.urlsToRevoke.forEach(urlRegistry.revoke);
		},
		[]
	);

	const replaceAssets = useCallback(
		(files: ReadonlyMap<string, Blob>, folders: readonly string[]) => {
			const urlRegistry = readActiveUrlRegistry();
			if (!urlRegistry) return;
			const transaction = replaceAssetMaps(files, urlRegistry);
			const previousUrls = urlsRef.current;
			const nextFolders = normalizeFolders(folders);
			filesRef.current = transaction.files;
			foldersRef.current = nextFolders;
			urlsRef.current = transaction.urls;
			setAssetState({
				folders: nextFolders,
				urls: mapUrlsToRecord(transaction.urls),
			});
			previousUrls.forEach(urlRegistry.revoke);
		},
		[readActiveUrlRegistry]
	);

	const clearAssets = useCallback(() => {
		const urlRegistry = readActiveUrlRegistry();
		if (!urlRegistry) return;
		const previousUrls = urlsRef.current;
		filesRef.current = new Map();
		foldersRef.current = EMPTY_FOLDERS;
		urlsRef.current = new Map();
		setAssetState(EMPTY_ASSET_STATE);
		previousUrls.forEach(urlRegistry.revoke);
	}, [readActiveUrlRegistry]);

	const updateAsset = useCallback(
		(path: string, blob: Blob) => {
			const urlRegistry = readActiveUrlRegistry();
			if (!urlRegistry) return;
			const transaction = updateAssetMaps(
				filesRef.current,
				urlsRef.current,
				path,
				blob,
				urlRegistry
			);
			commitTransaction(transaction, urlRegistry);
			onMutation();
		},
		[commitTransaction, onMutation, readActiveUrlRegistry]
	);

	const removeAsset = useCallback(
		(path: string) => {
			const urlRegistry = readActiveUrlRegistry();
			if (!urlRegistry) return;
			const transaction = removeAssetMaps(
				filesRef.current,
				urlsRef.current,
				path
			);
			if (!transaction.hasChanged) return;
			commitTransaction(transaction, urlRegistry);
			onMutation();
		},
		[commitTransaction, onMutation, readActiveUrlRegistry]
	);

	const createAssetFolder = useCallback(
		(path: string) => {
			if (!isMountedRef.current) return;
			const folder = path.endsWith('/') ? path : `${path}/`;
			const nextFolders = normalizeFolders([
				...foldersRef.current,
				folder,
			]);
			foldersRef.current = nextFolders;
			setAssetState((current) => ({ ...current, folders: nextFolders }));
			onMutation();
		},
		[onMutation]
	);

	const removeAssetFolders = useCallback(
		(paths: readonly string[]) => {
			if (!isMountedRef.current) return;
			const folders = paths.map((path) =>
				path.endsWith('/') ? path : `${path}/`
			);
			if (folders.length === 0) return;
			const nextFolders = normalizeFolders(
				foldersRef.current.filter(
					(folder) =>
						folder === 'assets/' ||
						!folders.some(
							(target) =>
								folder === target || folder.startsWith(target)
						)
				)
			);
			foldersRef.current = nextFolders;
			setAssetState((current) => ({ ...current, folders: nextFolders }));
			onMutation();
		},
		[onMutation]
	);

	const moveAssets = useCallback(
		(operations: readonly IAssetPathOperation[]) => {
			const urlRegistry = readActiveUrlRegistry();
			if (!urlRegistry) return;
			if (operations.length === 0) return;
			const transaction = moveAssetMaps(
				filesRef.current,
				urlsRef.current,
				operations
			);
			if (!transaction.hasChanged) return;
			commitTransaction(transaction, urlRegistry);
			onMutation();
		},
		[commitTransaction, onMutation, readActiveUrlRegistry]
	);

	const copyAssets = useCallback(
		(operations: readonly IAssetPathOperation[]) => {
			const urlRegistry = readActiveUrlRegistry();
			if (!urlRegistry) return;
			if (operations.length === 0) return;
			const transaction = copyAssetMaps(
				filesRef.current,
				urlsRef.current,
				operations,
				urlRegistry
			);
			if (!transaction.hasChanged) return;
			commitTransaction(transaction, urlRegistry);
			onMutation();
		},
		[commitTransaction, onMutation, readActiveUrlRegistry]
	);

	const getAssetUrl = useCallback((path: string | undefined) => {
		return path ? urlsRef.current.get(path) : undefined;
	}, []);

	const getAssetSnapshot = useCallback((): IAssetSnapshot => {
		return {
			files: new Map(filesRef.current),
			folders: [...foldersRef.current],
		};
	}, []);

	return {
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
	};
}
