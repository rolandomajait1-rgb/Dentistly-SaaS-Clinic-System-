import * as config from '../../config';

export default function Badge({ 
  children, 
  variant = 'primary', // 'primary' | 'success' | 'error'
  icon,
  pulse = false,
  className = '',
  ...props 
}) {
  const variants = {
    primary: {
      bg: `${config.colors.primary.base}0d`, // 5% opacity
      border: `${config.colors.primary.base}33`, // 20% opacity
      text: config.colors.primary.base,
    },
    secondary: {
      bg: `${config.colors.indigo}1a`, // 10% opacity
      border: `${config.colors.indigo}33`, // 20% opacity
      text: config.colors.indigo,
    },
    success: {
      bg: `${config.colors.emerald}1a`,
      border: `${config.colors.emerald}33`,
      text: config.colors.emerald,
    },
    error: {
      bg: `${config.colors.error.base}1a`,
      border: `${config.colors.error.base}33`,
      text: config.colors.error.base,
    },
  };

  const style = variants[variant] || variants.primary;

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 ${className}`}
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: config.borderRadius.badge,
        fontSize: config.typography.badge.fontSize,
        fontWeight: config.typography.badge.fontWeight,
        letterSpacing: config.typography.badge.letterSpacing,
        textTransform: config.typography.badge.textTransform,
        color: style.text,
      }}
      {...props}
    >
      {pulse && (
        <span
          className="rounded-full animate-pulse"
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: style.text,
          }}
        />
      )}
      {icon}
      {children}
    </div>
  );
}
