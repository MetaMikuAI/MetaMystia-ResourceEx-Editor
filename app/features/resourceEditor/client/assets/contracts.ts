export interface IAssetPathOperation {
	from: string;
	to: string;
}

export interface IAssetMutationResult {
	isSuccess: boolean;
	error?: string;
}

export interface IAssetState {
	folders: readonly string[];
	generation: number;
	urls: Readonly<Record<string, string>>;
}

export interface IAssetSnapshot {
	files: ReadonlyMap<string, Blob>;
	folders: readonly string[];
}
