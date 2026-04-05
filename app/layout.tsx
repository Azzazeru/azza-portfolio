import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	metadataBase: new URL('https://azzazeru.is-a.dev/'),
	title: {
		default: 'Azzazeru | Aaron Fuentes | Desarrollador Full Stack',
		template: '%s | Azzazeru',
	},
	description:
		'Portafolio de Aaron Fuentes (Azzazeru / Azzazel), desarrollador full stack enfocado en backend, APIs, microservicios, Node.js, Python y arquitectura de software.',
	applicationName: 'Azzazeru Portfolio',
	category: 'technology',
	alternates: {
		canonical: '/',
	},
	keywords: [
		'Aaron Fuentes',
		'Aaron Israel Fuentes Diocares',
		'Azzazeru',
		'Azzazel',
		'Programador',
		'Desarrollador',
		'Desarrollador Full Stack',
		'Programador backend',
		'Portafolio programador',
		'Portafolio desarrollador',
		'Desarrollador Chile',
		'Santiago Chile desarrollador',
		'Desarrollador Fullstack',
		'Ingeniero de Software',
		'Arquitectura de Sistemas',
		'Desarrollo de API',
		'Computación en la Nube',
		'Microservicios',
		'DevOps',
		'Azzazeru',
		'Node.js',
		'Python',
		'Java',
		'Sistemas Distribuidos',
		'Diseño de Sistemas',
	],
	authors: [{ name: 'Aaron Fuentes', url: 'https://azzazeru.is-a.dev/' }],
	creator: 'Azzazeru',
	publisher: 'Azzazeru',
	openGraph: {
		title: 'Azzazeru | Aaron Fuentes | Desarrollador Full Stack',
		description:
			'Conoce el portafolio de Aaron Fuentes (Azzazeru), desarrollador full stack especializado en backend, APIs y arquitectura escalable.',
		url: '/',
		siteName: 'Azzazeru - Portafolio',
		images: [
			{
				url: '/logo.png',
				width: 512,
				height: 512,
				alt: 'Azzazeru - Logo',
			},
		],
		locale: 'es_ES',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Azzazeru | Aaron Fuentes | Desarrollador Full Stack',
		description:
			'Portafolio de Aaron Fuentes (Azzazeru): backend, APIs, microservicios, Node.js, Python y desarrollo full stack.',
		creator: '@azzazeru',
		images: ['/logo.png'],
	},
	verification: {
		google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				{children}
			</body>
		</html>
	);
}
