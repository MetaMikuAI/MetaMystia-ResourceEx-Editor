import { memo } from 'react';
import { DAYSCENEMAP } from '@/data/daySceneMap';
import type { SpawnMarker } from '@/types/resource';
import { cn } from '@/lib';
import { Label } from '@/components/common/Label';

interface SpawnMarkerEditorProps {
	spawnMarker: SpawnMarker;
	onUpdate: (spawnMarker: SpawnMarker) => void;
}

export const SpawnMarkerEditor = memo<SpawnMarkerEditorProps>(
	function SpawnMarkerEditor({ spawnMarker, onUpdate }) {
		const inputClass = cn(
			'w-full rounded bg-transparent px-3 py-2 text-sm outline-none transition-all',
			'border border-black/10 placeholder:text-black/30',
			'focus:border-primary/50 focus:ring-4 focus:ring-primary/10',
			'dark:border-white/10 dark:text-white dark:placeholder:text-white/30',
			'dark:focus:border-primary/50 dark:focus:ring-primary/10'
		);

		return (
			<div className="flex flex-col gap-2">
				<Label>出没地点 (Spawn Marker)</Label>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="flex flex-col gap-1">
						<label className="text-[10px] font-medium uppercase opacity-40">
							地图 (Map)
						</label>
						<select
							className={inputClass}
							value={spawnMarker.mapLabel}
							onChange={(e) =>
								onUpdate({
									...spawnMarker,
									mapLabel: e.target.value,
								})
							}
						>
							{DAYSCENEMAP.map((map) => (
								<option
									key={map.label}
									value={map.label}
									className="bg-white text-black dark:bg-zinc-800 dark:text-white"
								>
									{map.name} ({map.label})
								</option>
							))}
						</select>
					</div>
					<div className="flex gap-4">
						<div className="flex flex-1 flex-col gap-1">
							<label className="text-[10px] font-medium uppercase opacity-40">
								朝向 (Rotation)
							</label>
							<select
								className={inputClass}
								value={spawnMarker.rotation || 'Down'}
								onChange={(e) =>
									onUpdate({
										...spawnMarker,
										rotation: e.target.value as any,
									})
								}
							>
								<option
									value="Down"
									className="bg-white text-black dark:bg-zinc-800 dark:text-white"
								>
									下 (Down)
								</option>
								<option
									value="Up"
									className="bg-white text-black dark:bg-zinc-800 dark:text-white"
								>
									上 (Up)
								</option>
								<option
									value="Left"
									className="bg-white text-black dark:bg-zinc-800 dark:text-white"
								>
									左 (Left)
								</option>
								<option
									value="Right"
									className="bg-white text-black dark:bg-zinc-800 dark:text-white"
								>
									右 (Right)
								</option>
							</select>
						</div>
						<div className="flex flex-1 flex-col gap-1">
							<label className="text-[10px] font-medium uppercase opacity-40">
								X 坐标
							</label>
							<input
								type="number"
								step="0.1"
								className={inputClass}
								value={spawnMarker.x}
								onChange={(e) =>
									onUpdate({
										...spawnMarker,
										x: parseFloat(e.target.value) || 0,
									})
								}
							/>
						</div>
						<div className="flex flex-1 flex-col gap-1">
							<label className="text-[10px] font-medium uppercase opacity-40">
								Y 坐标
							</label>
							<input
								type="number"
								step="0.1"
								className={inputClass}
								value={spawnMarker.y}
								onChange={(e) =>
									onUpdate({
										...spawnMarker,
										y: parseFloat(e.target.value) || 0,
									})
								}
							/>
						</div>
					</div>
				</div>
			</div>
		);
	}
);
