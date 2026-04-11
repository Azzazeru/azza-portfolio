import HeroSection from '@components/HeroSection';
import Projects from '@/app/components/Projects';
import Certifications from '@/app/components/Certifications';
import ContactSection from '@components/ContactSection';

export default function BackendPortfolio() {
	const structuredData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Person',
				name: 'Aaron Fuentes',
				alternateName: ['Azzazeru', 'Azzazel'],
				url: 'https://azzazeru.is-a.dev/',
				jobTitle: 'Desarrollador Full Stack',
				knowsAbout: [
					'Backend Development',
					'Node.js',
					'Python',
					'Microservicios',
					'APIs REST',
					'Arquitectura de Software',
				],
				sameAs: [
					'https://github.com/Azzazeru',
					'https://www.linkedin.com/in/aaron-fuentes-diocares/',
				],
			},
			{
				'@type': 'WebSite',
				name: 'Azzazeru - Portafolio',
				url: 'https://azzazeru.is-a.dev/',
				inLanguage: 'es',
			},
		],
	};

	return (
		<main className="min-h-screen text-white overflow-x-hidden">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<HeroSection />
			<Certifications />
			<Projects />
			<ContactSection />
		</main>
	);
}
