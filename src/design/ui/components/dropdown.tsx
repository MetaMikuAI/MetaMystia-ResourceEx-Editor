'use client';

import { type JSX, memo } from 'react';

import { useMotionProps, useReducedMotion } from '@/design/ui/hooks';

import {
	DropdownItem,
	DropdownMenu,
	type DropdownProps,
	Dropdown as HeroUIDropdown,
	DropdownTrigger,
} from '@heroui/dropdown';

import { cn } from '@/design/ui/utils';

interface IProps extends DropdownProps {}

export default memo<IProps>(function Dropdown({
	classNames,
	disableAnimation,
	shouldBlockScroll,
	shouldCloseOnScroll,
	showArrow,
	...props
}) {
	const motionProps = useMotionProps('popover');
	const isReducedMotion = useReducedMotion();

	return (
		<HeroUIDropdown
			disableAnimation={disableAnimation ?? isReducedMotion}
			motionProps={motionProps}
			shouldBlockScroll={shouldBlockScroll ?? true}
			shouldCloseOnScroll={Boolean(shouldCloseOnScroll)}
			showArrow={Boolean(showArrow)}
			classNames={{
				...classNames,
				content: cn('min-w-min', classNames?.content),
			}}
			{...props}
		/>
	);
}) as { (props: IProps): JSX.Element; displayName: string };

export type { IProps as IDropdownProps };

export { DropdownItem, DropdownMenu, DropdownTrigger };
export type {
	DropdownItemProps,
	DropdownMenuProps,
	DropdownTriggerProps,
} from '@heroui/dropdown';
