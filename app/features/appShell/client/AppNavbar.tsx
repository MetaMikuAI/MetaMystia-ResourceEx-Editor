'use client';

import {
	Navbar as HeroUINavbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	NavbarMenu,
	NavbarMenuItem,
	NavbarMenuToggle,
} from '@heroui/navbar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import Button from '@/design/ui/components/button';
import Card from '@/design/ui/components/card';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from '@/design/ui/components/dropdown';
import { useReducedMotion } from '@/design/ui/hooks/useReducedMotion';

import { openAnnouncementModal } from '@/features/announcements/client/AnnouncementModal';
import { ConfirmDialog } from '@/features/resourceEditor/client/components/confirm/ConfirmDialog';
import { ExportValidationDialog } from '@/features/resourceEditor/client/components/export/ExportValidationDialog';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';
import {
	type IResourcePackValidationIssue,
	validateResourcePackForExport,
} from '@/features/resourceEditor/client/validation/validateResourcePackForExport';

const NAV_GROUPS = [
	{
		label: '角色',
		items: [
			{ href: '/character', label: '稀客' },
			{ href: '/dialogue', label: '对话' },
			{ href: '/merchant', label: '商人' },
		],
	},
	{
		label: '素材',
		items: [
			{ href: '/ingredient', label: '原料' },
			{ href: '/food', label: '料理' },
			{ href: '/recipe', label: '菜谱' },
			{ href: '/beverage', label: '酒水' },
			{ href: '/clothes', label: '服装' },
		],
	},
	{
		label: '节点',
		items: [
			{ href: '/mission', label: '任务节点' },
			{ href: '/event', label: '事件节点' },
		],
	},
] as const;

const GITHUB_URL = 'https://github.com/MetaMystia/MetaMystia-ResourceEx-Editor';
const MOBILE_MENU_TOGGLE_ID = 'app-navbar-mobile-menu-toggle';

interface INavDropdownProps {
	label: string;
	items: readonly { readonly href: string; readonly label: string }[];
}

const NavDropdown = memo<INavDropdownProps>(function NavDropdown({
	items,
	label,
}) {
	const pathname = usePathname();
	const isActive = items.some((item) => item.href === pathname);

	return (
		<Dropdown>
			<DropdownTrigger>
				<Button
					variant={isActive ? 'flat' : 'light'}
					color={isActive ? 'primary' : 'default'}
				>
					{label}
				</Button>
			</DropdownTrigger>
			<DropdownMenu
				aria-label={`${label} navigation`}
				selectionMode="none"
			>
				{items.map((item) => (
					<DropdownItem
						key={item.href}
						as={Link}
						href={item.href}
						textValue={item.label}
						className={pathname === item.href ? 'text-primary' : ''}
					>
						{item.label}
					</DropdownItem>
				))}
			</DropdownMenu>
		</Dropdown>
	);
});

function GitHubIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="h-6 w-6"
			fill="currentColor"
			aria-hidden
		>
			<path d="M12 .5C5.73.5.79 5.44.79 11.71c0 4.94 3.2 9.13 7.64 10.61.56.1.77-.24.77-.54 0-.27-.01-1.16-.02-2.11-3.11.68-3.77-1.32-3.77-1.32-.51-1.29-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.63 1.22 3.27.94.1-.73.39-1.22.71-1.5-2.49-.28-5.11-1.25-5.11-5.55 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.99 0 0 .94-.3 3.09 1.15.9-.25 1.86-.37 2.82-.38.96.01 1.92.13 2.82.38 2.15-1.45 3.09-1.15 3.09-1.15.61 1.56.23 2.71.11 2.99.72.79 1.16 1.79 1.16 3.02 0 4.31-2.62 5.27-5.12 5.55.4.34.76 1.02.76 2.05 0 1.48-.01 2.67-.01 3.04 0 .3.2.65.78.54 4.43-1.49 7.62-5.67 7.62-10.61C23.21 5.44 18.27.5 12 .5z" />
		</svg>
	);
}

type TDestructiveIntent = { type: 'create' } | { type: 'import'; file: File };

interface INotice {
	title: string;
	description: string;
}

