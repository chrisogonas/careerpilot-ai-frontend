"use client";

import { useEffect, useState, useRef } from "react";
import { apiClient } from "@/lib/utils/api";
import { ConnectedEmailProvider, EmailOAuthProvider } from "@/lib/types";

interface EmailOAuthConnectProps {
  onProvidersChange?: (providers: ConnectedEmailProvider[]) => void;
}

export default function EmailOAuthConnect({ onProvidersChange }: EmailOAuthConnectProps) {
  const [providers, setProviders] = useState<ConnectedEmailProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<EmailOAuthProvider | null>(null);
  const [disconnecting, setDisconnecting] = useState<EmailOAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getConnectedEmailProviders();
      setProviders(data.connected_providers);
      onProvidersChange?.(data.connected_providers);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load connected providers";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: EmailOAuthProvider) => {
    try {
      setConnecting(provider);
      setError(null);
      const data = await apiClient.authorizeEmailOAuth(provider);
      // Open OAuth authorization URL in a new tab
      window.open(data.authorization_url, "_blank", "noopener,noreferrer");
      setConnecting(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to connect ${provider}`;
      setError(msg);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (provider: EmailOAuthProvider) => {
    if (!confirm(`Disconnect ${provider === "gmail" ? "Gmail" : "Outlook"}? You won't be able to send emails from this account.`)) {
      return;
    }

    try {
      setDisconnecting(provider);
      setError(null);
      await apiClient.disconnectEmailProvider(provider);
      const updated = providers.filter(p => p.provider !== provider);
      setProviders(updated);
      onProvidersChange?.(updated);
      setSuccess(`${provider === "gmail" ? "Gmail" : "Outlook"} disconnected successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Failed to disconnect ${provider}`;
      setError(msg);
    } finally {
      setDisconnecting(null);
    }
  };

  const isConnected = (provider: EmailOAuthProvider) =>
    providers.some(p => p.provider === provider);

  const getProviderInfo = (provider: EmailOAuthProvider) =>
    providers.find(p => p.provider === provider);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Accounts</h3>
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          Loading connected accounts...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Accounts</h3>
      <p className="text-sm text-gray-500 mb-6">
        Connect your email to send job applications directly from CareerPilot.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {/* Gmail */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-xl">
              📧
            </div>
            <div>
              <p className="font-medium text-gray-900">Gmail</p>
              {isConnected("gmail") ? (
                <p className="text-sm text-green-600">
                  Connected as {getProviderInfo("gmail")?.email}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Send emails via Google</p>
              )}
            </div>
          </div>
          {isConnected("gmail") ? (
            <button
              onClick={() => handleDisconnect("gmail")}
              disabled={disconnecting === "gmail"}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition"
            >
              {disconnecting === "gmail" ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : (
            <button
              onClick={() => handleConnect("gmail")}
              disabled={connecting === "gmail"}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition"
            >
              {connecting === "gmail" ? "Connecting..." : "Connect Gmail"}
            </button>
          )}
        </div>

        {/* Outlook */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl">
              📨
            </div>
            <div>
              <p className="font-medium text-gray-900">Outlook</p>
              {isConnected("outlook") ? (
                <p className="text-sm text-green-600">
                  Connected as {getProviderInfo("outlook")?.email}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Send emails via Microsoft</p>
              )}
            </div>
          </div>
          {isConnected("outlook") ? (
            <button
              onClick={() => handleDisconnect("outlook")}
              disabled={disconnecting === "outlook"}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition"
            >
              {disconnecting === "outlook" ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : (
            <button
              onClick={() => handleConnect("outlook")}
              disabled={connecting === "outlook"}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition"
            >
              {connecting === "outlook" ? "Connecting..." : "Connect Outlook"}
            </button>
          )}
        </div>
      </div>

      {providers.length > 0 && (
        <p className="mt-4 text-xs text-gray-400">
          Connected accounts are used to send job application emails on your behalf.
        </p>
      )}
    </div>
  );
}
