"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  confirm: (message: string, title?: string) => Promise<boolean>;
};

type ConfirmState = {
  open: boolean;
  title: string;
  message: string;
  resolve: ((value: boolean) => void) | null;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: "Confirm Action",
    message: "",
    resolve: null
  });

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  const value = useMemo<ToastContextValue>(() => ({
    success: (message: string) => showToast("success", message),
    error: (message: string) => showToast("error", message),
    info: (message: string) => showToast("info", message),
    confirm: (message: string, title = "Confirm Action") =>
      new Promise<boolean>((resolve) => {
        setConfirmState({
          open: true,
          title,
          message,
          resolve
        });
      })
  }), [showToast]);

  const closeConfirm = (value: boolean) => {
    if (confirmState.resolve) {
      confirmState.resolve(value);
    }

    setConfirmState({
      open: false,
      title: "Confirm Action",
      message: "",
      resolve: null
    });
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-9999 flex w-full max-w-sm flex-col gap-2 px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm text-white shadow-lg ${
              toast.type === "success"
                ? "border-green-500/30 bg-green-600/90"
                : toast.type === "error"
                  ? "border-red-500/30 bg-red-600/90"
                  : "border-blue-500/30 bg-blue-600/90"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-white/80 hover:text-white"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmState.open && (
        <div className="fixed inset-0 z-9998 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-white/15 bg-slate-900 p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">{confirmState.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{confirmState.message}</p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="min-h-10 px-4 py-2 rounded-lg border border-white/20 text-slate-200 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className="min-h-10 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
