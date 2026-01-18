import { memo, useCallback } from 'react';
import type { MissionNode } from '@/types/resource';

interface MissionPostMissionListProps {
	mission: MissionNode;
	allMissions: MissionNode[];
	onUpdate: (updates: Partial<MissionNode>) => void;
}

export const MissionPostMissionList = memo<MissionPostMissionListProps>(
	function MissionPostMissionList({ mission, allMissions, onUpdate }) {
		const addPostMission = useCallback(() => {
			const newPostMissions = [
				...(mission.postMissionsAfterPerformance || []),
				'',
			];
			onUpdate({ postMissionsAfterPerformance: newPostMissions });
		}, [mission, onUpdate]);

		const removePostMission = useCallback(
			(index: number) => {
				if (!mission.postMissionsAfterPerformance) return;
				const newPostMissions = [
					...mission.postMissionsAfterPerformance,
				];
				newPostMissions.splice(index, 1);
				onUpdate({ postMissionsAfterPerformance: newPostMissions });
			},
			[mission, onUpdate]
		);

		const updatePostMission = useCallback(
			(index: number, value: string) => {
				if (!mission.postMissionsAfterPerformance) return;
				const newPostMissions = [
					...mission.postMissionsAfterPerformance,
				];
				newPostMissions[index] = value;
				onUpdate({ postMissionsAfterPerformance: newPostMissions });
			},
			[mission, onUpdate]
		);

		return (
			<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between">
					<label className="font-medium text-foreground">
						后继任务(postMissionsAfterPerformance) (
						{mission.postMissionsAfterPerformance?.length || 0})
					</label>
					<button
						onClick={addPostMission}
						className="btn-mystia-primary h-8 px-3 text-sm"
					>
						+ 添加后继任务
					</button>
				</div>
				<div className="flex flex-col gap-3">
					{(mission.postMissionsAfterPerformance || []).map(
						(pm, index) => (
							<div
								key={index}
								className="flex flex-col gap-3 rounded-lg border border-black/5 bg-black/5 p-4 dark:border-white/5 dark:bg-white/5"
							>
								<div className="flex items-center justify-between gap-4">
									<div className="flex flex-1 flex-col gap-1">
										<label className="text-xs font-medium opacity-70">
											任务 Label
										</label>
										<select
											value={pm}
											onChange={(e) =>
												updatePostMission(
													index,
													e.target.value
												)
											}
											className="rounded border border-black/10 bg-transparent px-2 py-1 text-sm focus:border-primary focus:outline-none dark:border-white/10"
										>
											<option value="">
												请选择任务...
											</option>
											{allMissions.map((m) => (
												<option
													key={m.label}
													value={m.label}
												>
													{m.title || m.label} (
													{m.label})
												</option>
											))}
										</select>
									</div>
									<button
										onClick={() => removePostMission(index)}
										className="btn-mystia text-xs text-danger hover:bg-danger/10"
									>
										删除
									</button>
								</div>
							</div>
						)
					)}
					{(!mission.postMissionsAfterPerformance ||
						mission.postMissionsAfterPerformance.length === 0) && (
						<p className="text-center text-sm text-black/40 dark:text-white/40">
							暂无后继任务配置
						</p>
					)}
				</div>
			</div>
		);
	}
);
