import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, ...props }: any) => (
  <div className={cn("bg-terminal-panel border border-terminal-border/30 relative overflow-hidden group", className)} {...props}>
    {/* Subtle corner accent */}
    <div className="absolute top-0 left-0 w-1 h-[2px] bg-terminal-green/40 mt-[-1px]" />
    <div className="absolute top-0 left-0 w-[2px] h-1 bg-terminal-green/40 ml-[-1px]" />
    {children}
  </div>
);

export const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const variants = {
    primary: "bg-terminal-green text-black font-bold hover:bg-terminal-green/90 shadow-[0_0_12px_rgba(0,255,102,0.25)] hover:shadow-[0_0_20px_rgba(0,255,102,0.4)]",
    secondary: "bg-terminal-green/5 border border-terminal-border/40 hover:border-terminal-green/40 text-terminal-green hover:bg-terminal-green/10",
    outline: "border border-terminal-border/30 hover:border-terminal-green/50 text-terminal-text/60 hover:text-terminal-green bg-transparent",
    ghost: "hover:bg-white/5 text-terminal-text/50 hover:text-terminal-green"
  };
  const variantClass = variants[variant as keyof typeof variants] || variants.primary;
  return (
    <button className={cn("px-4 py-2 font-bold uppercase transition-all duration-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[10px] tracking-widest font-mono", variantClass, className)} {...props}>
      {children}
    </button>
  );
};

export const Badge = ({ children, className, variant = 'default', dot = true, ...props }: any) => {
  const variants = {
    default: "bg-terminal-text/5 text-terminal-text/50 border-terminal-border/20",
    positive: "bg-terminal-green/5 text-terminal-green border-terminal-green/20 shadow-[0_0_8px_rgba(0,255,102,0.05)]",
    negative: "bg-terminal-red/5 text-terminal-red border-terminal-red/20 shadow-[0_0_8px_rgba(255,77,77,0.05)]",
    neutral: "bg-terminal-amber/5 text-terminal-amber border-terminal-amber/20 shadow-[0_0_8px_rgba(255,176,32,0.05)]",
    info: "bg-terminal-text/5 text-terminal-text/70 border-terminal-border/30",
    outline: "bg-transparent border-terminal-border/20 text-terminal-text/40",
    violet: "bg-terminal-green/10 text-terminal-green border-terminal-green/30"
  };
  const variantClass = variants[variant as keyof typeof variants] || variants.default;
  return (
    <span className={cn("px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border backdrop-blur-sm", variantClass, className)} {...props}>
      {dot && <span className="w-1 h-1 bg-current opacity-60 rounded-full animate-pulse"></span>}
      {children}
    </span>
  );
}
