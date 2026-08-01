export function cloneJsonObject<T extends object>(jsonObject: T) {
	return JSON.parse(JSON.stringify(jsonObject)) as T;
}
