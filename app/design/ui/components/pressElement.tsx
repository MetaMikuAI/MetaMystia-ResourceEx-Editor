'use client';

import {
	type ElementType,
	type FocusEventHandler,
	type HTMLAttributes,
	type KeyboardEventHandler,
	memo,
	type PointerEventHandler,
	useCallback,
	useState,
} from 'react';

type HTMLElementClickEventHandler<T extends HTMLElement> =
	HTMLAttributes<T>['onClick'];
type HTMLElementKeyPressEventHandler<T extends HTMLElement> =
	HTMLAttributes<T>['onKeyDown'];

export type HTMLElementClickEvent<T extends HTMLElement> = Parameters<
	NonNullable<HTMLElementClickEventHandler<T>>
>[0];
export type HTMLElementKeyDownEvent<T extends HTMLElement> = Parameters<
	NonNullable<HTMLElementKeyPressEventHandler<T>>
>[0];

type HTMLElementPressEventHandler<T extends HTMLElement> =
	HTMLElementClickEventHandler<T> & HTMLElementKeyPressEventHandler<T>;

export interface IPressProp<T extends HTMLElement> {
	onPress: HTMLElementPressEventHandler<T>;
}

interface IProps<T extends HTMLElement>
	extends HTMLAttributes<T>, IPressProp<T> {
	as?: ElementType;
}

function isConfirmKey(key: string) {
	return key === 'Enter' || key === ' ';
}

export default memo(function PressElement<T extends HTMLElement>({
	as: Component = 'span',
	onBlur,
	onClick,
	onKeyDown,
	onKeyUp,
	onPointerCancel,
	onPointerDown,
	onPointerLeave,
	onPointerUp,
	onPress,
	...props
}: IProps<T>) {
	const [isPressed, setIsPressed] = useState(false);

	const handleBlur = useCallback<FocusEventHandler<T>>(
		(event) => {
			setIsPressed(false);
			onBlur?.(event);
		},
		[onBlur]
	);

	const handleClick = useCallback(
		(event: HTMLElementClickEvent<T>) => {
			setIsPressed(false);
			onClick?.(event);
			onPress?.(event);
		},
		[onClick, onPress]
	);

	const handleKeyDown = useCallback<KeyboardEventHandler<T>>(
		(event) => {
			onKeyDown?.(event);
			if (!isConfirmKey(event.key)) return;
			if (event.key === ' ') event.preventDefault();
			setIsPressed(true);
			onPress?.(event);
		},
		[onKeyDown, onPress]
	);

	const handleKeyUp = useCallback<KeyboardEventHandler<T>>(
		(event) => {
			onKeyUp?.(event);
			if (isConfirmKey(event.key)) setIsPressed(false);
		},
		[onKeyUp]
	);

	const handlePointerCancel = useCallback<PointerEventHandler<T>>(
		(event) => {
			setIsPressed(false);
			onPointerCancel?.(event);
		},
		[onPointerCancel]
	);

	const handlePointerDown = useCallback<PointerEventHandler<T>>(
		(event) => {
			if (event.button === 0) setIsPressed(true);
			onPointerDown?.(event);
		},
		[onPointerDown]
	);

	const handlePointerLeave = useCallback<PointerEventHandler<T>>(
		(event) => {
			setIsPressed(false);
			onPointerLeave?.(event);
		},
		[onPointerLeave]
	);

	const handlePointerUp = useCallback<PointerEventHandler<T>>(
		(event) => {
			setIsPressed(false);
			onPointerUp?.(event);
		},
		[onPointerUp]
	);

	return (
		<Component
			data-pressed={isPressed || undefined}
			onBlur={handleBlur}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			onKeyUp={handleKeyUp}
			onPointerCancel={handlePointerCancel}
			onPointerDown={handlePointerDown}
			onPointerLeave={handlePointerLeave}
			onPointerUp={handlePointerUp}
			{...props}
		/>
	);
});

export type { IProps as IPressElementProps };
