import { memo } from 'react';

interface PortraitPreviewProps {
	portraitPath: string | null;
	characterId: number;
	charName: string;
	pid: number;
	portraitName: string;
}

export const PortraitPreview = memo<PortraitPreviewProps>(
	function PortraitPreview({
		portraitPath,
		characterId,
		charName,
		pid,
		portraitName,
	}) {
		if (!portraitPath) {
			return (
				<div className="flex h-80 w-full flex-col items-center justify-center gap-2 rounded-lg border-dashed border-black/10 bg-white/60 text-black/40 dark:border-white/10 dark:bg-white/5 dark:text-white/40">
					<span className="text-2xl opacity-20">🖼️</span>
					<span className="text-xs font-medium">无立绘预览</span>
				</div>
			);
		}

		return (
			<div className="group flex flex-col gap-2">
				<div className="bg-checkerboard relative h-80 w-full overflow-hidden rounded-lg border border-black/10 shadow-inner">
					<img
						draggable="false"
						src={portraitPath}
						className="image-rendering-pixelated h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
						onError={(e) => {
							const { currentTarget: target } = e;
							target.style.display = 'none';
							const errorDiv =
								target.nextElementSibling as HTMLElement;
							if (errorDiv) {
								errorDiv.style.display = 'flex';
							}
						}}
					/>
					<div className="hidden h-full w-full flex-col items-center justify-center gap-2 bg-danger bg-opacity-10 p-4 text-center">
						<span className="text-2xl">⚠️</span>
						<span className="text-xs font-medium">
							图片加载失败
						</span>
					</div>
				</div>
				<div className="rounded-lg bg-black/5 px-2 py-1 text-center dark:bg-white/5">
					<div className="text-[10px] font-medium opacity-60">
						({characterId}){charName}&nbsp;&nbsp; ({pid})
						{portraitName}
					</div>
				</div>
			</div>
		);
	}
);
