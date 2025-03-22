export function Button({ children, className = "", variant = "default", size = "default", ...props }) {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
    const variantStyles = {
      default: "bg-green-600 text-white hover:bg-green-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-100",
      secondary: "bg-white text-gray-900 hover:bg-gray-100",
      ghost: "bg-transparent hover:bg-gray-100",
      link: "bg-transparent underline-offset-4 hover:underline text-green-600 hover:bg-transparent",
    }
  
    const sizeStyles = {
      default: "h-10 py-2 px-4 rounded-md",
      sm: "h-8 px-3 rounded-md text-sm",
      lg: "h-12 px-8 rounded-md text-lg",
      icon: "h-10 w-10 rounded-full",
    }
  
    const combinedClassName = `${baseStyles} ${variantStyles[variant] || ""} ${sizeStyles[size] || ""} ${className}`
  
    return (
      <button className={combinedClassName} {...props}>
        {children}
      </button>
    )
  }
  
  