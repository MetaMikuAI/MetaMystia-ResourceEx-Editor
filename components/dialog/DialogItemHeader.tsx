import { memo } from 'react';

import type { Dialog } from '@/types/resource';

interface DialogItemHeaderProps {
	index: number;
	position: Dialog['position'];
	onRemove: () => void;
	onTogglePosition: () => void;
}

export const DialogItemHeader = memo<DialogItemHeaderProps>(
	function DialogItemHeader({ index, position, onRemove, onTogglePosition }) {
		return (
			<div className="flex items-center justify-between border-b border-black/5 pb-2 dark:border-white/5">
				<div className="flex items-center gap-2">
					<span className="text-xs font-bold uppercase tracking-wider opacity-60">
						对话条目#{index + 1}
					</span>
					<button
						onClick={onTogglePosition}
						className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-all hover:scale-105 active:scale-95 ${
							position === 'Left'
								? 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 dark:text-blue-300'
								: 'bg-orange-500/20 text-orange-700 hover:bg-orange-500/30 dark:text-orange-300'
						}`}
						title="点击切换左右位置"
					>
						{position === 'Left' ? '← 左侧' : '右侧 →'}
					</button>
				</div>
				<button
					onClick={onRemove}
					className="btn-mystia-danger px-3 py-1 text-xs"
				>
					删除此条
				</button>
			</div>
		);
	}
);
