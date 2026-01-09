import React, { useRef } from "react";
import { Printer, X, Download} from "lucide-react";
import { useReactToPrint } from "react-to-print";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Field({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  className?: string;
}) {
  if (!value) return null;
  return (
    <div className={className}>
      <div className="text-[11px] text-gray-500 print:text-xs">{label}</div>
      <div className={`mt-0.5 text-sm ${mono ? "font-mono" : ""} print:text-sm font-medium`}>
        {value}
      </div>
    </div>
  );
}

function GuestPrintSheet({ guest }: { guest: any }) {

  const handleDownloadImage = () => {
    if (!guest.image) return;

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = guest.image;
    link.download = `passport-${guest.regNumber || "image"}.jpg`;

    // Append the link to the body
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up by removing the link
    document.body.removeChild(link);
  }

  return (
    <div className="w-full font-sans text-black">
      <div className="flex items-start justify-between border-b border-gray-300 pb-4 mb-6">
        <div>
          <div className="text-xl font-bold print:text-3xl">Chorcher Hotel</div>
          <div className="text-xs text-gray-500 print:text-sm mt-1">
            Guest Registration Information
          </div>
        </div>

        <div className="text-right text-xs text-gray-600 space-y-1 print:text-sm">
          <div>
            <span className="text-gray-500">Reg No.</span>{" "}
            <span className="font-mono font-bold text-black text-base">
              #{guest.regNumber}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Date</span>{" "}
            <span>{new Date(guest.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 print:gap-8">
        <div className="col-span-12">
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white print:border-gray-300 relative">
            {guest.image ? (
              <img
                src={guest.image}
                alt="Guest"
                className="w-full h-auto object-contain print:max-h-[8cm] bg-gray-50"
              />
            ) : (
              <div className="p-6 text-center text-sm text-gray-500 bg-gray-50 h-32 flex items-center justify-center">
                No image provided
              </div>
            )}
            <div className="flex items-center justify-end z-10 p-2 print:hidden absolute top-0 right-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadImage}
                className="flex items-center gap-2 "
                title="Download guest image"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="col-span-12">
          <div className="text-sm font-bold mb-3 bg-gray-100 p-2 rounded print:bg-gray-100 print:text-base print:mb-4 border border-gray-200">
            Primary Guest Information
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-2 gap-x-8 gap-y-4 print:gap-y-6">
            <Field label="First Name" value={guest.firstName} />
            <Field label="Last Name" value={guest.lastName} />
            <Field className="col-span-2" label="Middle Name" value={guest.middleName} />
            <Field label="Gender" value={guest.gender} />
            <Field label="Nationality" value={guest.nationality} />
            <Field label="Passport No." value={guest.passportNo} mono />
            <Field label="Flight Number" value={guest.flightNumber} mono />
            <Field label="Birth Date" value={guest.birthDate} />
            <Field label="Check Out Date" value={guest.checkOutDate} />
            <Field label="Phone No." value={guest.phoneNo} />
          </div>

          {(guest.guest2FirstName || guest.guest2LastName) && (
            <>
              <div className="mt-8 text-sm font-bold mb-3 bg-gray-100 p-2 rounded print:bg-gray-100 print:text-base print:mb-4 border border-gray-200">
                Guest No.2
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <Field label="First Name" value={guest.guest2FirstName || "-"} />
                <Field label="Last Name" value={guest.guest2LastName || "-"} />
              </div>
            </>
          )}

          <div className="mt-12 border-t border-gray-300 pt-4 text-xs text-gray-400 flex justify-between">
            <span>Generated by Hotel Management System</span>
            <span>Printed at {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PreviewModal({ guest, isOpen, onClose }: any) {
  if (!guest) return null;

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `guest-${guest.regNumber ?? ""}`,
  });



  return (
    <>
      {/* Global print styles */}
      <style>
        {`
          @media print {
            body > *:not(#print-container) {
              display: none !important;
            }
            #print-container {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
            }
            @page { 
              size: A4; 
              margin: 15mm; 
            }
            html, body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          @media screen {
            #print-container {
              position: absolute;
              left: -9999px;
              top: -9999px;
            }
          }
        `}
      </style>

      {/* Print container */}
      <div
        id="print-container"
        ref={printRef}
        className="bg-white"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <div className="p-8">
          <GuestPrintSheet guest={guest} />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[90vh] sm:max-w-4xl w-full overflow-hidden flex flex-col p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Guest Information Preview</DialogTitle>
            <DialogDescription>
              Preview guest registration information. Use Print to print the page, or close the dialog.
            </DialogDescription>
          </DialogHeader>

          <div className="shrink-0 h-14 border-b bg-white flex items-center justify-between px-4 z-10">
            <div className="font-medium">Guest Information Preview</div>
            <div className="flex items-center gap-2">
              {/* <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <span>Downloading...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </>
                )}

              </Button> */}
              <Button size="sm" onClick={() => handlePrint()}>
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 bg-slate-100 p-4 md:p-8">
            <div className="mx-auto bg-white shadow-lg rounded-none md:rounded-xl p-8 md:p-12 max-w-[210mm] min-h-[297mm]">
              <GuestPrintSheet guest={guest} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}