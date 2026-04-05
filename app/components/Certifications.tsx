'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type PublicCertification = {
	name: string;
	image: string;
	url: string | null;
};

export default function Certifications() {
	const [otherCerts, setOtherCerts] = useState<PublicCertification[]>([]);

	useEffect(() => {
		async function loadPublicCerts() {
			const res = await fetch('/api/public/certifications', { cache: 'no-store' });
			const json = await res.json();

			if (!res.ok) return;

			setOtherCerts((json.data ?? []).slice(0, 7));
		}

		loadPublicCerts();
	}, []);

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
		<section className="py-20 px-4 relative overflow-hidden">
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

			<div className="max-w-6xl mx-auto relative z-10">
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
						className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3 justify-items-center mx-auto max-w-6xl"
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
					>
						{otherCerts.map(({ name, url, image }, badgeIndex) => (
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
								className={`aspect-square w-[100px] h-[100px] flex-col items-center justify-center bg-gray-800/60 rounded-lg border border-gray-700/50 shadow-md text-green-400 font-medium text-center p-2 text-xs transition-all duration-300 group ${badgeIndex >= 4 ? 'hidden sm:flex' : 'flex'} ${url ? '' : 'pointer-events-none opacity-70'}`}
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
											onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
										/>
									</motion.div>
								) : null}
								<motion.span
									className="leading-tight text-xs group-hover:text-green-300 transition-colors"
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
		</section>
	);
}
