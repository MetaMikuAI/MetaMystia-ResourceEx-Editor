'use client';

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useRef,
	type PropsWithChildren,
	memo,
} from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import type { ResourceEx } from '@/types/resource';

interface DataContextType {
	data: ResourceEx;
	setData: (data: ResourceEx) => void;

	// Asset management
	assetUrls: Record<string, string>;
	updateAsset: (path: string, blob: Blob) => void;
	removeAsset: (path: string) => void;
	getAssetUrl: (path: string) => string | undefined;

	// File operations
	loadResourcePack: (file: File) => Promise<void>;
	saveResourcePack: (filename?: string) => Promise<void>;
	createBlank: () => void;

	hasUnsavedChanges: boolean;
	setHasUnsavedChanges: (value: boolean) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = memo<PropsWithChildren>(function DataProvider({
	children,
}) {
	const [data, setData] = useState<ResourceEx>({
		characters: [],
		dialogPackages: [],
	});
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	// Store blobs in a Ref to avoid re-renders on every small change
	const assetsRef = useRef<Map<string, Blob>>(new Map());
	// Store URLs in state for UI rendering
	const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});

	// Track all URLs for cleanup
	const allGeneratedUrls = useRef<Set<string>>(new Set());

	const registerUrl = useCallback((url: string) => {
		allGeneratedUrls.current.add(url);
		return url;
	}, []);

	const revokeUrl = useCallback((url: string | undefined) => {
		if (url) {
			URL.revokeObjectURL(url);
			allGeneratedUrls.current.delete(url);
		}
	}, []);

	useEffect(() => {
		return () => {
			// Cleanup all URLs on unmount
			allGeneratedUrls.current.forEach((url) => URL.revokeObjectURL(url));
		};
	}, []);

	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges) {
				e.preventDefault();
				e.returnValue = '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, [hasUnsavedChanges]);

	const updateAsset = useCallback(
		(path: string, blob: Blob) => {
			assetsRef.current.set(path, blob);

			setAssetUrls((prev) => {
				if (prev[path]) revokeUrl(prev[path]);
				const newUrl = registerUrl(URL.createObjectURL(blob));
				return { ...prev, [path]: newUrl };
			});
			setHasUnsavedChanges(true);
		},
		[registerUrl, revokeUrl]
	);

	const removeAsset = useCallback(
		(path: string) => {
			assetsRef.current.delete(path);
			setAssetUrls((prev) => {
				if (prev[path]) revokeUrl(prev[path]);
				const next = { ...prev };
				delete next[path];
				return next;
			});
			setHasUnsavedChanges(true);
		},
		[revokeUrl]
	);

	const getAssetUrl = useCallback(
		(path: string) => {
			return assetUrls[path];
		},
		[assetUrls]
	);

	const loadResourcePack = useCallback(
		async (file: File) => {
			if (
				hasUnsavedChanges &&
				!confirm(
					'当前有未保存的更改，导入新资源包将丢失这些更改，确定要继续吗？'
				)
			) {
				return;
			}
			try {
				const zip = await JSZip.loadAsync(file);

				// Load ResourceEx.json
				const jsonFile = zip.file('ResourceEx.json');
				if (!jsonFile) {
					alert('压缩包中未找到 ResourceEx.json');
					return;
				}
				const jsonStr = await jsonFile.async('string');
				let jsonData = JSON.parse(jsonStr) as ResourceEx;

				// Data migration / normalization
				if (jsonData.characters) {
					jsonData.characters = jsonData.characters.map((char) => ({
						...char,
						descriptions: char.descriptions
							? [...char.descriptions, '', '', ''].slice(0, 3)
							: ['', '', ''],
						guest: char.guest
							? {
									...char.guest,
									evaluation: char.guest.evaluation
										? [
												...char.guest.evaluation,
												...Array(9).fill(''),
											].slice(0, 9)
										: Array(9).fill(''),
									foodRequests: char.guest.foodRequests || [],
									bevRequests: char.guest.bevRequests || [],
								}
							: undefined,
					}));
				}

				// Clear old assets
				assetsRef.current.forEach((_, path) => {
					if (assetUrls[path]) revokeUrl(assetUrls[path]);
				});
				assetsRef.current = new Map();

				const newAssetUrls: Record<string, string> = {};

				// Load new assets
				const entries = Object.keys(zip.files)
					.map((name) => zip.files[name])
					.filter((entry) => entry !== undefined);
				for (const entry of entries) {
					if (
						!entry.dir &&
						entry.name !== 'ResourceEx.json' &&
						!entry.name.startsWith('__MACOSX')
					) {
						const blob = await entry.async('blob');
						assetsRef.current.set(entry.name, blob);
						newAssetUrls[entry.name] = registerUrl(
							URL.createObjectURL(blob)
						);
					}
				}

				setAssetUrls(newAssetUrls);
				setData(jsonData);
				setHasUnsavedChanges(false);
			} catch (e) {
				console.error(e);
				alert(
					'读取资源包失败: ' +
						(e instanceof Error ? e.message : String(e))
				);
			}
		},
		[hasUnsavedChanges, assetUrls, registerUrl, revokeUrl]
	);

	const saveResourcePack = useCallback(
		async (filename = 'ResourceExPack.zip') => {
			const zip = new JSZip();

			// Sanitize data before export
			const exportData = {
				...data,
				characters: data.characters.map((char) => {
					if (!char.guest) {
						return char;
					}
					const activeLikeFoodTagIds = char.guest.likeFoodTag.map(
						(t) => t.tagId
					);
					const activeLikeBevTagIds = char.guest.likeBevTag.map(
						(t) => t.tagId
					);
					return {
						...char,
						guest: {
							...char.guest,
							foodRequests: char.guest.foodRequests.filter(
								({ tagId }) =>
									activeLikeFoodTagIds.includes(tagId)
							),
							bevRequests: (char.guest.bevRequests || []).filter(
								({ tagId }) =>
									activeLikeBevTagIds.includes(tagId)
							),
						},
					};
				}),
			};

			zip.file('ResourceEx.json', JSON.stringify(exportData, null, 2));

			// Add assets
			assetsRef.current.forEach((blob, path) => {
				zip.file(path, blob);
			});

			const content = await zip.generateAsync({ type: 'blob' });
			saveAs(content, filename);
			setHasUnsavedChanges(false);
		},
		[data]
	);

	const createBlank = useCallback(() => {
		if (
			hasUnsavedChanges &&
			!confirm('当前有未保存的更改，确定要清空吗？')
		) {
			return;
		}
		// Clear data
		setData({ characters: [], dialogPackages: [] });
		// Clear assets
		Object.values(assetUrls).forEach((url) => revokeUrl(url));
		assetsRef.current = new Map();
		setAssetUrls({});
		setHasUnsavedChanges(false);
	}, [hasUnsavedChanges, assetUrls, revokeUrl]);

	return (
		<DataContext.Provider
			value={{
				data,
				setData,
				assetUrls,
				updateAsset,
				removeAsset,
				getAssetUrl,
				loadResourcePack,
				saveResourcePack,
				createBlank,
				hasUnsavedChanges,
				setHasUnsavedChanges,
			}}
		>
			{children}
		</DataContext.Provider>
	);
});

export function useData() {
	const context = useContext(DataContext);

	if (!context) {
		throw new Error('useData must be used within a DataProvider');
	}

	return context;
}
