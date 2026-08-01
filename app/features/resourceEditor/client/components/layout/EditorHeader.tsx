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
			shadow="none"
			className={cn(
				'flex flex-col gap-3 border border-divider bg-content1/85 p-4 shadow-sm backdrop-blur-md sm:p-6 md:flex-row md:items-center md:justify-between',
				className
			)}
		>
			<div className="min-w-0 space-y-1">
				<h1 className="break-words text-2xl font-bold leading-8 text-foreground">
					{title}
				</h1>
				{description !== undefined && (
					<p className="break-words text-sm leading-5 text-foreground-600">
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
