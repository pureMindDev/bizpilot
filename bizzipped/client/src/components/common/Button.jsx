import { FiLoader } from 'react-icons/fi';

export default function Button({
  children,
  variant = 'primary',
  size = '',
  loading = false,
  icon: Icon,
  className = '',
  disabled,
  ...rest
}) {
  return (
    <button
      className={`btn btn-${variant} ${size ? `btn-${size}` : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <FiLoader className="spin" /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  );
}
