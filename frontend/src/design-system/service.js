// DesignSystemService - Validated getters for design tokens
import * as config from './config';

export const getColor = (path) => {
  const keys = path.split('.');
  let value = config.colors;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`[DesignSystem] Color token "${path}" not found`);
      return '#000000';
    }
  }
  return value;
};

export const getTypography = (variant) => {
  const value = config.typography.headings?.[variant] || config.typography.body?.[variant] || config.typography[variant];
  if (!value) {
    console.warn(`[DesignSystem] Typography variant "${variant}" not found`);
    return config.typography.body.medium;
  }
  return value;
};

export const getSpacing = (key) => {
  const value = config.spacing.gaps?.[key];
  if (!value) {
    console.warn(`[DesignSystem] Spacing "${key}" not found`);
    return config.spacing.gaps.md;
  }
  return value;
};

export const getBorderRadius = (variant) => {
  if (variant === 'badge' || variant === 'button') {
    return config.borderRadius[variant];
  }
  const value = config.borderRadius.card?.[variant];
  if (!value) {
    console.warn(`[DesignSystem] Border radius "${variant}" not found`);
    return config.borderRadius.card.medium;
  }
  return value;
};

export const getShadow = (level) => {
  const value = config.shadows[level] || config.shadows.hover?.[level];
  if (!value) {
    console.warn(`[DesignSystem] Shadow "${level}" not found`);
    return config.shadows.none;
  }
  return value;
};

export const getAnimation = (property) => {
  return config.animations[property] || config.animations.easing.standard;
};
