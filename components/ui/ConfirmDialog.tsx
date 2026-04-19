"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { useState } from "react";
import { Input } from "./Input";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  requireTyping?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  requireTyping,
  danger = false,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [typed, setTyped] = useState("");

  const canConfirm = requireTyping ? typed === requireTyping : true;

  async function handle() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
      setTyped("");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        {requireTyping && (
          <Input
            label={`Type "${requireTyping}" to confirm`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requireTyping}
          />
        )}
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            fullWidth
            onClick={handle}
            loading={loading}
            disabled={!canConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
