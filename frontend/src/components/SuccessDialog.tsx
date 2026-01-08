// src/components/SuccessDialog.tsx
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  regNumber?: string; // ใช้ regNumber จาก backend แทน localStorage
}

export function SuccessDialog({ open, onClose, regNumber }: SuccessDialogProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      // Start animation
      setIsAnimating(false);
      setTimeout(() => {
        setIsAnimating(true);
      }, 100);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3 animate-in zoom-in duration-300">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Registration Successful!</DialogTitle>
          <DialogDescription className="text-center">
            Your check-in registration has been completed
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 text-center my-4">
          <p className="text-sm text-gray-600 mb-3">Your Registration Number</p>
          <div 
            className={`transition-all duration-700 ${
              isAnimating 
                ? 'scale-100 opacity-100' 
                : 'scale-50 opacity-0'
            }`}
          >
            <p className="text-6xl font-bold text-blue-600 animate-in zoom-in duration-500 delay-150">
              #{regNumber || "---"}
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 mb-4">
          Please remember your registration number
        </div>

        <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}