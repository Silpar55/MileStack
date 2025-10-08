"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  itemName: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    if (confirmationText !== title) {
      setError(
        `Please enter the exact ${itemName.toLowerCase()} title: "${title}"`
      );
      return;
    }

    setError("");
    await onConfirm();
  };

  const handleClose = () => {
    setConfirmationText("");
    setError("");
    onClose();
  };

  const isConfirmationValid = confirmationText === title;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Delete {itemName}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the{" "}
            {itemName.toLowerCase()} and all associated data including analysis
            results and learning milestones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This will permanently delete:
              <ul className="mt-2 ml-4 list-disc">
                <li>The {itemName.toLowerCase()}</li>
                <li>All analysis results</li>
                <li>All learning milestones</li>
                <li>All associated progress data</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              To confirm, type the {itemName.toLowerCase()} title:
            </Label>
            <div className="text-sm text-muted-foreground mb-2">
              <strong>"{title}"</strong>
            </div>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => {
                setConfirmationText(e.target.value);
                setError("");
              }}
              placeholder={`Enter "${title}" to confirm`}
              className={error ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmationValid || isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Assignment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
