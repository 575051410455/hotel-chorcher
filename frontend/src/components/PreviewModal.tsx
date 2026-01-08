// src/components/PreviewModal.tsx
import React, { useState } from "react";
import { Printer, X, Download, Loader2 } from "lucide-react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  PDFViewer,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";

// Register Thai font (ต้อง download font ไว้ใน public/fonts/)
Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/fonts/Sarabun-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Sarabun-Bold.ttf", fontWeight: "bold" },
  ],
});

// Fallback to default font if Thai font not available
Font.register({
  family: "Roboto",
  fonts: [
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf", fontWeight: "normal" },
    { src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf", fontWeight: "bold" },
  ],
});

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 10,
    backgroundColor: "#ffffff",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 15,
    marginBottom: 20,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  hotelSubtitle: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  regLabel: {
    fontSize: 9,
    color: "#6b7280",
  },
  regNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 2,
  },
  dateText: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
  },
  // Image section
  imageContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  guestImage: {
    width: "100%",
    maxHeight: 250,
    objectFit: "contain",
    backgroundColor: "#f9fafb",
  },
  noImage: {
    height: 100,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 10,
    color: "#9ca3af",
  },
  // Section
  sectionHeader: {
    backgroundColor: "#f3f4f6",
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
  },
  // Fields grid
  fieldsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  fieldItem: {
    width: "50%",
    marginBottom: 12,
    paddingRight: 10,
  },
  fieldItemFull: {
    width: "100%",
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 11,
    color: "#1f2937",
    fontWeight: "bold",
  },
  fieldValueMono: {
    fontSize: 11,
    color: "#1f2937",
    fontWeight: "bold",
    fontFamily: "Courier",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

// Field Component for PDF
function PDFField({
  label,
  value,
  mono = false,
  fullWidth = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  fullWidth?: boolean;
}) {
  if (!value) return null;
  return (
    <View style={fullWidth ? styles.fieldItemFull : styles.fieldItem}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={mono ? styles.fieldValueMono : styles.fieldValue}>{value}</Text>
    </View>
  );
}

// PDF Document Component
function GuestPDFDocument({ guest }: { guest: any }) {
  const printDate = new Date().toLocaleString();
  const regDate = guest.createdAt
    ? new Date(guest.createdAt).toLocaleDateString()
    : "-";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.hotelName}>Chorcher Hotel</Text>
            <Text style={styles.hotelSubtitle}>Guest Registration Information</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.regLabel}>Reg No.</Text>
            <Text style={styles.regNumber}>#{guest.regNumber || "-"}</Text>
            <Text style={styles.dateText}>Date: {regDate}</Text>
          </View>
        </View>

        {/* Guest Image */}
        <View style={styles.imageContainer}>
          {guest.image ? (
            <Image src={guest.image} style={styles.guestImage} />
          ) : (
            <View style={styles.noImage}>
              <Text style={styles.noImageText}>No image provided</Text>
            </View>
          )}
        </View>

        {/* Primary Guest Information */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Primary Guest Information</Text>
        </View>

        <View style={styles.fieldsGrid}>
          <PDFField label="First Name" value={guest.firstName} />
          <PDFField label="Last Name" value={guest.lastName} />
          <PDFField label="Middle Name" value={guest.middleName} fullWidth />
          <PDFField label="Gender" value={guest.gender} />
          <PDFField label="Nationality" value={guest.nationality} />
          <PDFField label="Passport No." value={guest.passportNo} mono />
          <PDFField label="Flight Number" value={guest.flightNumber} mono />
          <PDFField label="Birth Date" value={guest.birthDate} />
          <PDFField label="Check Out Date" value={guest.checkOutDate} />
          <PDFField label="Phone No." value={guest.phoneNo} />
        </View>

        {/* Guest No.2 */}
        {(guest.guest2FirstName || guest.guest2LastName) && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Guest No.2</Text>
            </View>
            <View style={styles.fieldsGrid}>
              <PDFField label="First Name" value={guest.guest2FirstName || "-"} />
              <PDFField label="Last Name" value={guest.guest2LastName || "-"} />
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by Hotel Management System</Text>
          <Text style={styles.footerText}>Printed at {printDate}</Text>
        </View>
      </Page>
    </Document>
  );
}

// Main Preview Modal Component
export function PreviewModal({
  guest,
  isOpen,
  onClose,
}: {
  guest: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!guest) return null;

  // Download PDF
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await pdf(<GuestPDFDocument guest={guest} />).toBlob();
      saveAs(blob, `Guest-${guest.regNumber || "unknown"}.pdf`);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  // Print PDF (open in new window)
  const handlePrint = async () => {
    try {
      const blob = await pdf(<GuestPDFDocument guest={guest} />).toBlob();
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error) {
      console.error("Print failed:", error);
      alert("Failed to print PDF");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[95vh] h-[90vh] sm:max-w-5xl w-full overflow-hidden flex flex-col p-0 gap-0 ">
        {/* Toolbar */}
        <div className="shrink-0 h-14 border-b bg-white flex items-center justify-between px-4 z-10">
          <div className="font-medium">
            Guest Information - #{guest.regNumber || "-"}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-gray-600 overflow-hidden">
          <PDFViewer
            width="100%"
            height="100%"
            showToolbar={false}
            style={{ border: "none" }}
          >
            <GuestPDFDocument guest={guest} />
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  );
}