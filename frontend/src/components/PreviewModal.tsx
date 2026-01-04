import { Printer } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import type { Guest } from "@backend/types";

interface PreviewModalProps {
  guest: Guest | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ guest, isOpen, onClose }: PreviewModalProps) {
  if (!guest) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] sm:max-w-2xl print:shadow-none overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center justify-between">
            <span>Guest Information Preview</span>
            <Button variant="outline" size="sm" onClick={handlePrint} className="ml-auto mr-2">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="print-content space-y-6 py-4">
          <div className="hidden print:block text-center border-b-2 pb-4 mb-6">
            <h1 className="text-2xl font-bold">Grand Hotel</h1>
            <p className="text-sm text-gray-600">Guest Registration Information</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-sm text-gray-600">Registration Number</p>
            <p className="text-2xl font-mono font-bold text-blue-600">#{guest.regNumber}</p>
          </div>

          {guest.image && (
            <div className="flex justify-center">
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <img src={guest.image} alt="Guest ID" className="max-w-full h-auto max-h-64 object-cover" />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-lg border-b pb-2">Primary Guest</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">First Name</p>
                <p className="font-medium">{guest.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Name</p>
                <p className="font-medium">{guest.lastName}</p>
              </div>
              {guest.middleName && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Middle Name</p>
                  <p className="font-medium">{guest.middleName}</p>
                </div>
              )}
              {guest.gender && (
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{guest.gender}</p>
                </div>
              )}
              {guest.passportNo && (
                <div>
                  <p className="text-sm text-gray-500">Passport No.</p>
                  <p className="font-medium font-mono">{guest.passportNo}</p>
                </div>
              )}
              {guest.flightNumber && (
                <div>
                  <p className="text-sm text-gray-500">Flight Number</p>
                  <p className="font-medium font-mono">{guest.flightNumber}</p>
                </div>
              )}
              {guest.nationality && (
                <div>
                  <p className="text-sm text-gray-500">Nationality</p>
                  <p className="font-medium">{guest.nationality}</p>
                </div>
              )}
              {guest.birthDate && (
                <div>
                  <p className="text-sm text-gray-500">Birth Date</p>
                  <p className="font-medium">{guest.birthDate}</p>
                </div>
              )}
              {guest.checkOutDate && (
                <div>
                  <p className="text-sm text-gray-500">Check Out Date</p>
                  <p className="font-medium">{guest.checkOutDate}</p>
                </div>
              )}
              {guest.phoneNo && (
                <div>
                  <p className="text-sm text-gray-500">Phone No.</p>
                  <p className="font-medium">{guest.phoneNo}</p>
                </div>
              )}
            </div>
          </div>

          {(guest.guest2FirstName || guest.guest2LastName) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">Guest No.2</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">First Name</p>
                  <p className="font-medium">{guest.guest2FirstName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Name</p>
                  <p className="font-medium">{guest.guest2LastName || "-"}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 border-t pt-4">
            <div>
              <p className="text-sm text-gray-500">Registration Date & Time</p>
              <p className="font-medium">{new Date(guest.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="hidden print:block text-center text-sm text-gray-500 border-t pt-4 mt-8">
            <p>Thank you for choosing Grand Hotel</p>
            <p>© {new Date().getFullYear()} Grand Hotel. All rights reserved.</p>
          </div>
        </div>

        <div className="print:hidden flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </Dialog>
  );
}