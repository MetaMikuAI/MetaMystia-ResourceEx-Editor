'use client';

import { type ReactNode } from 'react';

import Button from '@/design/ui/components/button';
import Input from '@/design/ui/components/input';

interface IProps<T = string> {
	items: T[];
	onUpdate: (index: number, value: T) => void;
	onRemove: (index: number) => void;
	renderItem?: (
		item: T,
		index: number,
		onChange: (value: T) => void
	) => ReactNode;
	placeholder?: string;
	emptyMessage?: string;
}

export function ArrayFieldEditor<T = string>({
	emptyMessage = '暂无项目',
	items,
	onRemove,
	onUpdate,
	placeholder = '',
	renderItem,
}: IProps<T>) {
	const defaultRenderItem = (
		item: T,
		index: number,
		onChange: (value: T) => void
	) => (
		<div key={index} className="flex gap-2">
			<Input
				value={item as string}
				onValueChange={(value) => onChange(value as T)}
				placeholder={placeholder}
			/>
			<Button
				variant="light"
				size="sm"
				color="danger"
				onPress={() => onRemove(index)}
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
