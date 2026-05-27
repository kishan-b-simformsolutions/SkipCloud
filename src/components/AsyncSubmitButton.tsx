"use client";

import { write } from "fs";
import { useFormStatus } from "react-dom";

export function AsyncSubmitButton({
  idleLabel,
  pendingLabel,
  className,
  disabled = false,
}: Readonly<{
  idleLabel: string;
  pendingLabel: string;
  className: string;
  disabled?: boolean;
}>) {
  const { pending } = useFormStatus();  

  return (
    <button type="submit" disabled={pending || disabled} className={className}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );

}