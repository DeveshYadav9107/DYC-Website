import { Link } from 'react-router-dom';

const SAPCapabilitiesPage = () => {
  const categories = [
    {
      title: 'Functional Modules',
      desc: 'Optimize your core business processes with expert configuration.',
      modules: [
        { name: 'SAP FICO', full: 'Financial Accounting & Controlling', icon: '💰' },
        { name: 'SAP MM', full: 'Materials Management', icon: '📦' },
        { name: 'SAP SD', full: 'Sales and Distribution', icon: '📈' },
        { name: 'SAP HR/HCM', full: 'Human Capital Management', icon: '👥' },
        { name: 'SAP PP', full: 'Production Planning', icon: '🏭' },
        { name: 'SAP PM', full: 'Plant Maintenance', icon: '🔧' },
      ]
    },
    {
      title: 'Technical Modules',
      desc: 'Robust development, integration, and system administration.',
      modules: [
        { name: 'SAP ABAP', full: 'Advanced Business Application Programming', icon: '💻' },
        { name: 'SAP Basis', full: 'System Administration', icon: '⚙️' },
        { name: 'SAP Fiori / UI5', full: 'User Experience & Interfaces', icon: '📱' },
        { name: 'SAP PI/PO', full: 'Process Integration / Orchestration', icon: '🔄' },
      ]
    },
    {
      title: 'Cloud & Environments',
      desc: 'Modernize your landscape with the latest SAP innovations.',
      modules: [
        { name: 'SAP S/4HANA', full: 'Next-generation ERP', icon: '☁️' },
        { name: 'SAP SuccessFactors', full: 'Cloud HR', icon: '🌟' },
        { name: 'SAP Ariba', full: 'Procurement & Supply Chain', icon: '🛒' },
      ]
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-primary-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent-400 via-primary-900 to-primary-900"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">SAP Capabilities</h1>
          <p className="text-xl text-primary-200 max-w-3xl">
            We provide comprehensive SAP expertise across the entire enterprise landscape. From legacy ECC systems to modern S/4HANA transformations, our certified consultants deliver end-to-end solutions.
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        {categories.map((category, idx) => (
          <div key={idx}>
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-primary-900 mb-3">{category.title}</h2>
              <p className="text-lg text-gray-600">{category.desc}</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.modules.map((mod, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition group cursor-default">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-primary-100 transition">
                      {mod.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-primary-900 mb-1">{mod.name}</h3>
                      <p className="text-gray-500 text-sm">{mod.full}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-white border-t border-gray-200 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-primary-900 mb-4">Need a specific SAP expert?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Whether you need a single ABAP developer or a full functional team for an S/4HANA rollout, we can deploy the right talent quickly.
        </p>
        <Link to="/contact" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded shadow transition">
          Request SAP Resources
        </Link>
      </div>
    </div>
  );
};

export default SAPCapabilitiesPage;
