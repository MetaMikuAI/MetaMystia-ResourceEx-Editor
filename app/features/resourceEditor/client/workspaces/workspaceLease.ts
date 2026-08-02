import type { IWorkspaceLeaseResult } from './contracts';

export const WORKSPACE_LEASE_DURATION_MS = 30_000;
export const WORKSPACE_LEASE_RENEW_INTERVAL_MS = 10_000;
const WORKSPACE_OWNER_ID_STORAGE_KEY = 'resourceEditorWorkspaceOwnerId';

interface IWorkspaceSessionStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

interface IWorkspaceOwnerChannel {
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

interface IClaimWorkspaceOwnerInput {
	channel: IWorkspaceOwnerChannel | null;
	createId(): string;
	storage: IWorkspaceSessionStorage;
	waitForClaims(): Promise<void>;
}

export interface IWorkspaceOwnerClaim {
	dispose(): void;
	ownerId: string;
}

interface IWorkspaceLeaseRepository {
	acquireLease(
		id: string,
		ownerId: string,
		leaseId: string,
		expiresAt: number,
		isTakeover?: boolean
	): Promise<IWorkspaceLeaseResult>;
	releaseLease(id: string, leaseId: string): Promise<void>;
	renewLease(
		id: string,
		leaseId: string,
		expiresAt: number
	): Promise<IWorkspaceLeaseResult>;
}

interface ICreateWorkspaceLeaseControllerInput {
	clearInterval(intervalId: number): void;
	createLeaseId(): string;
	now(): number;
	onLeaseLost(ownerId?: string): void;
	ownerId: string;
	repository: IWorkspaceLeaseRepository;
	setInterval(callback: () => void, intervalMs: number): number;
}

export interface IWorkspaceLeaseController {
	acquire(workspaceId: string): Promise<IWorkspaceLeaseResult>;
	dispose(): void;
	release(): Promise<void>;
	takeOver(workspaceId: string): Promise<IWorkspaceLeaseResult>;
}

export function readWorkspaceOwnerId(
	storage: IWorkspaceSessionStorage,
	createId: () => string
): string {
	try {
		const storedOwnerId = storage.getItem(WORKSPACE_OWNER_ID_STORAGE_KEY);
		if (storedOwnerId) return storedOwnerId;
		const ownerId = createId();
		storage.setItem(WORKSPACE_OWNER_ID_STORAGE_KEY, ownerId);
		return ownerId;
	} catch {
		return createId();
	}
}

export async function claimWorkspaceOwnerId({
	channel,
	createId,
	storage,
	waitForClaims,
}: IClaimWorkspaceOwnerInput): Promise<IWorkspaceOwnerClaim> {
	let ownerId = readWorkspaceOwnerId(storage, createId);
	if (!channel) return { dispose: () => undefined, ownerId };
	const requestId = createId();
	let hasCollision = false;
	const handleMessage = (event: { data: unknown }) => {
		if (!event.data || typeof event.data !== 'object') return;
		const message = event.data as Record<string, unknown>;
		if (
			message['type'] === 'probe' &&
			message['ownerId'] === ownerId &&
			message['requestId'] !== requestId &&
			typeof message['requestId'] === 'string'
		) {
			channel.postMessage({
				ownerId,
				requestId: message['requestId'],
				type: 'present',
			});
			return;
		}
		if (
			message['type'] === 'present' &&
			message['ownerId'] === ownerId &&
			message['requestId'] === requestId
		) {
			hasCollision = true;
		}
	};
	channel.addEventListener('message', handleMessage);
	channel.postMessage({ ownerId, requestId, type: 'probe' });
	await waitForClaims();
	if (hasCollision) {
		ownerId = createId();
		try {
			storage.setItem(WORKSPACE_OWNER_ID_STORAGE_KEY, ownerId);
		} catch {
			// The in-memory owner remains unique for this page.
		}
	}
	return {
		dispose() {
			channel.removeEventListener('message', handleMessage);
			channel.close();
		},
		ownerId,
	};
}

export function createWorkspaceLeaseController(
	input: ICreateWorkspaceLeaseControllerInput
): IWorkspaceLeaseController {
	let intervalId: number | undefined;
	let isDisposed = false;
	let leaseId: string | undefined;
	let workspaceId: string | undefined;

	const stopRenewal = () => {
		if (intervalId === undefined) return;
		input.clearInterval(intervalId);
		intervalId = undefined;
	};

	const clearLease = () => {
		stopRenewal();
		leaseId = undefined;
		workspaceId = undefined;
	};

	const startRenewal = () => {
		stopRenewal();
		intervalId = input.setInterval(() => {
			const activeLeaseId = leaseId;
			const activeWorkspaceId = workspaceId;
			if (!activeLeaseId || !activeWorkspaceId) return;
			void input.repository
				.renewLease(
					activeWorkspaceId,
					activeLeaseId,
					input.now() + WORKSPACE_LEASE_DURATION_MS
				)
				.then((result) => {
					if (
						leaseId !== activeLeaseId ||
						workspaceId !== activeWorkspaceId
					) {
						return;
					}
					if (result.isAcquired) return;
					clearLease();
					input.onLeaseLost(result.ownerId);
				})
				.catch(() => {
					if (
						leaseId !== activeLeaseId ||
						workspaceId !== activeWorkspaceId
					) {
						return;
					}
					clearLease();
					input.onLeaseLost();
				});
		}, WORKSPACE_LEASE_RENEW_INTERVAL_MS);
	};

	const release = async () => {
		const activeLeaseId = leaseId;
		const activeWorkspaceId = workspaceId;
		clearLease();
		if (activeLeaseId && activeWorkspaceId) {
			await input.repository.releaseLease(
				activeWorkspaceId,
				activeLeaseId
			);
		}
	};

	const acquire = async (
		nextWorkspaceId: string,
		isTakeover: boolean
	): Promise<IWorkspaceLeaseResult> => {
		if (isDisposed) throw new Error('资源包编辑状态已失效');
		const nextLeaseId = input.createLeaseId();
		const result = await input.repository.acquireLease(
			nextWorkspaceId,
			input.ownerId,
			nextLeaseId,
			input.now() + WORKSPACE_LEASE_DURATION_MS,
			isTakeover
		);
		if (!result.isAcquired) return result;
		const previousLeaseId = leaseId;
		const previousWorkspaceId = workspaceId;
		leaseId = nextLeaseId;
		workspaceId = nextWorkspaceId;
		startRenewal();
		if (previousLeaseId && previousWorkspaceId) {
			try {
				await input.repository.releaseLease(
					previousWorkspaceId,
					previousLeaseId
				);
			} catch {
				// The new lease is authoritative; the old lease expires naturally.
			}
		}
		return result;
	};

	return {
		acquire: (nextWorkspaceId) => acquire(nextWorkspaceId, false),
		dispose() {
			isDisposed = true;
			void release().catch(() => undefined);
		},
		release,
		takeOver: (nextWorkspaceId) => acquire(nextWorkspaceId, true),
	};
}
