'use client';

import { Textarea as HeroUITextarea, type TextAreaProps } from '@heroui/input';
import { type InternalForwardRefRenderFunction } from '@heroui/system';
import { cn } from '@heroui/theme';
import { memo } from 'react';

import { useDesignPreferences } from '@/design/preferences/DesignPreferencesContext';
import { useReducedMotion } from '@/design/ui/hooks/useReducedMotion';

interface IProps extends TextAreaProps {}

export default memo<IProps>(function Textarea({
	classNames,
	disableAnimation,
	radius,
	...props
}) {
	const isReducedMotion = useReducedMotion();
	const { isHighAppearance } = useDesignPreferences();

	return (
		<HeroUITextarea
			disableAnimation={disableAnimation ?? isReducedMotion}
			radius={radius ?? 'md'}
			classNames={{
				...classNames,
				inputWrapper: cn(
					'bg-default/40 transition-background data-[hover=true]:bg-default-200 group-data-[focus=true]:bg-default group-data-[focus=true]:group-data-[invalid=true]:!bg-danger/40 group-data-[invalid=true]:!bg-danger/20 data-[hover=true]:group-data-[invalid=true]:!bg-danger/30 motion-reduce:transition-none',
					isHighAppearance &&
						'bg-default/40 backdrop-blur data-[hover=true]:bg-default-400/40 group-data-[focus=true]:bg-default/70',
					classNames?.inputWrapper
				),
			}}
			{...props}
		/>
	);
}) as InternalForwardRefRenderFunction<'textarea', IProps>;

export type { IProps as ITextareaProps };
