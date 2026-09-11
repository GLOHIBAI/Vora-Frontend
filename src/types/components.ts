import React from 'react';
import type { PostJobContinueConfig } from './rolePosting';

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
  variant?: 'primary' | 'secondary' | 'outline' | 'primary-outline' | 'social' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  pill?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string | React.ReactNode;
  showPasswordToggle?: boolean;
  error?: boolean;
  helperText?: string;
  icon?: React.ElementType;
}

export interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
}

export interface SelectProps {
  label?: string | React.ReactNode;
  hideLabel?: boolean;
  variant?: 'default' | 'inline' | 'compact';
  menuClassName?: string;
  name?: string;
  options?: Option[];
  groups?: OptionGroup[];
  value?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  hint?: string;
  className?: string;
  disabled?: boolean;
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
  initialConfig?: PostJobContinueConfig;
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
  onContinue?: (config: PostJobContinueConfig) => void;
}

export interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Record<string, string>;
}
