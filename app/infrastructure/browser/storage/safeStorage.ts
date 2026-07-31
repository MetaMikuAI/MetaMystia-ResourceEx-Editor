import 'client-only';

import type { ISafeStorage } from './contracts';

type TStorageLayer = 'local' | 'memory' | 'session';

function getAvailableStorage(layer: Exclude<TStorageLayer, 'memory'>) {
	try {
		const storage = layer === 'local' ? localStorage : sessionStorage;
		const testKey = '__safeStorageTest__';

		storage.setItem(testKey, '');
		storage.removeItem(testKey);
		return storage;
	} catch {
		return null;
	}
}

class SafeStorage implements ISafeStorage {
	private storage: Storage | null;
	private storageLayer: TStorageLayer;
	private canReadStorage = true;
	private readonly shadow = new Map<string, string>();
	private readonly tombstones = new Set<string>();

	public constructor() {
		const localStorageValue = getAvailableStorage('local');
		if (localStorageValue !== null) {
			this.storage = localStorageValue;
			this.storageLayer = 'local';
			return;
		}

		const sessionStorageValue = getAvailableStorage('session');
		this.storage = sessionStorageValue;
		this.storageLayer = sessionStorageValue === null ? 'memory' : 'session';
	}

	private copyStateTo(storage: Storage) {
		try {
			this.shadow.forEach((value, key) => storage.setItem(key, value));
			this.tombstones.forEach((key) => storage.removeItem(key));
			return true;
		} catch {
			return false;
		}
	}

	private downgrade() {
		this.canReadStorage = false;

		if (this.storageLayer === 'local') {
			const sessionStorageValue = getAvailableStorage('session');
			if (
				sessionStorageValue !== null &&
				this.copyStateTo(sessionStorageValue)
			) {
				this.storage = sessionStorageValue;
				this.storageLayer = 'session';
				return;
			}
		}

		this.storage = null;
		this.storageLayer = 'memory';
	}

	public getItem<T extends string = string>(key: string): T | null {
		if (this.storage === null || !this.canReadStorage) {
			if (this.tombstones.has(key)) {
				return null;
			}

			return (this.shadow.get(key) as T | undefined) ?? null;
		}

		try {
			const value = this.storage.getItem(key);
			if (value === null) {
				this.shadow.delete(key);
				this.tombstones.add(key);
				return null;
			}

			this.shadow.set(key, value);
			this.tombstones.delete(key);
			return value as T;
		} catch {
			const shadowValue = this.shadow.get(key);
			if (shadowValue === undefined && !this.tombstones.has(key)) {
				this.tombstones.add(key);
			}

			this.downgrade();
			return (shadowValue as T | undefined) ?? null;
		}
	}

	public removeItem(key: string) {
		this.shadow.delete(key);
		this.tombstones.add(key);

		if (this.storage === null) {
			return;
		}

		try {
			this.storage.removeItem(key);
		} catch {
			this.downgrade();
		}
	}

	public setItem(key: string, value: string) {
		this.shadow.set(key, value);
		this.tombstones.delete(key);

		if (this.storage === null) {
			return;
		}

		try {
			this.storage.setItem(key, value);
		} catch {
			this.downgrade();
		}
	}
}

export const safeStorage = new SafeStorage();
