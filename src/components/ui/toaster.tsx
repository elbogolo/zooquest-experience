
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        className: "rounded-lg",
        style: {
          background: "white",
          color: "black",
          border: "1px solid #e2e8f0",
        }
      }}
    />
  );
}
