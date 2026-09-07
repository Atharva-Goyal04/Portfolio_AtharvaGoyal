"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { unlockGallery } from "@/app/gallery/actions";
import { Button } from "@/components/ui/button";

export default function PasswordGate({ slug }: { slug: string }) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(unlockGallery, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form
        action={action}
        className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="font-display text-3xl font-medium">Private Gallery</h2>
        <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted">
          Enter the password to view these photos
        </p>

        <input type="hidden" name="slug" value={slug} />
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Password"
          aria-label="Gallery password"
          className="mt-8 w-full rounded-xl border border-line bg-canvas px-4 py-3 font-body outline-none transition-colors focus:border-brand"
        />

        {state.error && (
          <p role="alert" className="mt-3 font-mono text-xs uppercase tracking-wider text-red-500">
            {state.error}
          </p>
        )}

        <Button type="submit" className="mt-6 w-full" disabled={isPending}>
          {isPending ? "Checking…" : "Unlock Gallery"}
        </Button>
      </form>
    </div>
  );
}