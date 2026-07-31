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
			startContent={<PlusIcon className="h-3.5 w-3.5" />}
			className={cn('h-8 rounded-md px-3 text-xs font-medium', className)}
			{...props}
		>
			{children}
		</Button>
	);
});
