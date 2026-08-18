import * as config from '../../config';

export default function Heading({ 
  level = 2, // 1 | 2 | 3
  children, 
  gradient = false,
  className = '',
  ...props 
}) {
  const Tag = `h${level}`;
  const typo = config.typography.headings[`h${level}`] || config.typography.headings.h2;
  
  const baseStyle = {
    fontWeight: typo.fontWeight,
    lineHeight: typo.lineHeight,
    letterSpacing: typo.letterSpacing,
    color: config.colors.slate[900],
  };

  const responsiveClass = level === 1 
    ? 'text-[40px] sm:text-[48px] md:text-[58px] lg:text-[64px]'
    : level === 2
    ? 'text-[30px] md:text-[48px]'
    : 'text-[24px] md:text-[36px]';

  return (
    <Tag
      className={`${responsiveClass} ${gradient ? 'text-transparent bg-clip-text' : ''} ${className}`}
      style={{
        ...baseStyle,
        ...(gradient && { backgroundImage: config.colors.gradients.textPrimary }),
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
