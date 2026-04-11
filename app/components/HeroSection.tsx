'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.3,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.8, ease: 'easeOut' as const },
		},
	};

	const skills = ['Node.js', 'Java', 'Python', 'Linux', 'Git', 'Docker', 'Azure'];

	return (
		<section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden">
			{/* Floating orbs effect */}
			<motion.div
				className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"
				animate={{
					y: [0, 20, 0],
					opacity: [0.3, 0.5, 0.3],
				}}
				transition={{
					duration: 8,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
			/>
			<motion.div
				className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
				animate={{
					y: [0, -20, 0],
					opacity: [0.3, 0.5, 0.3],
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					ease: 'easeInOut',
				}}
			/>

			<div className="relative z-10 max-w-4xl w-full mx-4">
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					whileHover={{ boxShadow: '0 25px 50px rgba(34, 197, 94, 0.2)' }}
					className="bg-black/90 backdrop-blur-lg rounded-lg border border-gray-700/80 p-6 hover:border-green-500/50 transition-all duration-300 shadow-2xl"
				>
					<div className="flex items-center gap-2 mb-4">
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
					</div>
					<div className="font-mono">
						<motion.p
							className="text-gray-400 text-xs"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.15 }}
						>
							$ cd ~/about
						</motion.p>
						<motion.p
							className="text-green-500"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
						>
							$ whoami
						</motion.p>
						<motion.h1
							className="text-3xl sm:text-4xl md:text-5xl leading-tight font-bold mt-2 mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent break-words"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
						>
							Aaron Fuentes{' '}
							<span className="block sm:inline">(Azzazeru)</span>
						</motion.h1>
						<motion.p
							className="text-green-500"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.5 }}
						>
							$ role
						</motion.p>
						<motion.p
							className="text-gray-300 text-sm mb-2"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.55 }}
						>
							Desarrollador Full Stack
						</motion.p>
						<motion.p
							className="text-green-500"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.6 }}
						>
							$ group
						</motion.p>
						<motion.p
							className="text-gray-300 text-sm mb-2"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.65 }}
						>
							Ingeniero Informatico
						</motion.p>
						<motion.p
							className="text-green-500"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.7 }}
						>
							$ skills
						</motion.p>
						<motion.div
							className="flex flex-wrap gap-2 mt-2"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
						>
							{skills.map((skill) => (
								<motion.span
									key={skill}
									variants={itemVariants}
									whileHover={{
										scale: 1.1,
										backgroundColor: 'rgba(34,197,94,0.2)',
										borderColor: 'rgba(34,197,94,1)',
									}}
									className="px-3 py-1 bg-green-500/10 rounded-md border border-green-500/20 hover:border-green-500/50 transition-colors cursor-pointer"
								>
									{skill}
								</motion.span>
							))}
						</motion.div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
