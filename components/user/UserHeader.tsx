"use client";

import { useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

export function UserHeader({ address }: { address: string }) {
  const { wallets } = useWallets();
  const connected = wallets[0]?.address?.toLowerCase();
  const isOwner = connected && connected === address.toLowerCase();

  const [loading, setLoading] = useState(true);
  const [ens, setEns] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(address);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${address}`);
        const data = await res.json();
        const name = data?.username || data?.ens || address;
        setUsername(name);
        setEns(data?.ens || null);
      } catch {}
      setLoading(false);
    };
    void load();
  }, [address]);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${address}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Address": address },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.error || "Failed to save");
      } else {
        setOpen(false);
      }
    } catch {
      setError("Failed to save");
    }
    setSaving(false);
  };

  return (
    <div className="flex items-center gap-2">
      <h2 className="text-xl font-semibold truncate">{loading ? "..." : username}</h2>
      {isOwner && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Edit username">
              <Pencil className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit username</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={ens || "username"} />
              {error && <div className="text-xs text-red-600">{error}</div>}
            </div>
            <DialogFooter>
              <Button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}


