import { useMemo } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import HeroSection from '../sections/HeroSection';
import AboutSection from '../sections/AboutSection';
import MissionSection from '../sections/MissionSection';
import ProductionSection from '../sections/ProductionSection';
import PvcGeomembraneSection from '../sections/PvcGeomembraneSection';
import HdpeGeomembraneSection from '../sections/HdpeGeomembraneSection';
import GeocellSection from '../sections/GeocellSection';
import ProductsSection from '../sections/ProductsSection';
import SectorsSection from '../sections/SectorsSection';
import StatisticsSection from '../sections/StatisticsSection';
import ContactSection from '../sections/ContactSection';
import ContentSection from '../sections/ContentSection';
import { trpc } from '@/providers/trpc';
import {
  getCmsSectionAnchor,
  getDefaultCmsSectionRows,
  type CmsSectionLike,
  type CmsSectionRecord,
} from '@contracts/cms';

function getSectionRenderKey(section: CmsSectionLike) {
  const anchor = getCmsSectionAnchor(section.sectionType, section.slug);
  return section.sectionType === 'content' ? `content:${anchor}` : section.sectionType;
}

export default function Home() {
  const { data: sectionList } = trpc.cms.sectionList.useQuery();

  const sections = useMemo(() => {
    const source = sectionList?.length ? sectionList : getDefaultCmsSectionRows();
    const ordered = [...source]
      .filter((section) => section.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    const seen = new Set<string>();
    return ordered.filter((section) => {
      const key = getSectionRenderKey(section);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [sectionList]);

  return (
    <div className="relative">
      <Navigation />
      <main>
        {sections.map((section) => {
          switch (section.sectionType) {
            case 'hero':
              return <HeroSection key={getSectionRenderKey(section)} />;
            case 'about':
              return <AboutSection key={getSectionRenderKey(section)} />;
            case 'mission':
              return <MissionSection key={getSectionRenderKey(section)} />;
            case 'production':
              return <ProductionSection key={getSectionRenderKey(section)} />;
            case 'pvcGeomembrane':
              return <PvcGeomembraneSection key={getSectionRenderKey(section)} />;
            case 'hdpeGeomembrane':
              return <HdpeGeomembraneSection key={getSectionRenderKey(section)} />;
            case 'geocell':
              return <GeocellSection key={getSectionRenderKey(section)} />;
            case 'products':
              return <ProductsSection key={getSectionRenderKey(section)} />;
            case 'sectors':
              return <SectorsSection key={getSectionRenderKey(section)} />;
            case 'statistics':
              return <StatisticsSection key={getSectionRenderKey(section)} />;
            case 'contact':
              return <ContactSection key={getSectionRenderKey(section)} />;
            case 'content':
              return (
                <ContentSection
                  key={getSectionRenderKey(section)}
                  section={section as CmsSectionRecord}
                />
              );
            default:
              return null;
          }
        })}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
