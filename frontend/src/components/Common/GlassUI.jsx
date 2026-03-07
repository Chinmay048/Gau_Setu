export const GlassCard = ({ children, className = '' }) => (
  <div className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-xl ${className}`}>
    {children}
  </div>
);

export const GlassButton = ({ children, variant = 'primary', onClick, disabled = false, className = '' }) => {
  const baseStyle = 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 font-medium';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105 disabled:opacity-50',
    secondary: 'bg-white/10 text-white border border-white/30 hover:bg-white/20',
    danger: 'bg-red-500/80 text-white hover:bg-red-600',
    success: 'bg-green-500/80 text-white hover:bg-green-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const GlassInput = ({ label, type = 'text', name, placeholder, value, onChange, error, required, className = '' }) => (
  <div className={`flex flex-col ${className}`}>
    {label && <label className="text-white font-semibold mb-2">{label}</label>}
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`backdrop-blur-sm bg-white/10 border ${
        error ? 'border-red-400' : 'border-white/30'
      } rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-all`}
    />
    {error && <span className="text-red-300 text-sm mt-1">{error}</span>}
  </div>
);

export const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
  </div>
);

export const ErrorAlert = ({ message, onClose }) => (
  <div className="backdrop-blur-md bg-red-500/20 border border-red-400 rounded-lg p-4 text-red-200 flex justify-between items-center">
    <span>{message}</span>
    {onClose && <button onClick={onClose} className="text-red-200 hover:text-red-100">✕</button>}
  </div>
);

export const SuccessAlert = ({ message }) => (
  <div className="backdrop-blur-md bg-green-500/20 border border-green-400 rounded-lg p-4 text-green-200">
    {message}
  </div>
);
