import React from 'react';

const FormField = ({ label, name, required, optional, error, children, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label htmlFor={name} className="text-[10px] font-bold text-muted uppercase tracking-wider">
        {label}
        {required && <span className="text-destructive ml-1">*Required</span>}
        {optional && <span className="text-muted/50 ml-1 font-normal normal-case">(Optional)</span>}
      </label>
    )}
    {children}
    {error && <p className="text-[11px] font-semibold text-destructive mt-0.5">{error}</p>}
  </div>
);

const Input = React.forwardRef(({ label, name, required, optional, error, className = '', ...props }, ref) => (
  <FormField label={label} name={name} required={required} optional={optional} error={error}>
    <input
      id={name}
      name={name}
      ref={ref}
      className={`w-full px-4 py-3 bg-background/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
        error ? 'border-destructive/60 ring-2 ring-destructive/20' : 'border-border/50'
      } ${className}`}
      {...props}
    />
  </FormField>
));

const Select = React.forwardRef(({ label, name, required, optional, error, children, className = '', ...props }, ref) => (
  <FormField label={label} name={name} required={required} optional={optional} error={error}>
    <select
      id={name}
      name={name}
      ref={ref}
      className={`w-full px-4 py-3 bg-background/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none ${
        error ? 'border-destructive/60 ring-2 ring-destructive/20' : 'border-border/50'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  </FormField>
));

const Textarea = React.forwardRef(({ label, name, required, optional, error, className = '', ...props }, ref) => (
  <FormField label={label} name={name} required={required} optional={optional} error={error}>
    <textarea
      id={name}
      name={name}
      ref={ref}
      className={`w-full px-4 py-3 bg-background/50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none ${
        error ? 'border-destructive/60 ring-2 ring-destructive/20' : 'border-border/50'
      } ${className}`}
      {...props}
    />
  </FormField>
));

Input.displayName = 'FormInput';
Select.displayName = 'FormSelect';
Textarea.displayName = 'FormTextarea';

export { FormField, Input, Select, Textarea };
export default FormField;
