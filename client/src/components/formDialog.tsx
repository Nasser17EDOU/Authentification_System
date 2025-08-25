import { CssBaseline, type AlertColor } from "@mui/material";
import type { FormField } from "./FormModal";
import { createRoot } from "react-dom/client";
import { AppThemeProvider } from "../theme/theme";
import FormModal from "./FormModal";

export function formDialog(
  fields: FormField[],
  options?: {
    title?: string;
    confirmText?: string;
    cancelText?: string;
    severity?: AlertColor;
  }
): Promise<Record<string, any> | null> {
  const container = document.createElement("div");
  document.body.appendChild(container);

  return new Promise((resolve) => {
    const root = createRoot(container);

    const handleClose = (result: Record<string, any> | null) => {
      root.unmount();
      container.remove();
      resolve(result);
    };

    root.render(
      <AppThemeProvider>
        <CssBaseline />
        <FormModal
          open={true}
          onClose={handleClose}
          fields={fields}
          title={options?.title}
          confirmText={options?.confirmText}
          cancelText={options?.cancelText}
          severity={options?.severity}
        />
      </AppThemeProvider>
    );
  });
}

export const inputValidator = (
  input: string,
  validation: {
    minLength?: number;
    maxLength?: number;
    reg?: RegExp;
  }
): string | null => {
  const { minLength, maxLength, reg } = validation;

  if (minLength && input.length < minLength) {
    return `Ne respecte pas le nombre de caractères minimal (${minLength})`;
  }

  if (maxLength && input.length > maxLength) {
    return `Ne respecte pas le nombre de caractères maximal (${maxLength})`;
  }

  if (reg && !reg.test(input)) {
    return "Format invalide";
  }

  return null; // ok
};
