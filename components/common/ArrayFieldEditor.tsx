import { ReactNode } from 'react';
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
			<button
				onClick={() => onRemove(index)}
				className="btn-mystia text-xs text-danger hover:bg-danger/10"
			>
				删除
			</button>
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
				<div className="rounded border border-dashed border-black/10 p-4 text-center text-xs opacity-40 dark:border-white/10">
					{emptyMessage}
				</div>
			)}
		</div>
	);
}
