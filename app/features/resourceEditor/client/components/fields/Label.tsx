import { cn } from '@heroui/theme';
import { memo } from 'react';

import { InfoTip } from './InfoTip';

interface IProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	tip?: React.ReactNode;
	wrapperClassName?: string;
	size?: 'sm' | 'md';
}

export const Label = memo<IProps>(function Label({
	children,
	className,
	size = 'md',
	tip,
	wrapperClassName,
	...props
}) {
	return (
		<div
			className={cn('flex min-h-6 items-center gap-1', wrapperClassName)}
		>
			<label
				className={cn(
					'font-medium leading-5',
					size === 'sm'
						? 'text-xs text-foreground-600'
						: 'text-sm text-foreground-700',
					className
				)}
				{...props}
			>
				{children}
			</label>
			{tip !== undefined && <InfoTip>{tip}</InfoTip>}
		</div>
	);
});
