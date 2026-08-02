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
	onLeaseReleaseRequest(workspaceId: string, leaseId: string): void;
	onWorkspaceTakeover(workspaceId: string, ownerId: string): void;
}

export interface IWorkspaceCatalogSync {
	dispose(): void;
	notify(): void;
	notifyWorkspaceTakeover(workspaceId: string, ownerId: string): void;
	requestLeaseRelease(workspaceId: string, leaseId: string): void;
}

const CATALOG_CHANGED_MESSAGE = { type: 'workspace-catalog-changed' } as const;
const LEASE_RELEASE_REQUEST_MESSAGE_TYPE =
	'workspace-lease-release-request' as const;
const WORKSPACE_TAKEN_OVER_MESSAGE_TYPE = 'workspace-taken-over' as const;

function isCatalogChangedMessage(value: unknown) {
	return (
		typeof value === 'object' &&
		value !== null &&
		Reflect.get(value, 'type') === CATALOG_CHANGED_MESSAGE.type
	);
}

function readLeaseReleaseRequest(value: unknown) {
	if (typeof value !== 'object' || value === null) return null;
	if (
		Reflect.get(value, 'type') !== LEASE_RELEASE_REQUEST_MESSAGE_TYPE ||
		typeof Reflect.get(value, 'workspaceId') !== 'string' ||
		typeof Reflect.get(value, 'leaseId') !== 'string'
	) {
		return null;
	}
	return {
		leaseId: Reflect.get(value, 'leaseId') as string,
		workspaceId: Reflect.get(value, 'workspaceId') as string,
	};
}

function readWorkspaceTakeover(value: unknown) {
	if (typeof value !== 'object' || value === null) return null;
	if (
		Reflect.get(value, 'type') !== WORKSPACE_TAKEN_OVER_MESSAGE_TYPE ||
		typeof Reflect.get(value, 'workspaceId') !== 'string' ||
		typeof Reflect.get(value, 'ownerId') !== 'string'
	) {
		return null;
	}
	return {
		ownerId: Reflect.get(value, 'ownerId') as string,
		workspaceId: Reflect.get(value, 'workspaceId') as string,
	};
}

export function createWorkspaceCatalogSync({
	channel,
	onCatalogChange,
	onLeaseReleaseRequest,
	onWorkspaceTakeover,
}: ICreateWorkspaceCatalogSyncInput): IWorkspaceCatalogSync {
	let isDisposed = false;
	const handleMessage = (event: { data: unknown }) => {
		if (isDisposed) return;
		if (isCatalogChangedMessage(event.data)) {
			onCatalogChange();
			return;
		}
		const request = readLeaseReleaseRequest(event.data);
		if (request) {
			onLeaseReleaseRequest(request.workspaceId, request.leaseId);
			return;
		}
		const takeover = readWorkspaceTakeover(event.data);
		if (takeover) {
			onWorkspaceTakeover(takeover.workspaceId, takeover.ownerId);
		}
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
		notifyWorkspaceTakeover(workspaceId, ownerId) {
			if (isDisposed) return;
			channel?.postMessage({
				ownerId,
				type: WORKSPACE_TAKEN_OVER_MESSAGE_TYPE,
				workspaceId,
			});
		},
		requestLeaseRelease(workspaceId, leaseId) {
			if (isDisposed) return;
			channel?.postMessage({
				leaseId,
				type: LEASE_RELEASE_REQUEST_MESSAGE_TYPE,
				workspaceId,
			});
		},
	};
}
