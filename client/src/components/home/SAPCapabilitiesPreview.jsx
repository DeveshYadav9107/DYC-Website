import { Link } from 'react-router-dom';

const SAPCapabilitiesPreview = () => {
  const capabilities = [
    { name: 'SAP S/4HANA', type: 'Environment' },
    { name: 'SAP FICO', type: 'Functional' },
    { name: 'SAP MM', type: 'Functional' },
    { name: 'SAP SD', type: 'Functional' },
    { name: 'SAP ABAP', type: 'Technical' },
    { name: 'SAP Fiori', type: 'Technical' },
    { name: 'SAP Basis', type: 'Technical' },
    { name: 'SAP SuccessFactors', type: 'Cloud' },
  ];

  return (
    <section className="py-24 bg-gray-50 border-t border-gray-200 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="text-accent-600 font-bold uppercase tracking-wider text-sm mb-2">Our Expertise</div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">Deep SAP Capabilities</h2>
            <p className="text-lg text-gray-600">
              From legacy systems to S/4HANA, our certified consultants bring deep module-specific expertise to your enterprise.
            </p>
          </div>
          <Link to="/sap-capabilities" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded shadow font-medium transition whitespace-nowrap">
            View All Capabilities
          </Link>
        </div>

        <div className="flex flex-wrap gap-4">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="bg-white border border-gray-200 px-6 py-4 rounded-lg shadow-sm hover:border-primary-300 hover:shadow-md transition cursor-default flex flex-col justify-center">
              <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">{cap.type}</div>
              <div className="font-bold text-primary-900">{cap.name}</div>
            </div>
          ))}
          <Link to="/sap-capabilities" className="px-6 py-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-primary-500 hover:text-primary-600 transition flex items-center justify-center font-medium">
            + More Modules
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SAPCapabilitiesPreview;
