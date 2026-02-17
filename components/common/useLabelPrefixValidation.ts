import { useMemo } from 'react';
import { useData } from '@/components/context/DataContext';

/**
 * 验证 label 是否以 `_{资源包label}_` 格式开头。
 *
 * @param label 要验证的 label 字符串
 * @returns 验证结果对象
 *   - `prefix`: 期望的前缀 `_{packLabel}_`
 *   - `isValid`: label 是否以正确前缀开头
 *   - `hasPackLabel`: 资源包是否设置了 label
 */
export function useLabelPrefixValidation(label: string) {
	const { data } = useData();
	const packLabel = data.packInfo.label;

	return useMemo(() => {
		if (!packLabel) {
			return {
				prefix: '',
				isValid: true, // 无资源包 label 时不检查
				hasPackLabel: false,
			};
		}

		const prefix = `_${packLabel}_`;
		const isValid = label.startsWith(prefix);

		return { prefix, isValid, hasPackLabel: true };
	}, [label, packLabel]);
}

/**
 * 获取资源包 label 前缀。用于新建条目时自动填充。
 *
 * @returns `_{packLabel}_` 或空字符串（如果未设置资源包 label）
 */
export function usePackLabelPrefix(): string {
	const { data } = useData();
	const packLabel = data.packInfo.label;

	return useMemo(() => {
		if (!packLabel) return '_';
		return `_${packLabel}_`;
	}, [packLabel]);
}
