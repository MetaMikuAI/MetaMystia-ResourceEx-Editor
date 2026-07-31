import { useMemo } from 'react';

import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

export function useLabelPrefixValidation(label: string) {
	const { resourcePack } = useResourceEditor();
	const packLabel = resourcePack.packInfo.label;

	return useMemo(() => {
		if (!packLabel) {
			return { prefix: '', isValid: true, hasPackLabel: false };
		}

		const prefix = `_${packLabel}_`;
		return {
			prefix,
			isValid: label.startsWith(prefix),
			hasPackLabel: true,
		};
	}, [label, packLabel]);
}

export function usePackLabelPrefix(): string {
	const { resourcePack } = useResourceEditor();
	const packLabel = resourcePack.packInfo.label;

	return useMemo(() => (packLabel ? `_${packLabel}_` : '_'), [packLabel]);
}