export const AppNavbar = memo(function AppNavbar() {
	const pathname = usePathname();
	const router = useRouter();
	const isReducedMotion = useReducedMotion();
	const activeExportTriggerRef = useRef<HTMLButtonElement | null>(null);
	const desktopExportTriggerRef = useRef<HTMLButtonElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const mobileExportTriggerRef = useRef<HTMLButtonElement>(null);
	const mobileMenuFirstItemRef = useRef<HTMLButtonElement>(null);
	const {
		assets: { urls: assetUrls },
		createBlankResourcePack,
		exportArchive,
		importArchive,
		isDirty,
		isExporting,
		isImporting,
		resourcePack,
		revision,
	} = useResourceEditor();
	const [destructiveIntent, setDestructiveIntent] =
		useState<TDestructiveIntent | null>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [notice, setNotice] = useState<INotice | null>(null);
	const [validationResult, setValidationResult] = useState<{
		issues: IResourcePackValidationIssue[];
		revision: number;
	} | null>(null);

	useEffect(() => {
		if (!isMenuOpen) return;

		const focusFrame = requestAnimationFrame(() => {
			mobileMenuFirstItemRef.current?.focus();
		});
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			event.preventDefault();
			setIsMenuOpen(false);
			requestAnimationFrame(() =>
				document.getElementById(MOBILE_MENU_TOGGLE_ID)?.focus()
			);
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			cancelAnimationFrame(focusFrame);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isMenuOpen]);

	const showOperationError = useCallback((action: string, error?: string) => {
		setNotice({ title: `${action}失败`, description: error ?? '未知错误' });
	}, []);

	const handleNavigate = useCallback(
		(href: string) => {
			setIsMenuOpen(false);
			router.push(href);
		},
		[router]
	);

	const runImport = useCallback(
		async (file: File) => {
			const result = await importArchive(file);
			if (!result.isSuccess)
				showOperationError('读取资源包', result.error);
		},
		[importArchive, showOperationError]
	);

	const handleCreateBlank = useCallback(() => {
		if (isDirty) {
			setDestructiveIntent({ type: 'create' });
			return;
		}
		createBlankResourcePack();
	}, [createBlankResourcePack, isDirty]);

	const handleFileChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			event.target.value = '';
			if (!file) return;
			if (isDirty) {
				setDestructiveIntent({ type: 'import', file });
				return;
			}
			void runImport(file);
		},
		[isDirty, runImport]
	);

	const handleDestructiveConfirm = useCallback(() => {
		const intent = destructiveIntent;
		setDestructiveIntent(null);
		if (intent?.type === 'create') createBlankResourcePack();
		if (intent?.type === 'import') void runImport(intent.file);
	}, [createBlankResourcePack, destructiveIntent, runImport]);

	const handleExport = useCallback(async () => {
		if (isExporting) return;
		const expectedRevision = revision;
		const issues = await validateResourcePackForExport(
			resourcePack,
			Object.keys(assetUrls)
		);
		if (issues.length > 0) {
			setValidationResult({ issues, revision: expectedRevision });
			return;
		}
		const result = await exportArchive(expectedRevision);
		if (!result.isSuccess) showOperationError('导出资源包', result.error);
	}, [
		assetUrls,
		exportArchive,
		isExporting,
		resourcePack,
		revision,
		showOperationError,
	]);

	const handleExportCancel = useCallback(() => {
		setValidationResult(null);
		requestAnimationFrame(() => activeExportTriggerRef.current?.focus());
	}, []);

	const handleExportConfirm = useCallback(async () => {
		if (!validationResult) return;
		setValidationResult(null);
		const result = await exportArchive(validationResult.revision);
		if (!result.isSuccess) showOperationError('导出资源包', result.error);
	}, [exportArchive, showOperationError, validationResult]);

	const openGitHub = useCallback(() => {
		window.open(GITHUB_URL, '_blank', 'noopener,noreferrer');
	}, []);

	return (
		<>
			<HeroUINavbar
				isBordered
				isBlurred
				position="sticky"
				disableAnimation={isReducedMotion}
				isMenuOpen={isMenuOpen}
				onMenuOpenChange={setIsMenuOpen}
				classNames={{
					base: 'z-50',
					wrapper:
						'max-w-7xl 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl',
				}}
			>
				<NavbarContent
					justify="start"
					className="basis-full gap-4 lg:basis-1/5"
				>
					<NavbarBrand className="max-w-fit">
						<span className="image-rendering-pixelated h-10 w-10 shrink-0 rounded-full bg-logo bg-cover bg-no-repeat" />
						<span className="ml-1 hidden whitespace-nowrap text-lg font-bold sm:inline-block">
							ResourceEx Editor
						</span>
					</NavbarBrand>
					<nav className="hidden items-center gap-1 lg:flex">
						<NavbarItem>
							<Button
								as={Link}
								href="/info"
								variant={
									pathname === '/info' ? 'flat' : 'light'
								}
								color={
									pathname === '/info' ? 'primary' : 'default'
								}
							>
								基础信息
							</Button>
						</NavbarItem>
						{NAV_GROUPS.map((group) => (
							<NavDropdown key={group.label} {...group} />
						))}
						<NavbarItem>
							<Button
								as={Link}
								href="/asset"
								variant={
									pathname === '/asset' ? 'flat' : 'light'
								}
								color={
									pathname === '/asset'
										? 'primary'
										: 'default'
								}
							>
								资产
							</Button>
						</NavbarItem>
					</nav>
				</NavbarContent>

				<NavbarContent justify="end" className="hidden gap-1 lg:flex">
					<NavbarItem>
						<Button
							isIconOnly
							variant="light"
							aria-label="GitHub"
							onPress={openGitHub}
						>
							<GitHubIcon />
						</Button>
					</NavbarItem>
					<Button variant="light" onPress={openAnnouncementModal}>
						公告
					</Button>
					<Button variant="light" onPress={handleCreateBlank}>
						全新创建
					</Button>
					<Button
						variant="light"
						isDisabled={isImporting}
						onPress={() => fileInputRef.current?.click()}
					>
						上传资源包(ZIP)
					</Button>
					<Button
						ref={desktopExportTriggerRef}
						color="primary"
						isDisabled={isExporting}
						onPress={() => {
							activeExportTriggerRef.current =
								desktopExportTriggerRef.current;
							void handleExport();
						}}
					>
						导出资源包(ZIP)
					</Button>
				</NavbarContent>

				<NavbarContent justify="end" className="gap-1 lg:hidden">
					<NavbarItem>
						<Button
							ref={mobileExportTriggerRef}
							color="primary"
							size="sm"
							isDisabled={isExporting}
							onPress={() => {
								activeExportTriggerRef.current =
									mobileExportTriggerRef.current;
								void handleExport();
							}}
						>
							导出资源包(ZIP)
						</Button>
					</NavbarItem>
					<NavbarMenuToggle
						id={MOBILE_MENU_TOGGLE_ID}
						aria-label={isMenuOpen ? '收起菜单' : '打开菜单'}
					/>
				</NavbarContent>

				<NavbarMenu className="mobile-navbar-menu-scroll gap-3 overflow-y-auto pb-8 pt-4">
					{[
						{
							label: '资源包',
							items: [{ href: '/info', label: '基础信息' }],
						},
						...NAV_GROUPS,
						{
							label: '资产',
							items: [{ href: '/asset', label: '资产管理' }],
						},
					].map((group, groupIndex) => (
						<NavbarMenuItem key={group.label}>
							<Card className="gap-1 bg-content1/50 p-2">
								<p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-default-500">
									{group.label}
								</p>
								{group.items.map((item, itemIndex) => (
									<Button
										key={item.href}
										{...(groupIndex === 0 && itemIndex === 0
											? { ref: mobileMenuFirstItemRef }
											: {})}
										fullWidth
										variant={
											pathname === item.href
												? 'flat'
												: 'light'
										}
										color={
											pathname === item.href
												? 'primary'
												: 'default'
										}
										className="justify-start"
										onPress={() =>
											handleNavigate(item.href)
										}
									>
										{item.label}
									</Button>
								))}
							</Card>
						</NavbarMenuItem>
					))}
					<NavbarMenuItem>
						<Card className="gap-1 bg-content1/50 p-2">
							<p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-default-500">
								操作
							</p>
							<Button
								fullWidth
								variant="light"
								className="justify-start"
								onPress={() => {
									setIsMenuOpen(false);
									openAnnouncementModal();
								}}
							>
								公告
							</Button>
							<Button
								fullWidth
								variant="light"
								className="justify-start"
								onPress={() => {
									setIsMenuOpen(false);
									handleCreateBlank();
								}}
							>
								全新创建
							</Button>
							<Button
								fullWidth
								variant="light"
								className="justify-start"
								isDisabled={isImporting}
								onPress={() => {
									setIsMenuOpen(false);
									fileInputRef.current?.click();
								}}
							>
								上传资源包(ZIP)
							</Button>
							<Button
								fullWidth
								variant="light"
								className="justify-start"
								startContent={<GitHubIcon />}
								onPress={() => {
									setIsMenuOpen(false);
									openGitHub();
								}}
							>
								本项目代码仓库
							</Button>
						</Card>
					</NavbarMenuItem>
				</NavbarMenu>
			</HeroUINavbar>

			<input
				ref={fileInputRef}
				type="file"
				accept=".zip"
				className="hidden"
				onChange={handleFileChange}
			/>

			{validationResult && (
				<ExportValidationDialog
					issues={validationResult.issues}
					onCancel={handleExportCancel}
					onConfirm={handleExportConfirm}
				/>
			)}
			<ConfirmDialog
				isOpen={destructiveIntent !== null}
				title={
					destructiveIntent?.type === 'create'
						? '创建全新资源包？'
						: '导入并覆盖当前资源包？'
				}
				description={
					destructiveIntent?.type === 'create'
						? '当前有未保存的更改。创建全新资源包会丢失这些更改，此操作不可撤销。'
						: '当前有未保存的更改。导入新资源包会覆盖当前内容，此操作不可撤销。'
				}
				confirmLabel={
					destructiveIntent?.type === 'create'
						? '仍然创建'
						: '仍然导入'
				}
				isPending={isImporting}
				onCancel={() => setDestructiveIntent(null)}
				onConfirm={handleDestructiveConfirm}
			/>
			<ConfirmDialog
				isOpen={notice !== null}
				title={notice?.title ?? ''}
				description={notice?.description}
				confirmLabel="知道了"
				onConfirm={() => setNotice(null)}
			/>
		</>
	);
});
