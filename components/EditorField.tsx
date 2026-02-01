import { ReactNode } from 'react';
import { cn } from '@/lib';

interface EditorFieldProps {
	label?: ReactNode;
	children: ReactNode;
	className?: string;
	labelClassName?: string;
}

export function EditorField({
	label,
	children,
	className,
	labelClassName,
}: EditorFieldProps) {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			{label && (
				<label
					className={cn(
						'font-medium text-foreground',
						labelClassName
					)}
				>
					{label}
				</label>
			)}
			{children}
		</div>
	);
}
