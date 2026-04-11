'use client';

import { motion } from 'framer-motion';

export default function ContactSection() {
	const socialLinks = [
		{
			name: 'GitHub',
			handle: '@azzazeru',
			url: 'https://github.com/Azzazeru',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
				</svg>
			),
		},
		{
			name: 'LinkedIn',
			handle: 'Aaron Fuentes Diocares',
			url: 'https://www.linkedin.com/in/aaron-fuentes-diocares/',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
					<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
				</svg>
			),
		},
		{
			name: 'Instagram',
			handle: '@zeruazzazel',
			url: 'https://www.instagram.com/zeruazzazel',
			icon: (
				<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zm8.25 2.375a1 1 0 110 2 1 1 0 010-2zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
				</svg>
			),
		},
	];

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
		hidden: { opacity: 0, x: -20 },
		visible: {
			opacity: 1,
			x: 0,
			transition: { duration: 0.6, ease: 'easeOut' as const },
		},
	};

	return (
		<section className="py-14 md:py-16 px-4 relative overflow-hidden">
			{/* Background glow */}
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"
				animate={{
					scale: [1, 1.1, 1],
					opacity: [0.2, 0.4, 0.2],
				}}
				transition={{
					duration: 8,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
			/>

			<div className="max-w-4xl mx-auto relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className="relative p-8 rounded-2xl overflow-hidden backdrop-blur-lg border border-gray-700/80 bg-black/90 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10"
				>
					<div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5" />
					<div className="relative z-10">
						{/* Terminal header */}
						<motion.div
							className="flex items-center gap-2 mb-6"
							initial={{ opacity: 0, scale: 0.8 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.1 }}
						>
							<motion.div
								className="w-3 h-3 rounded-full bg-red-500"
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ duration: 2, repeat: Infinity, delay: 0 }}
							/>
							<motion.div
								className="w-3 h-3 rounded-full bg-yellow-500"
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
							/>
							<motion.div
								className="w-3 h-3 rounded-full bg-green-500"
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
							/>
						</motion.div>

						<div className="font-mono">
							<motion.p
								className="text-green-500 mb-2"
								initial={{ opacity: 0, x: -10 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.2 }}
							>
								$ contact --info
							</motion.p>
							<motion.h2
								className="text-3xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"
								initial={{ opacity: 0, y: 10 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.3 }}
							>
								Let&apos;s Connect
							</motion.h2>

							<motion.p
								className="text-green-500 mb-2"
								initial={{ opacity: 0, x: -10 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.4 }}
							>
								$ location --current
							</motion.p>
							<motion.div
								className="flex items-center gap-2 text-gray-300 mb-8"
								initial={{ opacity: 0, x: -10 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.45 }}
								whileHover={{ x: 5 }}
							>
								<svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								<span>Santiago, CH</span>
							</motion.div>

							<motion.p
								className="text-green-500 mb-2"
								initial={{ opacity: 0, x: -10 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.5 }}
							>
								$ contact --email
							</motion.p>
							<motion.a
								href="mailto:aaron.fuentesdioca@gmail.com"
								whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
								whileTap={{ scale: 0.98 }}
								className="inline-block mb-8 w-full sm:w-auto max-w-full px-4 sm:px-6 py-3 bg-green-500/10 text-green-400 text-sm sm:text-base rounded-lg border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/50 transition-all break-all sm:break-normal"
								initial={{ opacity: 0, y: 10 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.55 }}
							>
								aaron.fuentesdioca@gmail.com
							</motion.a>

							<motion.p
								className="text-green-500 mb-4"
								initial={{ opacity: 0, x: -10 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.6 }}
							>
								$ ls ./social-links
							</motion.p>
							<motion.div
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
								variants={containerVariants}
								initial="hidden"
								whileInView="visible"
								viewport={{ once: true }}
							>
								{socialLinks.map((link) => (
									<motion.a
										key={link.name}
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										variants={itemVariants}
										whileHover={{ y: -3, scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg hover:bg-green-500/10 hover:border-green-500/50 border border-gray-700/50 group transition-all duration-300"
									>
										<div className="p-2 bg-gray-700/50 group-hover:bg-green-500/20 rounded-lg transition-all">
											<motion.div
												className="text-green-400"
												whileHover={{ rotate: 10 }}
											>
												{link.icon}
											</motion.div>
										</div>
										<div>
											<p className="font-semibold text-gray-200 group-hover:text-green-400 transition-colors">{link.name}</p>
											<p className="text-sm text-gray-400">{link.handle}</p>
										</div>
									</motion.a>
								))}
							</motion.div>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
