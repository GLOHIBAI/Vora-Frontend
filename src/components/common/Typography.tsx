import React from 'react';

type TypographyProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span';
  id?: string;
};

const merge = (base: string, className?: string) => (className ? `${base} ${className}` : base);

/** Dashboard / onboarding page titles (h1 → Montserrat via global CSS). */
export const PageTitle: React.FC<TypographyProps> = ({ children, className, as: Tag = 'h1' }) => (
  <Tag className={merge('text-xl sm:text-2xl font-semibold text-[#1C1C1C] tracking-tight', className)}>
    {children}
  </Tag>
);

/** Primary title inside a wizard step card. */
export const WizardStepTitle: React.FC<TypographyProps> = ({ children, className, as: Tag = 'h2' }) => (
  <Tag className={merge('text-[20px] font-semibold text-[#1A1A1A] tracking-tight', className)}>
    {children}
  </Tag>
);

/** Major section heading within a wizard step. */
export const SectionTitle: React.FC<TypographyProps> = ({ children, className, as: Tag = 'h2' }) => (
  <Tag className={merge('text-xl md:text-[22px] font-semibold text-[#1A1A1A] tracking-tight', className)}>
    {children}
  </Tag>
);

/** Subsection heading (e.g. eligibility block). */
export const SubsectionTitle: React.FC<TypographyProps> = ({ children, className, as: Tag = 'h3' }) => (
  <Tag className={merge('text-[15px] font-semibold text-[#1A1A1A] tracking-tight', className)}>
    {children}
  </Tag>
);

/** Card / panel title. */
export const CardTitle: React.FC<TypographyProps> = ({ children, className, as: Tag = 'h3' }) => (
  <Tag className={merge('text-[15px] font-semibold text-[#1A1A1A]', className)}>{children}</Tag>
);

/** Drawer / modal primary title. */
export const DrawerTitle: React.FC<TypographyProps> = ({
  children,
  className,
  as: Tag = 'h2',
  id,
}) => (
  <Tag id={id} className={merge('text-[22px] font-semibold text-[#1A1A1A] tracking-tight', className)}>
    {children}
  </Tag>
);

export const ModalTitle: React.FC<TypographyProps> = ({
  children,
  className,
  as: Tag = 'h2',
  id,
}) => (
  <Tag id={id} className={merge('text-[17px] font-semibold text-[#1A1A1A]', className)}>
    {children}
  </Tag>
);

/** Uppercase field label in preview / summary grids. */
export const FieldLabel: React.FC<TypographyProps> = ({ children, className, as: Tag = 'div' }) => (
  <Tag className={merge('text-[11px] font-semibold text-[#808080] uppercase tracking-[0.04em]', className)}>
    {children}
  </Tag>
);

/** Muted helper under titles. */
export const SectionDescription: React.FC<TypographyProps> = ({
  children,
  className,
  as: Tag = 'p',
}) => (
  <Tag className={merge('text-[13px] text-[#808080] leading-relaxed', className)}>{children}</Tag>
);

/** Settings / dashboard section heading (h2). */
export const SectionHeading: React.FC<TypographyProps> = ({
  children,
  className,
  as: Tag = 'h2',
}) => (
  <Tag className={merge('text-xl font-semibold text-gray-900 tracking-tight', className)}>
    {children}
  </Tag>
);

/** In-section subheading (h3). */
export const Subheading: React.FC<TypographyProps> = ({
  children,
  className,
  as: Tag = 'h3',
}) => (
  <Tag className={merge('text-sm font-semibold text-gray-900', className)}>{children}</Tag>
);

/** Tiny uppercase labels (stats, form groups). */
export const MicroLabel: React.FC<TypographyProps> = ({
  children,
  className,
  as: Tag = 'div',
}) => (
  <Tag
    className={merge(
      'text-[10px] font-semibold text-gray-400 uppercase tracking-widest',
      className
    )}
  >
    {children}
  </Tag>
);

/** Large numeric / KPI display. */
export const DisplayStat: React.FC<TypographyProps> = ({
  children,
  className,
  as: Tag = 'div',
}) => (
  <Tag className={merge('text-3xl font-semibold leading-none', className)}>{children}</Tag>
);
