'use client';

import { memo, useCallback, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

import {
	Button,
	Navbar as HeroUINavbar,
	NavbarBrand,
	NavbarContent,
	NavbarItem,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
	cn,
} from '@/design/ui/components';
import { useData } from '@/components/context/DataContext';
import { validateResourcePack } from './validateResourcePack';
import { ExportValidationDialog } from './ExportValidationDialog';
import { openAnnouncementModal } from './AnnouncementModal';
import type { ValidationIssue } from './validateResourcePack';

interface NavDropdownProps {
	label: string;
	active: boolean;
	items: readonly { readonly href: string; readonly label: string }[];
}

const NavDropdown = memo(function NavDropdown({
	label,
	active,
	items,
}: NavDropdownProps) {
	const pathname = usePathname();

	return (
		<Dropdown>
			<DropdownTrigger>
				<Button
					variant={active ? 'flat' : 'light'}
					color={active ? 'primary' : 'default'}
					size="md"
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
						className={pathname === item.href ? 'text-primary' : ''}
						textValue={item.label}
					>
						{item.label}
					</DropdownItem>
				))}
			</DropdownMenu>
		</Dropdown>
	);
});

const navConfig = {
	character: {
		label: '角色',
		items: [
			{ href: '/character', label: '稀客' },
			{ href: '/dialogue', label: '对话' },
			{ href: '/merchant', label: '商人' },
		],
	},
	items: {
		label: '素材',
		items: [
			{ href: '/ingredient', label: '原料' },
			{ href: '/food', label: '料理' },
			{ href: '/recipe', label: '菜谱' },
			{ href: '/beverage', label: '酒水' },
			{ href: '/clothes', label: '服装' },
		],
	},
	nodes: {
		label: '节点',
		items: [
			{ href: '/mission', label: '任务节点' },
			{ href: '/event', label: '事件节点' },
		],
	},
} as const;

