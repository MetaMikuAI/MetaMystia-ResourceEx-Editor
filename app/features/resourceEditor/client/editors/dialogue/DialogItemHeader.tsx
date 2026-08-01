import { memo } from 'react';

import Button from '@/design/ui/components/button';

import type { Dialog } from '@/domain/resourcePack/contracts/dialogue';

import { SectionDeleteButton } from '@/features/resourceEditor/client/components/actions/SectionDeleteButton';

interface DialogItemHeaderProps {
	index: number;
	position: Dialog['position'];
	onRemove: () => void;
	onTogglePosition: () => void;
}

export const DialogItemHeader = memo<DialogItemHeaderProps>(
	function DialogItemHeader({ index, position, onRemove, onTogglePosition }) {
		return (
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-divider pb-3">
				<div className="flex min-w-0 items-center gap-2">
					<span className="text-xs font-semibold text-foreground-600">
						对话条目#{index + 1}
					</span>
					<Button
						size="sm"
						variant="flat"
						color={position === 'Left' ? 'primary' : 'secondary'}
						className="h-10 rounded-medium px-2 text-xs sm:h-8"
						onPress={onTogglePosition}
						title="点击切换左右位置"
					>
						{position === 'Left' ? '左侧' : '右侧'}
					</Button>
				</div>
				<SectionDeleteButton
					confirmTitle="确定要删除这条对话吗？"
					onPress={onRemove}
				>
					删除此条
				</SectionDeleteButton>
			</div>
		);
	}
);
