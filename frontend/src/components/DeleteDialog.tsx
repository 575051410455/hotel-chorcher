import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  guestName: string;
  isDeleting?: boolean;
}

export function DeleteDialog({ isOpen, onClose, onConfirm, guestName, isDeleting }: DeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl">Delete Guest Record</AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-base pt-2">
            Are you sure you want to delete the registration for{" "}
            <span className="font-semibold text-gray-800">{guestName}</span>?
            <br />
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            No, Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}