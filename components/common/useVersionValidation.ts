import { useMemo } from 'react';

/**
 * 语义化版本规范验证 Hook
 */
export function useVersionValidation(version: string | undefined) {
	return useMemo(() => {
		if (!version) return true;
		const semVerRegex =
			/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
		return semVerRegex.test(version);
	}, [version]);
}
