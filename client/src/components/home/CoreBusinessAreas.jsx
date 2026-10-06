import { Link } from 'react-router-dom';

const CoreBusinessAreas = () => {
  const areas = [
    {
      title: 'Manpower Supply',
      desc: 'Skilled IT and non-IT professionals for contract and permanent roles.',
      icon: '👥',
      link: '/services/staffing',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'SAP Resources',
      desc: 'Expert functional and technical SAP consultants for your projects.',
      icon: '⚙️',
      link: '/services/sap-resources',
      color: 'bg-accent-50 text-accent-600',
    },
    {
      title: 'SAP Support',
      desc: 'Comprehensive AMS, migration, and optimization services.',
      icon: '🛠️',
      link: '/services/sap-support',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'ERP Solutions',
      desc: 'Custom-built software for payroll, sales, and business trackability.',
      icon: '💻',
      link: '/services/erp-solutions',
      color: 'bg-green-50 text-green-600',
    },
  ];

  return (
    <section className="py-24 bg-gray-50 px-6 border-y border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">What We Do</h2>
            <p className="text-xl text-gray-600">
              Comprehensive enterprise solutions spanning people, processes, and technology.
            </p>
          </div>
          <Link to="/services" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2">
            View All Services <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {areas.map((area, idx) => (
            <Link key={idx} to={area.link} className="block group">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full hover:shadow-lg hover:border-primary-100 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-white rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className={`w-16 h-16 rounded-xl ${area.color} flex items-center justify-center text-3xl mb-8 relative z-10`}>
                  {area.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-primary-900 mb-4 relative z-10 group-hover:text-primary-600 transition-colors">
                  {area.title}
                </h3>
                
                <p className="text-gray-600 mb-8 relative z-10">
                  {area.desc}
                </p>
                
                <div className="text-primary-600 font-medium flex items-center gap-2 relative z-10 group-hover:gap-3 transition-all">
                  Learn more <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreBusinessAreas;
