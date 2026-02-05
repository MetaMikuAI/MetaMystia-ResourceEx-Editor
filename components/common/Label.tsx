import { memo } from 'react';
import { cn } from '@/lib';
import { InfoTip } from '@/components/common/InfoTip';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	tip?: React.ReactNode;
	wrapperClassName?: string;
	size?: 'sm' | 'md';
}

export const Label = memo<LabelProps>(function Label({
	children,
	className,
	wrapperClassName,
	tip: tip,
	size = 'md',
	...props
}) {
	return (
		<div className={cn('flex items-center gap-1', wrapperClassName)}>
			<label
				className={cn(
					'font-medium uppercase',
					size === 'sm'
						? 'text-[10px] opacity-40'
						: 'text-xs opacity-60',
					className
				)}
				{...props}
			>
				{children}
			</label>
			{tip && <InfoTip>{tip}</InfoTip>}
		</div>
	);
});
