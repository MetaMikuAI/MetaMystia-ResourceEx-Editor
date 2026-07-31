import { memo } from 'react';

interface DialogItemProps {
	dialog: string;
	onRemove: () => void;
}

export const DialogItem = memo<DialogItemProps>(function DialogItem({
	dialog,
	onRemove,
}) {
	return (
		<div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/10 px-3 py-2">
			<span className="text-sm">{dialog}</span>
			<button
				onClick={onRemove}
				className="text-xs text-danger hover:underline"
			>
				删除
			</button>
		</div>
	);
});
