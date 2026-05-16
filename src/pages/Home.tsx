import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import HeroSection from '../sections/HeroSection';
import AboutSection from '../sections/AboutSection';
import MissionSection from '../sections/MissionSection';
import ProductsSection from '../sections/ProductsSection';
import SectorsSection from '../sections/SectorsSection';
import StatisticsSection from '../sections/StatisticsSection';
import ContactSection from '../sections/ContactSection';

export default function Home() {
  return (
    <div className="relative">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <MissionSection />
        <ProductsSection />
        <SectorsSection />
        <StatisticsSection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
