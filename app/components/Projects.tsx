'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Project = {
	id: string;
	slug: string;
	name: string;
	description: string;
	key_points: string[];
	repo_url: string | null;
	live_url: string | null;
	status: string;
	sort_order: number;
	tags?: Array<{ key: string; value: string }>;
};

export default function Projects() {
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [activePage, setActivePage] = useState(0);
	const [projectsPerSlide, setProjectsPerSlide] = useState(1);
	const shouldReduceMotion = useReducedMotion();

	useEffect(() => {
		async function loadProjects() {
			const res = await fetch('/api/public/projects', { cache: 'no-store' });
			const json = await res.json();

			if (!res.ok) {
				setLoading(false);
				return;
			}

			setProjects((json.data ?? []).slice(0, 4));
			setLoading(false);
		}

		loadProjects();
	}, []);

	useEffect(() => {
		function syncViewportMode() {
			if (window.innerWidth >= 768) {
				setProjectsPerSlide(2);
			} else {
				setProjectsPerSlide(1);
			}
		}

		syncViewportMode();
		window.addEventListener('resize', syncViewportMode);

		return () => window.removeEventListener('resize', syncViewportMode);
	}, []);

	const totalPages = Math.ceil(projects.length / projectsPerSlide);
	const safeActivePage = totalPages > 0 ? Math.min(activePage, totalPages - 1) : 0;

	useEffect(() => {
		if (totalPages <= 1) return;
		if (shouldReduceMotion) return;

		const timer = setInterval(() => {
			setActivePage((prev) => (prev + 1) % totalPages);
		}, 6500);

		return () => clearInterval(timer);
	}, [totalPages, shouldReduceMotion]);

	const pageStart = safeActivePage * projectsPerSlide;
	const visibleProjects = projects.slice(pageStart, pageStart + projectsPerSlide);

	function goPrev() {
		if (totalPages <= 1) return;
		setActivePage((prev) => (prev - 1 + totalPages) % totalPages);
	}

	function goNext() {
		if (totalPages <= 1) return;
		setActivePage((prev) => (prev + 1) % totalPages);
	}

	return (
		<section className="py-14 md:py-16 px-4 relative overflow-hidden">
			{/* Background decorations */}
			{shouldReduceMotion ? (
				<div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
			) : (
				<motion.div
					className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
					animate={{
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				/>
			)}

			<div className="max-w-6xl mx-auto relative z-10 section-surface">
				<div className="relative z-10">
					<div className="mb-12">
						<p className="text-green-500 mb-2 font-mono text-sm text-center">
							$ cd projects
						</p>
						<p className="text-gray-400 mb-3 font-mono text-xs text-center">
							$ ls -la
						</p>
						<h2 className="text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
							Proyectos
						</h2>
					</div>

					<div className="mx-auto w-full max-w-5xl">
						{loading ? (
							<p className="text-center text-white/60">Cargando proyectos...</p>
						) : null}

						{!loading && projects.length === 0 ? (
							<p className="text-center text-white/60">Sin proyectos publicados.</p>
						) : null}

						{visibleProjects.length > 0 ? (
							<AnimatePresence mode="wait">
								<motion.div
									key={`page-${safeActivePage}-${projectsPerSlide}`}
									initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
									transition={{ duration: shouldReduceMotion ? 0.15 : 0.28, ease: 'easeInOut' }}
									className={`grid gap-5 ${projectsPerSlide === 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}
								>
									{visibleProjects.map((project) => (
										<div
											key={project.id}
											className="group min-h-[28rem] bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-2xl p-6 border border-gray-800 shadow-md hover:shadow-lg hover:shadow-green-500/20 hover:border-green-500/50 transition-colors duration-300"
										>
											<p className="text-green-500/90 font-mono text-xs mb-3">$ cat ./projects/{project.slug}.md</p>
											<h3 className="text-2xl font-bold mb-4 text-gray-100 group-hover:text-green-400 transition-colors">
												{project.name}
											</h3>
											<p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors">{project.description}</p>

											<div className="mb-6">
												<h4 className="text-lg font-semibold mb-2 text-green-400">Puntos Clave:</h4>
												<ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
													{(project.key_points ?? []).map((detail, i) => (
														<li key={i}>{detail}</li>
													))}
												</ul>
											</div>

											<div className="flex flex-wrap gap-2 mb-4">
												{(project.tags ?? []).map((tag, i) => (
													<span
														key={i}
														title={`${tag.key}: ${tag.value}`}
														className="text-xs px-2 py-1 bg-gray-700/40 text-gray-200 rounded-md border border-gray-600 hover:bg-green-500/20 hover:border-green-500/50 transition-all"
													>
														{tag.value}
													</span>
												))}
											</div>

											<div className="mt-2 flex flex-wrap gap-4">
												{project.repo_url && (
													<a
														href={project.repo_url}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-block text-sm text-blue-400 hover:text-blue-300 transition-colors group-hover:underline"
													>
														Ver repositorio →
													</a>
												)}

												{project.live_url && (
													<a
														href={project.live_url}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-block text-sm text-emerald-400 hover:text-emerald-300 transition-colors group-hover:underline"
													>
														Ver demo →
													</a>
												)}
											</div>
										</div>
									))}
								</motion.div>
							</AnimatePresence>
						) : null}
					</div>

					{!loading && totalPages > 1 ? (
						<div className="mt-6 flex items-center justify-center gap-3">
							<button
								type="button"
								onClick={goPrev}
								className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-white/70 transition hover:border-green-400 hover:text-green-300"
							>
								Anterior
							</button>
							<div className="flex items-center gap-2">
								{Array.from({ length: totalPages }).map((_, idx) => (
									<button
										key={`page-dot-${idx}`}
										type="button"
										onClick={() => setActivePage(idx)}
										aria-label={`Ir al slide ${idx + 1}`}
										className={`h-2.5 w-2.5 rounded-full transition ${idx === safeActivePage ? 'bg-green-400' : 'bg-white/30 hover:bg-white/60'
											}`}
									/>
								))}
							</div>
							<button
								type="button"
								onClick={goNext}
								className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-white/70 transition hover:border-green-400 hover:text-green-300"
							>
								Siguiente
							</button>
						</div>
					) : null}

					<div className="mt-8 flex justify-center">
						<Link
							href="/proyectos"
							className="rounded-lg border border-green-400/40 bg-green-500/10 px-4 py-2 text-sm text-green-300 transition hover:border-green-300 hover:bg-green-500/20 hover:text-green-200"
						>
							Ver todos los proyectos
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
