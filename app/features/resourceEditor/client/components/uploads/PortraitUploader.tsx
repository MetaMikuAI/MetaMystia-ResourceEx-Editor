'use client';

import { cn } from '@heroui/theme';
import { useCallback, useEffect, useRef, useState } from 'react';

import Button from '@/design/ui/components/button';

import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import { readImageDimensions } from '@/infrastructure/browser/images/readImageDimensions';

interface IProps {
	spritePath: string;
	onUpload: (file: File) => void;
	width?: number;
	height?: number;
	className?: string;
}

export function PortraitUploader({
	className,
	height = 359,
	onUpload,
	spritePath,
	width = 256,
}: IProps) {
	const { getAssetUrl } = useResourceEditor();
	const [warning, setWarning] = useState('');
	const fileInputRef = useRef<HTMLInputElement>(null);
	const assetUrl = getAssetUrl(spritePath);

	const handleFile = useCallback(
		(file: File | undefined) => {
			if (!file) return;
			void readImageDimensions(file)
				.then((dimensions) => {
					setWarning(
						dimensions.width === width &&
							dimensions.height === height
							? ''
							: `当前尺寸${dimensions.width}×${dimensions.height}，期望${width}×${height}。`
					);
				})
				.catch(() => setWarning('无法读取图片尺寸。'));
			onUpload(file);
		},
		[height, onUpload, width]
	);

	useEffect(() => setWarning(''), [spritePath]);

	return (
		<div
			className={cn('flex w-full flex-col gap-1', className)}
			style={{ maxWidth: `${width}px` }}
		>
			<div className="flex min-w-0 flex-col gap-1">
				<p className="text-xs font-medium text-foreground-600">
					立绘预览
				</p>
				{warning && (
					<p
						className="break-words text-xs leading-5 text-warning-700 dark:text-warning-600"
						role="status"
					>
						{warning}
					</p>
				)}
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/png"
				className="hidden"
				id={`upload-portrait-${spritePath}`}
				onChange={(event) => {
					handleFile(event.target.files?.[0]);
					event.target.value = '';
				}}
			/>
			<div
				className={cn(
					'bg-checkerboard relative flex w-full flex-col items-center justify-center overflow-hidden rounded-large border-2 border-dashed transition-colors hover:border-primary/50 motion-reduce:transition-none',
					warning ? 'border-warning/50' : 'border-divider'
				)}
				style={{ aspectRatio: `${width} / ${height}` }}
				onDragOver={(event) => event.preventDefault()}
				onDrop={(event) => {
					event.preventDefault();
					const file = event.dataTransfer.files?.[0];
					if (file?.type === 'image/png') handleFile(file);
				}}
			>
				{assetUrl ? (
					<>
						<img
							src={assetUrl}
							className="image-rendering-pixelated h-full w-full object-contain"
							alt="立绘预览"
						/>
						<Button
							size="sm"
							variant="flat"
							color="primary"
							className="absolute bottom-3"
							onPress={() => fileInputRef.current?.click()}
						>
							更换立绘
						</Button>
					</>
				) : (
					<div className="flex flex-col items-center gap-3 text-center">
						<p className="text-sm font-medium text-foreground-600">
							暂无立绘
						</p>
						<p className="text-xs text-foreground-500">
							{width}×{height}
						</p>
						<Button
							size="sm"
							variant="flat"
							color="primary"
							onPress={() => fileInputRef.current?.click()}
						>
							选择立绘
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
