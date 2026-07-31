'use client';

import { cn } from '@heroui/theme';
import { memo } from 'react';

import Tooltip from '@/design/ui/components/tooltip';

interface InfoTipProps {
	children: React.ReactNode;
	className?: string;
}

export const InfoTip = memo<InfoTipProps>(function InfoTip({
	children,
	className,
}) {
	return (
		<Tooltip content={children} showArrow offset={8} size="sm">
			<button
				type="button"
				className={cn(
					'flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-blue-600 transition-colors hover:bg-blue-500/30 dark:bg-blue-400/20 dark:text-blue-400 dark:hover:bg-blue-400/30',
					className
				)}
			>
				<span className="text-xs font-bold">?</span>
			</button>
		</Tooltip>
	);
});
