"use client";

import { useState } from "react";
import { createManagedUserAccount, mapFirebaseAuthError } from "@/firebase/auth";
import { sanitizeProvisionedUserProfile } from "@/lib/formValidation";
import { parseUserUpload } from "@/utils/excelParser";
import { UploadUserRow, UserRecord } from "@/types";

export function ExcelUpload({ currentUser, onUploaded }: Readonly<{ currentUser: UserRecord; onUploaded: () => Promise<void> }>) {
  const [rows, setRows] = useState<UploadUserRow[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    const parsedRows = await parseUserUpload(file);
    setRows(parsedRows);
    setStatus(`${parsedRows.length} users ready to import`);
  }

  async function uploadUsers() {
    setLoading(true);
    setStatus("Creating auth accounts and member records...");

    try {
      for (const row of rows) {
        const normalizedRow = sanitizeProvisionedUserProfile(row);
        await createManagedUserAccount({
          id: "pending",
          firstName: normalizedRow.firstName,
          lastName: normalizedRow.lastName,
          email: normalizedRow.email,
          position: normalizedRow.position,
          orgId: currentUser.orgId,
          role: "user",
        });
      }

      await onUploaded();
      setStatus(`Imported ${rows.length} users. They can sign in with the default temporary password.`);
      setRows([]);
    } catch (error) {
      setStatus(mapFirebaseAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-panel rounded-[2rem] p-6 text-white">
      <div className="mb-4">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-100/70">Bulk import</p>
        <h3 className="mt-2 text-lg font-semibold text-white">Bulk upload members</h3>
        <p className="mt-2 text-sm text-zinc-400">Upload CSV or Excel with firstName, lastName, email, and position.</p>
      </div>
      <div className="rounded-[1.5rem] border border-cyan-300/15 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-50">
        Temporary password is read from NEXT_PUBLIC_TEMP_USER_DEFAULT_PASSWORD.
      </div>
      <label className="mt-4 flex cursor-pointer items-center justify-center rounded-[1.5rem] bg-white px-6 py-4 text-center transition hover:bg-zinc-100">
        <span className="text-sm font-semibold text-black">Select CSV or Excel file</span>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            await handleFile(file);
          }}
        />
      </label>
      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm text-zinc-300">{status || "No file selected yet."}</div>
      {rows.length ? (
        <div className="mt-4">
          <div className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-cyan-100/70">Preview</div>
          <div className="space-y-2">
            {rows.slice(0, 5).map((row) => (
              <div key={row.email} className="rounded-[1.25rem] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
                {row.firstName} {row.lastName} · {row.email} · {row.position}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={uploadUsers}
            disabled={loading}
            className="button-primary mt-4 rounded-full px-5 py-3 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Importing..." : `Import ${rows.length} users`}
          </button>
        </div>
      ) : null}
    </section>
  );
}
