'use client';

import { cn } from '@heroui/theme';
import { memo, type ReactNode } from 'react';

import Button, { type IButtonProps } from '@/design/ui/components/button';

import { PlusIcon } from './PlusIcon';

interface IProps extends Omit<
	IButtonProps,
	'children' | 'color' | 'size' | 'startContent' | 'variant'
> {
	children: ReactNode;
}

export const SectionAddButton = memo<IProps>(function SectionAddButton({
	children,
	className,
	...props
}) {
	return (
		<Button
			color="primary"
			variant="flat"
			size="sm"
			startContent={<PlusIcon className="h-4 w-4" />}
			className={cn(
				'h-10 rounded-medium px-3 text-sm font-medium sm:h-8 sm:text-xs',
				className
			)}
			{...props}
		>
			{children}
		</Button>
	);
});