export const Navbar = memo(function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const { data, assetUrls, createBlank, loadResourcePack, saveResourcePack } =
		useData();
	const [validationIssues, setValidationIssues] = useState<
		ValidationIssue[] | null
	>(null);
	const [isMenuOpened, setIsMenuOpened] = useState(false);

	const handleMobileNav = useCallback(
		(href: string) => {
			setIsMenuOpened(false);
			router.push(href);
		},
		[router]
	);

	const handleExport = useCallback(async () => {
		const issues = await validateResourcePack(data, Object.keys(assetUrls));
		if (issues.length > 0) {
			setValidationIssues(issues);
		} else {
			saveResourcePack();
		}
	}, [data, assetUrls, saveResourcePack]);

	const handleExportConfirm = useCallback(() => {
		setValidationIssues(null);
		saveResourcePack();
	}, [saveResourcePack]);

	const handleExportCancel = useCallback(() => {
		setValidationIssues(null);
	}, []);

	const isItemsActive = [
		'/ingredient',
		'/food',
		'/recipe',
		'/beverage',
		'/clothes',
	].includes(pathname);
	const isNodesActive = ['/mission', '/event'].includes(pathname);
	const isCharacterActive = ['/character', '/dialogue', '/merchant'].includes(
		pathname
	);

	const handleUploadZip = useCallback(() => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.zip';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) loadResourcePack(file);
		};
		input.click();
	}, [loadResourcePack]);

	const renderNavLinks = useCallback(
		() => (
			<>
				<NavbarItem>
					<Button
						as={Link}
						href="/info"
						variant={pathname === '/info' ? 'flat' : 'light'}
						color={pathname === '/info' ? 'primary' : 'default'}
						size="md"
					>
						基础信息
					</Button>
				</NavbarItem>

				<NavDropdown
					label={navConfig.character.label}
					active={isCharacterActive}
					items={navConfig.character.items}
				/>

				<NavDropdown
					label={navConfig.items.label}
					active={isItemsActive}
					items={navConfig.items.items}
				/>

				<NavDropdown
					label={navConfig.nodes.label}
					active={isNodesActive}
					items={navConfig.nodes.items}
				/>

				<NavbarItem>
					<Button
						as={Link}
						href="/asset"
						variant={pathname === '/asset' ? 'flat' : 'light'}
						color={pathname === '/asset' ? 'primary' : 'default'}
						size="md"
					>
						资产
					</Button>
				</NavbarItem>
			</>
		),
		[pathname, isCharacterActive, isItemsActive, isNodesActive]
	);

	const GitHubIcon = useCallback(
		() => (
			<svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
				<path d="M12 .5C5.73.5.79 5.44.79 11.71c0 4.94 3.2 9.13 7.64 10.61.56.1.77-.24.77-.54 0-.27-.01-1.16-.02-2.11-3.11.68-3.77-1.32-3.77-1.32-.51-1.29-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.63 1.22 3.27.94.1-.73.39-1.22.71-1.5-2.49-.28-5.11-1.25-5.11-5.55 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.99 0 0 .94-.3 3.09 1.15.9-.25 1.86-.37 2.82-.38.96.01 1.92.13 2.82.38 2.15-1.45 3.09-1.15 3.09-1.15.61 1.56.23 2.71.11 2.99.72.79 1.16 1.79 1.16 3.02 0 4.31-2.62 5.27-5.12 5.55.4.34.76 1.02.76 2.05 0 1.48-.01 2.67-.01 3.04 0 .3.2.65.78.54 4.43-1.49 7.62-5.67 7.62-10.61C23.21 5.44 18.27.5 12 .5z" />
			</svg>
		),
		[]
	);

	const renderActionButtons = useCallback(
		() => (
			<>
				<Button
					variant="light"
					size="md"
					onPress={openAnnouncementModal}
				>
					公告
				</Button>
				<Button variant="light" size="md" onPress={createBlank}>
					全新创建
				</Button>
				<Button variant="light" size="md" onPress={handleUploadZip}>
					上传资源包(ZIP)
				</Button>
				<Button
					variant="solid"
					color="primary"
					size="md"
					onPress={handleExport}
				>
					导出资源包(ZIP)
				</Button>
			</>
		),
		[createBlank, handleExport, handleUploadZip]
	);

	return (
		<>
			<HeroUINavbar
				isBordered
				isBlurred
				position="sticky"
				height="4rem"
				classNames={{
					base: 'z-50',
					wrapper:
						'max-w-7xl 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl',
				}}
			>
				{/* ── Left: Brand + Desktop nav ── */}
				<NavbarContent
					justify="start"
					className="basis-full gap-4 lg:basis-1/5"
				>
					<NavbarBrand className="max-w-fit">
						<span className="image-rendering-pixelated h-10 w-10 shrink-0 rounded-full bg-logo bg-cover bg-no-repeat" />
						{/* 品牌文字: ≥xl (1280px+) 或 ≤lg (1024px以下) 显示，中间隐藏省空间 */}
						<span className="ml-1 hidden whitespace-nowrap text-lg font-bold max-lg:inline-block xl:inline-block">
							ResourceEx Editor
						</span>
					</NavbarBrand>

					{/* Desktop navigation — ≥lg (1024px) 显示 */}
					<nav className="hidden items-center gap-1 lg:flex">
						{renderNavLinks()}
					</nav>
				</NavbarContent>

				{/* ── Right: Desktop actions (≥lg) ── */}
				<NavbarContent justify="end" className="hidden gap-1 lg:flex">
					<NavbarItem>
						<Button
							isIconOnly
							variant="light"
							size="lg"
							aria-label="GitHub"
							onPress={() =>
								window.open(
									'https://github.com/MetaMystia/MetaMystia-ResourceEx-Editor',
									'_blank',
									'noopener,noreferrer'
								)
							}
						>
							<GitHubIcon />
						</Button>
					</NavbarItem>

					<div className="hidden gap-1 lg:flex">
						{renderActionButtons()}
					</div>
				</NavbarContent>

				{/* ── Right: Mobile actions (<lg) ── */}
				<NavbarContent justify="end" className="gap-1 lg:hidden">
					<NavbarItem>
						<Button
							isIconOnly
							variant="light"
							size="lg"
							aria-label="GitHub"
							onPress={() =>
								window.open(
									'https://github.com/MetaMystia/MetaMystia-ResourceEx-Editor',
									'_blank',
									'noopener,noreferrer'
								)
							}
						>
							<GitHubIcon />
						</Button>
					</NavbarItem>
					<NavbarItem>
						<Button
							variant="solid"
							color="primary"
							size="sm"
							onPress={handleExport}
						>
							导出资源包(ZIP)
						</Button>
					</NavbarItem>
					<NavbarItem>
						<Button
							isIconOnly
							variant="light"
							size="lg"
							onPress={() => setIsMenuOpened((v) => !v)}
							aria-label={isMenuOpened ? '收起菜单' : '打开菜单'}
						>
							{isMenuOpened ? (
								<svg
									viewBox="0 0 24 24"
									className="h-5 w-5"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path d="M18 6L6 18M6 6l12 12" />
								</svg>
							) : (
								<svg
									viewBox="0 0 24 24"
									className="h-5 w-5"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path d="M3 12h18M3 6h18M3 18h18" />
								</svg>
							)}
						</Button>
					</NavbarItem>
				</NavbarContent>
			</HeroUINavbar>

			{/* ── Hamburger menu: 仅页面导航 (<lg) ── */}
			{isMenuOpened && (
				<div className="fixed inset-0 top-16 z-40 flex flex-col gap-1 overflow-y-auto border-t border-default-200 bg-background/95 p-4 backdrop-blur-lg lg:hidden">
					<p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-default-500">
						页面导航
					</p>
					<button
						onClick={() => handleMobileNav('/info')}
						className={cn(
							'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-default-100',
							pathname === '/info'
								? 'bg-primary/10 text-primary'
								: 'text-foreground'
						)}
					>
						基础信息
					</button>

					<p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-default-500">
						角色
					</p>
					{navConfig.character.items.map((item) => (
						<button
							key={item.href}
							onClick={() => handleMobileNav(item.href)}
							className={cn(
								'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-default-100',
								pathname === item.href
									? 'bg-primary/10 text-primary'
									: 'text-foreground'
							)}
						>
							{item.label}
						</button>
					))}

					<p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-default-500">
						素材
					</p>
					{navConfig.items.items.map((item) => (
						<button
							key={item.href}
							onClick={() => handleMobileNav(item.href)}
							className={cn(
								'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-default-100',
								pathname === item.href
									? 'bg-primary/10 text-primary'
									: 'text-foreground'
							)}
						>
							{item.label}
						</button>
					))}

					<p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-default-500">
						节点
					</p>
					{navConfig.nodes.items.map((item) => (
						<button
							key={item.href}
							onClick={() => handleMobileNav(item.href)}
							className={cn(
								'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-default-100',
								pathname === item.href
									? 'bg-primary/10 text-primary'
									: 'text-foreground'
							)}
						>
							{item.label}
						</button>
					))}

					<p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-default-500">
						其他
					</p>
					<button
						onClick={() => handleMobileNav('/asset')}
						className={cn(
							'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-default-100',
							pathname === '/asset'
								? 'bg-primary/10 text-primary'
								: 'text-foreground'
						)}
					>
						资产
					</button>

					<div className="my-3 border-t border-default-200" />

					<p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-default-500">
						操作
					</p>
					<button
						onClick={() => {
							setIsMenuOpened(false);
							openAnnouncementModal();
						}}
						className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-default-100"
					>
						公告
					</button>
					<button
						onClick={() => {
							setIsMenuOpened(false);
							createBlank();
						}}
						className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-default-100"
					>
						全新创建
					</button>
					<button
						onClick={() => {
							setIsMenuOpened(false);
							handleUploadZip();
						}}
						className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-default-100"
					>
						上传资源包(ZIP)
					</button>
				</div>
			)}

			{validationIssues && (
				<ExportValidationDialog
					issues={validationIssues}
					onConfirm={handleExportConfirm}
					onCancel={handleExportCancel}
				/>
			)}
		</>
	);
});
