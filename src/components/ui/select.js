import * as React from "react"

const Select = React.forwardRef(({ className = "", children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = "Select"

const SelectOption = React.forwardRef(({ className = "", children, ...props }, ref) => {
  return (
    <option
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </option>
  )
})
SelectOption.displayName = "SelectOption"

export { Select, SelectOption }
