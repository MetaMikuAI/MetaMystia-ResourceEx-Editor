import type { IAssetPathOperation } from './contracts';

export interface IObjectUrlEnvironment {
	createObjectURL(blob: Blob): string;
	revokeObjectURL(url: string): void;
}

export interface IObjectUrlRegistry {
	create(blob: Blob): string;
	revoke(url: string | undefined): void;
	dispose(): void;
}

export interface IAssetMapsTransaction {
	files: Map<string, Blob>;
	hasChanged: boolean;
	urls: Map<string, string>;
	urlsToRevoke: readonly string[];
}

export function createObjectUrlRegistry(
	environment: IObjectUrlEnvironment
): IObjectUrlRegistry {
	const generatedUrls = new Set<string>();
	let isDisposed = false;
	return {
		create(blob) {
			if (isDisposed) {
				throw new Error('Object URL registry is disposed');
			}
			const url = environment.createObjectURL(blob);
			generatedUrls.add(url);
			return url;
		},
		revoke(url) {
			if (!url || !generatedUrls.delete(url)) return;
			environment.revokeObjectURL(url);
		},
		dispose() {
			if (isDisposed) return;
			isDisposed = true;
			for (const url of Array.from(generatedUrls)) {
				generatedUrls.delete(url);
				environment.revokeObjectURL(url);
			}
		},
	};
}

export function replaceAssetMaps(
	files: ReadonlyMap<string, Blob>,
	urlRegistry: IObjectUrlRegistry
): IAssetMapsTransaction {
	const nextFiles = new Map(files);
	const nextUrls = new Map<string, string>();
	const createdUrls: string[] = [];
	try {
		for (const [path, blob] of nextFiles) {
			const url = urlRegistry.create(blob);
			createdUrls.push(url);
			nextUrls.set(path, url);
		}
	} catch (error) {
		createdUrls.forEach(urlRegistry.revoke);
		throw error;
	}
	return {
		files: nextFiles,
		hasChanged: true,
		urls: nextUrls,
		urlsToRevoke: [],
	};
}

export function updateAssetMaps(
	files: ReadonlyMap<string, Blob>,
	urls: ReadonlyMap<string, string>,
	path: string,
	blob: Blob,
	urlRegistry: IObjectUrlRegistry
): IAssetMapsTransaction {
	const nextUrl = urlRegistry.create(blob);
	const previousUrl = urls.get(path);
	return {
		files: new Map(files).set(path, blob),
		hasChanged: true,
		urls: new Map(urls).set(path, nextUrl),
		urlsToRevoke: previousUrl ? [previousUrl] : [],
	};
}

export function removeAssetMaps(
	files: ReadonlyMap<string, Blob>,
	urls: ReadonlyMap<string, string>,
	path: string
): IAssetMapsTransaction {
	const nextFiles = new Map(files);
	const nextUrls = new Map(urls);
	const previousUrl = nextUrls.get(path);
	nextFiles.delete(path);
	nextUrls.delete(path);
	return {
		files: nextFiles,
		hasChanged: previousUrl !== undefined || files.has(path),
		urls: nextUrls,
		urlsToRevoke: previousUrl ? [previousUrl] : [],
	};
}

export function copyAssetMaps(
	files: ReadonlyMap<string, Blob>,
	urls: ReadonlyMap<string, string>,
	operations: readonly IAssetPathOperation[],
	urlRegistry: IObjectUrlRegistry
): IAssetMapsTransaction {
	const nextFiles = new Map(files);
	const nextUrls = new Map(urls);
	const createdUrls: string[] = [];
	const urlsToRevoke: string[] = [];
	try {
		for (const { from, to } of operations) {
			if (from === to) continue;
			const blob = nextFiles.get(from);
			if (!blob) continue;
			const url = urlRegistry.create(blob);
			createdUrls.push(url);
			const overwrittenUrl = nextUrls.get(to);
			if (overwrittenUrl) urlsToRevoke.push(overwrittenUrl);
			nextFiles.set(to, blob);
			nextUrls.set(to, url);
		}
	} catch (error) {
		createdUrls.forEach(urlRegistry.revoke);
		throw error;
	}
	return {
		files: nextFiles,
		hasChanged: createdUrls.length > 0,
		urls: nextUrls,
		urlsToRevoke,
	};
}

export function moveAssetMaps(
	files: ReadonlyMap<string, Blob>,
	urls: ReadonlyMap<string, string>,
	operations: readonly IAssetPathOperation[]
): IAssetMapsTransaction {
	const nextFiles = new Map(files);
	const nextUrls = new Map(urls);
	const urlsToRevoke: string[] = [];
	let hasChanged = false;
	for (const { from, to } of operations) {
		if (from === to) continue;
		const blob = nextFiles.get(from);
		const url = nextUrls.get(from);
		if (!blob || !url) continue;
		const overwrittenUrl = nextUrls.get(to);
		if (overwrittenUrl && overwrittenUrl !== url) {
			urlsToRevoke.push(overwrittenUrl);
		}
		nextFiles.delete(from);
		nextUrls.delete(from);
		nextFiles.set(to, blob);
		nextUrls.set(to, url);
		hasChanged = true;
	}
	return { files: nextFiles, hasChanged, urls: nextUrls, urlsToRevoke };
}
