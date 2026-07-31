import { cn } from '@heroui/theme';
import { memo, type ReactNode } from 'react';

import Card from '@/design/ui/components/card';

interface IProps {
	title: ReactNode;
	description?: ReactNode;
	actions?: ReactNode;
	className?: string;
}

export const EditorHeader = memo<IProps>(function EditorHeader({
	actions,
	className,
	description,
	title,
}) {
	return (
		<Card
			as="header"
			fullWidth
			shadow="sm"
			className={cn(
				'flex flex-col gap-3 bg-content1/40 p-4 backdrop-blur md:flex-row md:items-center md:justify-between',
				className
			)}
		>
			<div className="min-w-0 space-y-1">
				<h1 className="break-words text-xl font-semibold leading-7 text-foreground-900">
					{title}
				</h1>
				{description !== undefined && (
					<p className="break-words text-sm leading-5 text-foreground-500">
						{description}
					</p>
				)}
			</div>
			{actions !== undefined && (
				<div className="flex shrink-0 flex-wrap items-center gap-2">
					{actions}
				</div>
			)}
		</Card>
	);
});
