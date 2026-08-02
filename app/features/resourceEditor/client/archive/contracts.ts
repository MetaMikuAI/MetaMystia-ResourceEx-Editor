import type { ResourceEx } from '@/domain/resourcePack/contracts/resourceEx';

export type TResourcePackArchiveInput = ArrayBuffer | Blob | Uint8Array;

export interface IReadResourcePackArchiveResult {
	files: ReadonlyMap<string, Blob>;
	folders: readonly string[];
	hasLicenseFile: boolean;
	license: string;
	resourcePack: ResourceEx;
}

export interface IWriteResourcePackArchiveInput {
	files: ReadonlyMap<string, Blob>;
	folders: readonly string[];
	hasLicenseFile: boolean;
	license: string;
	resourcePackJson: string;
}
