'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type PublicCertification = {
	name: string;
	image: string;
	url: string | null;
};

const HOME_CERTS_STORAGE_KEY = 'home_public_certs_v1';
const HOME_CERTS_LIMIT = 7;

function normalizeCertifications(value: unknown): PublicCertification[] {
	if (!Array.isArray(value)) return [];

	return value
		.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
		.map((item) => {
			const rawName = typeof item.name === 'string' ? item.name.trim() : '';
			const rawImage = typeof item.image === 'string' ? item.image.trim() : '';
			const rawUrl = typeof item.url === 'string' ? item.url.trim() : '';

			return {
				name: rawName || 'Certificacion',
				image: rawImage,
				url: rawUrl || null,
			};
		})
		.filter((item) => item.image.length > 0)
		.slice(0, HOME_CERTS_LIMIT);
}

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Certifications() {
	const [otherCerts, setOtherCerts] = useState<PublicCertification[]>([]);
	const [maxVisibleCerts, setMaxVisibleCerts] = useState<number>(4);

	useEffect(() => {
		let cancelled = false;

		async function loadPublicCerts() {
			let cachedCerts: PublicCertification[] = [];

			try {
				const cachedRaw = window.sessionStorage.getItem(HOME_CERTS_STORAGE_KEY);
				if (cachedRaw) {
					const cachedParsed = normalizeCertifications(JSON.parse(cachedRaw));
					if (cachedParsed.length > 0) {
						cachedCerts = cachedParsed;
						if (!cancelled) setOtherCerts(cachedParsed);
					}
				}
			} catch {
				// Ignore storage parsing issues and continue with network fetch.
			}

			for (let attempt = 0; attempt < 3; attempt += 1) {
				try {
					const res = await fetch(
						`/api/public/certifications?limit=${HOME_CERTS_LIMIT}&offset=0`,
						{ cache: 'no-store' }
					);

					if (!res.ok) {
						throw new Error('Request failed');
					}

					const json = await res.json();
					const nextCerts = normalizeCertifications(json.data ?? []);

					if (!cancelled && nextCerts.length > 0) {
						setOtherCerts(nextCerts);
						window.sessionStorage.setItem(
							HOME_CERTS_STORAGE_KEY,
							JSON.stringify(nextCerts)
						);
					}

					return;
				} catch {
					if (attempt < 2) {
						await wait(350 * (attempt + 1));
					}
				}
			}

			if (!cancelled && cachedCerts.length > 0) {
				setOtherCerts(cachedCerts);
			}
		}

		void loadPublicCerts();

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		function updateMaxVisible() {
			if (window.innerWidth >= 1280) {
				setMaxVisibleCerts(HOME_CERTS_LIMIT);
				return;
			}

			if (window.innerWidth >= 640) {
				setMaxVisibleCerts(6);
				return;
			}

			setMaxVisibleCerts(4);
		}

		updateMaxVisible();
		window.addEventListener('resize', updateMaxVisible);

		return () => {
			window.removeEventListener('resize', updateMaxVisible);
		};
	}, []);

	const visibleCerts = useMemo(() => {
		const limited = otherCerts.slice(0, maxVisibleCerts);

		if (maxVisibleCerts === HOME_CERTS_LIMIT) {
			return limited;
		}

		return limited.length % 2 === 0 ? limited : limited.slice(0, -1);
	}, [otherCerts, maxVisibleCerts]);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.5, ease: 'easeOut' as const },
		},
	};

	return (
		<section className="py-14 md:py-16 px-4 relative overflow-hidden">
			{/* Background glow effects */}
			<motion.div
				className="absolute top-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"
				animate={{
					scale: [1, 1.2, 1],
					opacity: [0.1, 0.3, 0.1],
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
			/>
			<motion.div
				className="absolute bottom-20 left-10 w-80 h-80 bg-green-500/5 rounded-full blur-3xl"
				animate={{
					scale: [1.2, 1, 1.2],
					opacity: [0.2, 0.1, 0.2],
				}}
				transition={{
					duration: 12,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
			/>

			<div className="max-w-6xl mx-auto relative z-10 section-surface">
				<div className="relative z-10">
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<motion.p className="text-gray-400 mb-3 font-mono text-xs">$ cd ./certifications</motion.p>
						<motion.p className="text-green-500 mb-2 font-mono text-sm">$ cat certificates.log</motion.p>
						<h2 className="text-4xl font-bold mb-16 text-center bg-gradient-to-r from-green-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
							Cursos y Certificaciones
						</h2>
					</motion.div>

					{/* Certificaciones - API */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.3 }}
					>
						<motion.p className="text-green-500 mb-2 font-mono text-sm">$ ls ./badges --all</motion.p>
						<motion.h3
							className="text-2xl font-semibold text-green-300 border-l-4 border-green-500 pl-4 mb-8"
							initial={{ opacity: 0, x: -10 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.2 }}
						>
							Certificaciones e Insignias
						</motion.h3>
						<motion.div
							className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-3 justify-items-center mx-auto max-w-6xl"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
						>
							{visibleCerts.map(({ name, url, image }, badgeIndex) => (
								<motion.a
									key={`${name}-${badgeIndex}`}
									href={url ?? '#'}
									target={url ? '_blank' : undefined}
									rel={url ? 'noopener noreferrer' : undefined}
									variants={itemVariants}
									whileHover={{
										scale: 1.15,
										boxShadow: '0 15px 40px rgba(34, 197, 94, 0.25)',
										borderColor: 'rgba(34, 197, 94, 0.8)',
										backgroundColor: 'rgba(34, 197, 94, 0.1)',
									}}
									className={`aspect-square w-[100px] h-[100px] flex-col items-center justify-center bg-gray-800/60 rounded-lg border border-gray-700/50 shadow-md text-green-400 font-medium text-center p-2 text-xs transition-all duration-300 group flex ${url ? '' : 'pointer-events-none opacity-70'}`}
								>
									{image ? (
										<motion.div
											className="mb-1 flex items-center justify-center w-full h-12 rounded-lg p-1"
											animate={{ y: [0, -2, 0] }}
											transition={{ duration: 3, repeat: Infinity, delay: badgeIndex * 0.12 }}
										>
											<Image
												src={image}
												alt={`${name} logo`}
												width={32}
												height={32}
												className="w-full h-full object-contain"
												loading="lazy"
												onError={(e) => {
													(e.currentTarget as HTMLImageElement).style.opacity = '0.35';
												}}
											/>
										</motion.div>
									) : (
										<div className="mb-1 flex h-12 w-full items-center justify-center rounded-lg border border-gray-600/60 bg-gray-900/40 text-[10px] text-green-300/80">
											Sin imagen
										</div>
									)}
									<motion.span
										className="leading-tight text-xs text-green-300 group-hover:text-green-200 transition-colors"
										whileHover={{ scale: 1.05 }}
									>
										{name}
									</motion.span>
								</motion.a>

							))}
						</motion.div>

						<motion.div
							className="mt-8 flex justify-center"
							initial={{ opacity: 0, y: 10 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.35 }}
						>
							<Link
								href="/certificaciones"
								className="rounded-lg border border-green-400/40 bg-green-500/10 px-4 py-2 text-sm text-green-300 transition hover:border-green-300 hover:bg-green-500/20 hover:text-green-200"
							>
								Ver todas las certificaciones
							</Link>
						</motion.div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
