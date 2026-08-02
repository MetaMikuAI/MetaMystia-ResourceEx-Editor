export const WORKSPACE_CATALOG_CHANNEL_NAME = 'resourceEditorWorkspaceCatalog';

interface IWorkspaceCatalogChannel {
	addEventListener(
		type: 'message',
		listener: (event: { data: unknown }) => void
	): void;
	close(): void;
	postMessage(message: unknown): void;
	removeEventListener(
		type: 'message',
		listener: (event: { data: unknown }) => void
	): void;
}

interface ICreateWorkspaceCatalogSyncInput {
	channel: IWorkspaceCatalogChannel | null;
	onCatalogChange(): void;
}

export interface IWorkspaceCatalogSync {
	dispose(): void;
	notify(): void;
}

const CATALOG_CHANGED_MESSAGE = { type: 'workspace-catalog-changed' } as const;

function isCatalogChangedMessage(value: unknown) {
	return (
		typeof value === 'object' &&
		value !== null &&
		Reflect.get(value, 'type') === CATALOG_CHANGED_MESSAGE.type
	);
}

export function createWorkspaceCatalogSync({
	channel,
	onCatalogChange,
}: ICreateWorkspaceCatalogSyncInput): IWorkspaceCatalogSync {
	let isDisposed = false;
	const handleMessage = (event: { data: unknown }) => {
		if (isDisposed || !isCatalogChangedMessage(event.data)) return;
		onCatalogChange();
	};
	channel?.addEventListener('message', handleMessage);

	return {
		dispose() {
			if (isDisposed) return;
			isDisposed = true;
			channel?.removeEventListener('message', handleMessage);
			channel?.close();
		},
		notify() {
			if (isDisposed) return;
			channel?.postMessage(CATALOG_CHANGED_MESSAGE);
		},
	};
}
