const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm p-5 ${className}`}>
    {title && <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>}
    {subtitle && <p className="text-xs text-gray-400 mb-3">{subtitle}</p>}
    {children}
  </div>
);

export default ChartCard;
