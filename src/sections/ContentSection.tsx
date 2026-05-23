import { useLanguage } from '../context/LanguageContext';
import { getCmsSectionLabel, pickLocalizedText, type CmsSectionRecord } from '@contracts/cms';
import { resolveCmsAssetUrl } from '@/lib/assetUrl';
import WatermarkedImage from '../components/WatermarkedImage';

type ContentSectionProps = {
  section: CmsSectionRecord;
};

export default function ContentSection({ section }: ContentSectionProps) {
  const { language, t } = useLanguage();

  const eyebrow = pickLocalizedText(
    section,
    'eyebrow',
    language,
    getCmsSectionLabel('content', language)
  );
  const title = pickLocalizedText(
    section,
    'title',
    language,
    section.slug.replace(/-/g, ' ')
  );
  const body = pickLocalizedText(
    section,
    'content',
    language,
    t('İçerik eklenmedi.', 'İçerik eklenmedi.', 'No content added yet.')
  );
  const imageUrl = section.imageUrl ? resolveCmsAssetUrl(section.imageUrl) : '';

  return (
    <section id={section.slug} className="section-shell section-padding">
      <div className="content-max">
        <div className={`grid gap-8 ${imageUrl ? 'lg:grid-cols-[1.02fr_0.98fr]' : 'max-w-4xl mx-auto'}`}>
          <div className="surface-dark rounded-[2rem] p-8 md:p-10 text-white">
            <span className="section-kicker text-[#9DBC92]">{eyebrow}</span>
            <h2
              className="mt-4 font-display tracking-[-0.04em]"
              style={{ fontSize: 'clamp(2.2rem, 4.2vw, 4.2rem)', lineHeight: 1.05 }}
            >
              {title}
            </h2>
            <div className="mt-6 space-y-4 text-base md:text-lg leading-8 text-white/76 whitespace-pre-line">
              {body}
            </div>
          </div>

          {imageUrl && (
            <div className="surface rounded-[2rem] overflow-hidden">
              <WatermarkedImage
                src={imageUrl}
                alt={title}
                className="h-full min-h-[320px] w-full md:min-h-[460px]"
                imgClassName="h-full min-h-[320px] w-full object-cover md:min-h-[460px]"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
