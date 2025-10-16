import { colors, spacing, typography, borderRadius, shadows } from './tokens';

export const getInputStyles = (hasError = false, isDisabled = false) => {
  const baseStyles = {
    width: '100%',
    padding: `${spacing.sm} ${spacing.md}`,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: borderRadius.base,
    backgroundColor: colors.neutral[50],
    transition: 'all 0.2s ease-in-out',
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary[500],
      boxShadow: `0 0 0 3px ${colors.primary[100]}`,
    },
    '&:disabled': {
      backgroundColor: colors.neutral[200],
      color: colors.neutral[500],
      cursor: 'not-allowed',
    },
  };

  if (hasError) {
    return {
      ...baseStyles,
      borderColor: colors.error[500],
      backgroundColor: colors.error[50],
      '&:focus': {
        borderColor: colors.error[500],
        boxShadow: `0 0 0 3px ${colors.error[100]}`,
      },
    };
  }

  return baseStyles;
};

export const getButtonStyles = (variant = 'primary', size = 'md', isDisabled = false) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamily.sans,
    fontWeight: typography.fontWeight.medium,
    border: 'none',
    borderRadius: borderRadius.base,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    textDecoration: 'none',
    '&:disabled': {
      opacity: '0.6',
      cursor: 'not-allowed',
    },
  };

  const sizeStyles = {
    sm: {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: typography.fontSize.xs,
    },
    md: {
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.fontSize.sm,
    },
    lg: {
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: typography.fontSize.base,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary[500],
      color: 'white',
      '&:hover:not(:disabled)': {
        backgroundColor: colors.primary[600],
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 3px ${colors.primary[100]}`,
      },
    },
    secondary: {
      backgroundColor: colors.neutral[200],
      color: colors.neutral[700],
      '&:hover:not(:disabled)': {
        backgroundColor: colors.neutral[300],
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 3px ${colors.neutral[100]}`,
      },
    },
    danger: {
      backgroundColor: colors.error[500],
      color: 'white',
      '&:hover:not(:disabled)': {
        backgroundColor: colors.error[600],
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 3px ${colors.error[100]}`,
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.neutral[600],
      '&:hover:not(:disabled)': {
        backgroundColor: colors.neutral[100],
      },
    },
  };

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
};

export const getCardStyles = () => ({
  backgroundColor: 'white',
  borderRadius: borderRadius.lg,
  padding: spacing.xl,
  boxShadow: shadows.base,
  border: `1px solid ${colors.neutral[200]}`,
});

export const getFormFieldStyles = () => ({
  marginBottom: spacing.lg,
});

export const getErrorMessageStyles = () => ({
  color: colors.error[600],
  fontSize: typography.fontSize.xs,
  marginTop: spacing.xs,
  display: 'flex',
  alignItems: 'center',
  gap: spacing.xs,
});

export const getLabelStyles = (isRequired = false) => ({
  display: 'block',
  marginBottom: spacing.xs,
  fontWeight: typography.fontWeight.medium,
  color: colors.neutral[700],
  fontSize: typography.fontSize.sm,
  ...(isRequired && {
    '&::after': {
      content: '"*"',
      color: colors.error[500],
      marginLeft: spacing.xs,
    },
  }),
});