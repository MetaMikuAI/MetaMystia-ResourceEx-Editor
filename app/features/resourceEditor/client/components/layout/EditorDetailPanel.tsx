import { cn } from '@heroui/theme';
import { memo, type PropsWithChildren } from 'react';

import { EditorPanel } from './EditorPanel';

interface IProps {
	className?: string;
}

export const EditorDetailPanel = memo<PropsWithChildren<IProps>>(
	function EditorDetailPanel({ children, className }) {
		return (
			<EditorPanel
				className={cn(
					'flex min-w-0 flex-col gap-6 p-4 sm:p-6 lg:col-span-2',
					className
				)}
			>
				{children}
			</EditorPanel>
		);
	}
);
