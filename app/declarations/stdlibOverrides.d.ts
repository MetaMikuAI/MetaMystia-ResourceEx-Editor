interface ArrayConstructor {
	isArray(arg: unknown): arg is unknown[];
}

interface JSON {
	parse(
		text: string,
		reviver?: (this: unknown, key: string, value: unknown) => unknown
	): unknown;
}
