import React from "react"
import { cn } from "../../utils/cn"

const Card = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm transition-all hover:shadow-md",
      className
    )}
    {...props}
  />
)

const CardHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
)

const CardTitle = ({ className, ...props }) => (
  <h3 className={cn("text-2xl font-bold leading-none tracking-tight", className)} {...props} />
)

const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-slate-500", className)} {...props} />
)

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
)

const CardFooter = ({ className, ...props }) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
)

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
