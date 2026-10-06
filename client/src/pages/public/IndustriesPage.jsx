import { Link } from 'react-router-dom';
import IndustriesGrid from '../../components/home/IndustriesGrid';

const IndustriesPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-primary-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Industries We Serve</h1>
          <p className="text-xl text-primary-200 max-w-2xl mx-auto">
            Our ERP solutions, SAP expertise, and specialized staffing services are tailored to meet the strict demands of diverse sectors.
          </p>
        </div>
      </div>

      {/* Reusing the IndustriesGrid component from the homepage */}
      <div className="-mt-12">
        <IndustriesGrid />
      </div>

      {/* Deep Dive Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-200">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary-900 mb-6">Why Industry Experience Matters</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="text-accent-500 mt-1">✓</span>
                <div>
                  <h3 className="font-bold text-lg text-primary-900">Regulatory Compliance</h3>
                  <p className="text-gray-600 mt-1">We understand the specific compliance, security, and audit requirements of sectors like Healthcare and Finance.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-accent-500 mt-1">✓</span>
                <div>
                  <h3 className="font-bold text-lg text-primary-900">Custom Workflows</h3>
                  <p className="text-gray-600 mt-1">Manufacturing supply chains operate differently than retail logistics. Our SAP consultants configure systems to match your reality.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-accent-500 mt-1">✓</span>
                <div>
                  <h3 className="font-bold text-lg text-primary-900">Niche Talent Sourcing</h3>
                  <p className="text-gray-600 mt-1">Our staffing division knows exactly where to find professionals with specific industry-certified experience.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
             <div className="text-6xl mb-6">🌍</div>
             <h3 className="text-2xl font-bold text-primary-900 mb-4">Don't see your industry?</h3>
             <p className="text-gray-600 mb-8">
               Our core technology solutions are highly adaptable. We likely have experience solving operational challenges similar to yours.
             </p>
             <Link to="/contact" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded shadow transition">
               Discuss Your Requirements
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustriesPage;
