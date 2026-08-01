import { cn } from '@heroui/theme';
import { memo, type ReactNode } from 'react';

interface IProps {
	actions?: ReactNode;
	className?: string;
	meta?: ReactNode;
	title: ReactNode;
}

export const EditorDetailHeader = memo<IProps>(function EditorDetailHeader({
	actions,
	className,
	meta,
	title,
}) {
	return (
		<header
			className={cn(
				'flex min-w-0 flex-col gap-3 border-b border-divider pb-4 sm:flex-row sm:items-center sm:justify-between',
				className
			)}
		>
			<div className="flex min-w-0 flex-wrap items-center gap-2">
				<h2 className="min-w-0 break-words text-2xl font-bold leading-8 text-foreground">
					{title}
				</h2>
				{meta}
			</div>
			{actions !== undefined && (
				<div className="flex shrink-0 flex-wrap items-center gap-2">
					{actions}
				</div>
			)}
		</header>
	);
});
