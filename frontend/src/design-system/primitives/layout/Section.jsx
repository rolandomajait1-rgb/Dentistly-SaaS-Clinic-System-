import * as config from '../../config';

export default function Section({ 
  children, 
  id, 
  variant = 'default', // 'default' | 'accent' | 'white'
  className = '',
  style = {},
  ...props 
}) {
  const backgrounds = {
    default: 'transparent',
    white: 'transparent',
    accent: 'transparent',
    primary: 'transparent',
    dark: 'transparent',
    muted: 'transparent',
    gradient: 'transparent',
    warm: 'transparent',
    cool: 'transparent',
    neutral: 'transparent',
    rich: 'transparent',
    transparent: 'transparent',
  };

  const styleBg = backgrounds[variant] || backgrounds.default;
  
  return (
    <section
      id={id}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: styleBg,
        paddingTop: config.spacing.section.y.mobile,
        paddingBottom: config.spacing.section.y.mobile,
        ...style
      }}
      {...props}
    >
      {children}
    </section>
  );
}
