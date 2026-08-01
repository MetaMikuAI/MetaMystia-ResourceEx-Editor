import { cn } from '@heroui/theme';

import { EditorPanel } from './EditorPanel';
import { EmptyState } from './EmptyState';

interface IProps {
	className?: string;
	itemLabel: string;
}

export function EditorDetailEmptyState({ className, itemLabel }: IProps) {
	return (
		<EditorPanel
			className={cn(
				'flex min-h-72 items-center justify-center lg:col-span-2',
				className
			)}
		>
			<EmptyState
				variant="text"
				title={`请选择一个${itemLabel}开始编辑`}
				description="可从列表中选择，或新建一项"
			/>
		</EditorPanel>
	);
}
