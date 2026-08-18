import * as config from '../../config';

export default function Container({ children, className = '', ...props }) {
  return (
    <div
      className={`mx-auto relative z-10 ${className}`}
      style={{
        maxWidth: config.spacing.container.maxWidth,
        paddingLeft: config.spacing.container.padding,
        paddingRight: config.spacing.container.padding,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
