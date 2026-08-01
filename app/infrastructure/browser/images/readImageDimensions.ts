import 'client-only';

export interface IImageDimensions {
	height: number;
	width: number;
}

function createAbortError() {
	return new DOMException('图片尺寸读取已取消', 'AbortError');
}

export function readImageDimensions(
	imageFile: Blob,
	signal?: AbortSignal
): Promise<IImageDimensions> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		let objectUrl: string | undefined;
		let isCleanedUp = false;

		const cleanup = () => {
			if (isCleanedUp) {
				return;
			}
			isCleanedUp = true;
			image.onerror = null;
			image.onload = null;
			signal?.removeEventListener('abort', handleAbort);
			if (objectUrl !== undefined) {
				URL.revokeObjectURL(objectUrl);
			}
		};

		const rejectWithCleanup = (error: Error) => {
			cleanup();
			reject(error);
		};

		const handleAbort = () => {
			rejectWithCleanup(createAbortError());
		};

		if (signal?.aborted) {
			handleAbort();
			return;
		}

		image.onload = () => {
			const dimensions = {
				height: image.naturalHeight,
				width: image.naturalWidth,
			};
			cleanup();
			resolve(dimensions);
		};
		image.onerror = () => {
			rejectWithCleanup(new Error('无法读取图片尺寸'));
		};
		signal?.addEventListener('abort', handleAbort, { once: true });

		try {
			objectUrl = URL.createObjectURL(imageFile);
			image.src = objectUrl;
		} catch (error) {
			rejectWithCleanup(
				error instanceof Error ? error : new Error(String(error))
			);
		}
	});
}
