import Hero from '../../components/home/Hero';
import BusinessValue from '../../components/home/BusinessValue';
import CoreBusinessAreas from '../../components/home/CoreBusinessAreas';
import ServiceExplorer from '../../components/home/ServiceExplorer';
import Stats from '../../components/home/Stats';
import SAPCapabilitiesPreview from '../../components/home/SAPCapabilitiesPreview';
import IndustriesGrid from '../../components/home/IndustriesGrid';
import CTASection from '../../components/home/CTASection';

const HomePage = () => {
  return (
    <div>
      <Hero />
      <BusinessValue />
      <CoreBusinessAreas />
      <ServiceExplorer />
      <Stats />
      <SAPCapabilitiesPreview />
      <IndustriesGrid />
      <CTASection />
    </div>
  );
};

export default HomePage;
