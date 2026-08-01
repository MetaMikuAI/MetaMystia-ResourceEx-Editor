export function findNextAvailableInteger(
	usedValues: Iterable<number>,
	minimum: number
): number {
	const usedValueSet = new Set(usedValues);
	let candidate = minimum;

	while (usedValueSet.has(candidate)) {
		candidate += 1;
	}

	return candidate;
}

export function findNextAvailableSuffixedValue(
	usedValues: Iterable<string>,
	prefix: string
): string {
	const usedValueSet = new Set(usedValues);
	let suffix = 1;
	let candidate = `${prefix}${suffix}`;

	while (usedValueSet.has(candidate)) {
		suffix += 1;
		candidate = `${prefix}${suffix}`;
	}

	return candidate;
}
