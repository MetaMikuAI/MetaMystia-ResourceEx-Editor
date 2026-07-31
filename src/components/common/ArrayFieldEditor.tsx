'use client';

import { ReactNode } from 'react';

import Button from '@/design/ui/components/button';

import { TextInput } from './TextInput';

interface ArrayFieldEditorProps<T = string> {
	items: T[];
	onAdd?: () => void;
	onUpdate: (index: number, value: T) => void;
	onRemove: (index: number) => void;
	renderItem?: (
		item: T,
		index: number,
		onChange: (value: T) => void
	) => ReactNode;
	placeholder?: string;
	emptyMessage?: string;
	addButtonText?: string;
}

export function ArrayFieldEditor<T = string>({
	items,
	onUpdate,
	onRemove,
	renderItem,
	placeholder = '',
	emptyMessage = '暂无项目',
}: ArrayFieldEditorProps<T>) {
	const defaultRenderItem = (
		item: T,
		index: number,
		onChange: (value: T) => void
	) => (
		<div key={index} className="flex gap-2">
			<TextInput
				value={item as string}
				onChange={(e) => onChange(e.target.value as T)}
				placeholder={placeholder}
			/>
			<Button
				variant="light"
				size="sm"
				onPress={() => onRemove(index)}
				className="text-xs text-danger hover:bg-danger/10"
			>
				删除
			</Button>
		</div>
	);

	return (
		<div className="flex flex-col gap-2">
			{items.map((item, index) =>
				renderItem
					? renderItem(item, index, (value) => onUpdate(index, value))
					: defaultRenderItem(item, index, (value) =>
							onUpdate(index, value)
						)
			)}
			{items.length === 0 && (
				<div className="rounded border border-dashed border-divider p-4 text-center text-xs opacity-40">
					{emptyMessage}
				</div>
			)}
		</div>
	);
}
