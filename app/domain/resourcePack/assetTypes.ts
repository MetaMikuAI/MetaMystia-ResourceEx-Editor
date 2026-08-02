const IMAGE_ASSET_EXTENSIONS = [
	'.png',
	'.jpg',
	'.jpeg',
	'.gif',
	'.webp',
	'.bmp',
	'.svg',
] as const;

export const IMAGE_ASSET_FILE_ACCEPT = IMAGE_ASSET_EXTENSIONS.join(',');

export function isImageAssetPath(path: string): boolean {
	const lowerPath = path.toLowerCase();
	return IMAGE_ASSET_EXTENSIONS.some((extension) =>
		lowerPath.endsWith(extension)
	);
}

export function isWavAssetPath(path: string): boolean {
	return path.toLowerCase().endsWith('.wav');
}
