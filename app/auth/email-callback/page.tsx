"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function EmailCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [provider, setProvider] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const prov = searchParams.get("provider") || "";
    const em = searchParams.get("email") || "";

    if (success === "true") {
      setStatus("success");
      setProvider(prov);
      setEmail(em);
    } else {
      setStatus("error");
      setErrorMsg(error || "Something went wrong during email connection.");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Processing email connection...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Connected!</h2>
            <p className="text-gray-600 mb-1">
              <strong>{provider === "gmail" ? "Gmail" : "Outlook"}</strong> has been connected successfully.
            </p>
            {email && <p className="text-sm text-gray-500 mb-6">{email}</p>}
            <Link
              href="/profile"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Back to Profile
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600 mb-6">{errorMsg}</p>
            <Link
              href="/profile"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Back to Profile
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function EmailCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      }
    >
      <EmailCallbackContent />
    </Suspense>
  );
}
