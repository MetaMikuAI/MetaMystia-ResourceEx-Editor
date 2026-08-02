'use client';

import { InfoIcon } from '@heroui/shared-icons';
import { cn } from '@heroui/theme';
import { memo, type ReactNode } from 'react';

import Popover, {
	PopoverContent,
	PopoverTrigger,
} from '@/design/ui/components/popover';
import Tooltip from '@/design/ui/components/tooltip';

interface IProps {
	children: ReactNode;
	className?: string;
}

export const InfoTip = memo<IProps>(function InfoTip({ children, className }) {
	return (
		<Popover showArrow offset={10} size="sm">
			<Tooltip content={children} showArrow size="sm">
				<span className="inline-flex">
					<PopoverTrigger>
						<button
							type="button"
							aria-label="查看说明"
							className={cn(
								'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-medium text-foreground-500 transition-colors hover:bg-default/40 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none',
								className
							)}
						>
							<InfoIcon className="h-4 w-4" />
						</button>
					</PopoverTrigger>
				</span>
			</Tooltip>
			<PopoverContent className="max-w-xs whitespace-pre-line break-all">
				{children}
			</PopoverContent>
		</Popover>
	);
});
