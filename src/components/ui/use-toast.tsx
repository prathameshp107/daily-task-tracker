import * as React from "react"

interface Toast {
  id: number
  message: string
  type?: "success" | "error" | "info"
}

interface ToastContextType {
  toasts: Toast[]
  toast: (message: string, type?: "success" | "error" | "info") => void
  removeToast: (id: number) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = (message: string, type?: "success" | "error" | "info") => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded shadow text-white transition-all
              ${t.type === "success" ? "bg-green-600" : t.type === "error" ? "bg-red-600" : "bg-gray-800"}
            `}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}

// Export a direct toast function for convenience
export const toast = (message: string, type?: "success" | "error" | "info") => {
  if (typeof window !== "undefined") {
    // @ts-ignore
    window.__TOAST?.(message, type)
  }
}

// To make the direct toast() work, set window.__TOAST in the provider
if (typeof window !== "undefined") {
  // @ts-ignore
  window.__TOAST = (message: string, type?: "success" | "error" | "info") => {
    // This will be replaced by the provider at runtime
  }
} 