"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UsernameEditor({ address }: { address: string }) {
  const [loading, setLoading] = useState(true);
  const [ens, setEns] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${address}`);
        const data = await res.json();
        setEns(data.ens || null);
        setUsername(data.username || data.ens || address);
      } catch {}
      setLoading(false);
    };
    void load();
  }, [address]);

  const onSave = async () => {
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/users/${address}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Address": address },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.error || "Failed to save");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={loading ? "Loading..." : ens || "Username"}
      />
      <Button onClick={onSave} disabled={loading}>
        Save
      </Button>
      {saved && <span className="text-xs text-muted-foreground">Saved</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}


