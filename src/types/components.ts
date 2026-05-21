import React from 'react';

export interface Option {
  label: string;
  value: string;
  italic?: boolean;
}

export interface OptionGroup {
  label: string;
  options: Option[];
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'social' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  pill?: boolean;
  isLoading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string | React.ReactNode;
  showPasswordToggle?: boolean;
  error?: boolean;
  helperText?: string;
  icon?: React.ElementType;
}

export interface SelectProps {
  label: string | React.ReactNode;
  name?: string;
  options?: Option[];
  groups?: OptionGroup[];
  value?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  hint?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: () => void;
}

export interface MultiSelectProps {
  label: string | React.ReactNode;
  options?: Option[];
  groups?: OptionGroup[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  className?: string;
}

export interface PostJobWizardProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: {
    isScheduled: boolean;
    goLiveDate: string;
    isPrefilled: boolean;
  };
}

export interface SearchableSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  isLoading?: boolean;
}

export interface NationalityTaggerProps {
  label: string;
  hint?: string;
  selected: string[];
  onChange: (nationalities: string[]) => void;
  options: string[];
  popularOptions?: string[];
  placeholder?: string;
  error?: boolean;
  helperText?: string;
}

export interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: (config: {
    isScheduled: boolean;
    goLiveDate: string;
    isPrefilled: boolean;
  }) => void;
}

export interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Record<string, string>;
}
