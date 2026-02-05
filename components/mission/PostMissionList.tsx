import { memo, useCallback } from 'react';
import { EmptyState } from '@/components/common/EmptyState';
import { EditorField } from '@/components/common/EditorField';
import type { MissionNode } from '@/types/resource';

interface PostMissionListProps {
	postMissions: string[] | undefined;
	allMissions: MissionNode[];
	onUpdate: (postMissions: string[]) => void;
}

export const PostMissionList = memo<PostMissionListProps>(
	function PostMissionList({ postMissions, allMissions, onUpdate }) {
		const addPostMission = useCallback(() => {
			const newPostMissions = [...(postMissions || []), ''];
			onUpdate(newPostMissions);
		}, [postMissions, onUpdate]);

		const removePostMission = useCallback(
			(index: number) => {
				if (!postMissions) return;
				const newPostMissions = [...postMissions];
				newPostMissions.splice(index, 1);
				onUpdate(newPostMissions);
			},
			[postMissions, onUpdate]
		);

		const updatePostMission = useCallback(
			(index: number, value: string) => {
				if (!postMissions) return;
				const newPostMissions = [...postMissions];
				newPostMissions[index] = value;
				onUpdate(newPostMissions);
			},
			[postMissions, onUpdate]
		);

		return (
			<EditorField
				className="gap-4"
				label={`后继任务(postMissionsAfterPerformance) (${
					postMissions?.length || 0
				})`}
				actions={
					<button
						onClick={addPostMission}
						className="btn-mystia-primary h-8 px-3 text-sm"
					>
						+ 添加后继任务
					</button>
				}
			>
				<div className="flex flex-col gap-3">
					{(postMissions || []).map((pm, index) => (
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
										<option value="">请选择任务...</option>
										{allMissions.map((m, i) => (
											<option
												key={`${m.label}-${i}`}
												value={m.label}
											>
												{m.title || m.label} ({m.label})
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
					))}
					{(!postMissions || postMissions.length === 0) && (
						<EmptyState variant="text" title="暂无后继任务配置" />
					)}
				</div>
			</EditorField>
		);
	}
);
