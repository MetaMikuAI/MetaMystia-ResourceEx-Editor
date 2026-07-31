export interface IAssetPathOperation {
	from: string;
	to: string;
}

export interface IAssetState {
	urls: Readonly<Record<string, string>>;
	folders: readonly string[];
}

export interface IAssetSnapshot {
	files: ReadonlyMap<string, Blob>;
	folders: readonly string[];
}
