import React from "react"
import { motion } from "framer-motion"
import { cn } from "../../utils/cn"

const Button = React.forwardRef(({ className, variant = "primary", size = "md", isLoading, ...props }, ref) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    gradient: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-lg shadow-indigo-200"
  }

  const sizes = {
    sm: "h-9 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10"
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {props.children}
    </motion.button>
  )
})

Button.displayName = "Button"

export { Button }
