import { memo } from 'react';
import { cn } from '@/lib';
import { InfoTip } from '@/components/common/InfoTip';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
	info?: React.ReactNode;
	wrapperClassName?: string;
}

export const Label = memo<LabelProps>(function Label({
	children,
	className,
	wrapperClassName,
	info,
	...props
}) {
	return (
		<div className={cn('flex items-center gap-1', wrapperClassName)}>
			<label
				className={cn(
					'text-xs font-medium uppercase opacity-60',
					className
				)}
				{...props}
			>
				{children}
			</label>
			{info && <InfoTip>{info}</InfoTip>}
		</div>
	);
});
