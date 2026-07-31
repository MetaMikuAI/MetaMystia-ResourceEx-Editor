import type { ResourceEx } from '@/domain/resourcePack/contracts/resourceEx';

export type TResourcePackArchiveInput = ArrayBuffer | Blob | Uint8Array;

export interface IReadResourcePackArchiveResult {
	resourcePack: ResourceEx;
	license: string;
	files: ReadonlyMap<string, Blob>;
	folders: readonly string[];
}

export interface IWriteResourcePackArchiveInput {
	resourcePackJson: string;
	license: string;
	files: ReadonlyMap<string, Blob>;
	folders: readonly string[];
	referencedPaths: ReadonlySet<string>;
}
