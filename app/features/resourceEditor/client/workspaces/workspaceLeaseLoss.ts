const WORKSPACE_LEASE_LOSS_COPY_SUFFIX = '（接管前修改）';

export function createWorkspaceLeaseLossCopyName(
	displayName: string,
	occupiedDisplayNames: readonly string[]
) {
	const occupiedNames = new Set(occupiedDisplayNames);
	const copyName = `${displayName}${WORKSPACE_LEASE_LOSS_COPY_SUFFIX}`;
	let copyIndex = 1;
	while (true) {
		const candidate =
			copyIndex === 1 ? copyName : `${copyName} (${copyIndex})`;
		if (!occupiedNames.has(candidate)) return candidate;
		copyIndex += 1;
	}
}
