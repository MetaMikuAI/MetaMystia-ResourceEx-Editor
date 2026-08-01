'use client';

import { cn } from '@heroui/theme';
import { memo, type ReactNode } from 'react';

import Button, { type IButtonProps } from '@/design/ui/components/button';

import { ConfirmPopover } from '@/features/resourceEditor/client/components/confirm/ConfirmPopover';

import { TrashIcon } from './TrashIcon';

interface IProps extends Omit<
	IButtonProps,
	'children' | 'color' | 'onPress' | 'size' | 'startContent' | 'variant'
> {
	children?: ReactNode;
	iconOnly?: boolean;
	confirmTitle?: ReactNode;
	confirmDescription?: ReactNode;
	onPress: () => void;
}

export const SectionDeleteButton = memo<IProps>(function SectionDeleteButton({
	children,
	className,
	confirmDescription,
	confirmTitle,
	iconOnly,
	onPress,
	...props
}) {
	const button = (
		<Button
			color="danger"
			variant="flat"
			size="sm"
			{...(iconOnly
				? {
						'aria-label':
							typeof children === 'string' ? children : '删除',
						isIconOnly: true,
					}
				: { startContent: <TrashIcon className="h-3.5 w-3.5" /> })}
			className={cn(
				iconOnly ? 'h-8 w-8 rounded-md' : 'h-8 rounded-md px-3 text-xs',
				className
			)}
			{...(confirmTitle === undefined ? { onPress } : {})}
			{...props}
		>
			{iconOnly ? <TrashIcon className="h-3.5 w-3.5" /> : children}
		</Button>
	);

	if (confirmTitle === undefined) {
		return button;
	}

	return (
		<ConfirmPopover
			trigger={button}
			title={confirmTitle}
			description={confirmDescription}
			onConfirm={onPress}
		/>
	);
});
