export interface ISafeStorage {
	getItem<T extends string = string>(key: string): T | null;
	removeItem(key: string): void;
	setItem(key: string, value: string): void;
}
