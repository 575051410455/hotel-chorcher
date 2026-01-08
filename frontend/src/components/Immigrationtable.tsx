import { ArrowLeft, FileDown, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useGuests } from "@/lib/api";
import * as XLSX from "xlsx";

interface ImmigrationTableProps {
  onBack: () => void;
}

export function ImmigrationTable({ onBack }: ImmigrationTableProps) {
  const { data: guestsData, isLoading } = useGuests({ limit: 1000 });
  const guests = guestsData?.data || [];

  const handleExportExcel = () => {
    if (guests.length === 0) {
      alert("No data to export");
      return;
    }

    const exportData: Record<string, string>[] = [];

    guests.forEach((guest) => {
      exportData.push({
        "Reg No.": guest.regNumber,
        "First Name": guest.firstName,
        "Middle Name": guest.middleName || "-",
        "Last Name": guest.lastName,
        "Gender": guest.gender || "-",
        "Passport No.": guest.passportNo || "-",
        "Nationality": guest.nationality || "-",
        "Birth Date": guest.birthDate || "-",
        "Check-out Date": guest.checkOutDate || "-",
        "Phone No.": guest.phoneNo || "-",
        "Registration Date": new Date(guest.createdAt).toLocaleString(),
      });

      if (guest.guest2FirstName || guest.guest2LastName) {
        exportData.push({
          "Reg No.": guest.regNumber + " (Guest 2)",
          "First Name": guest.guest2FirstName || "-",
          "Middle Name": guest.guest2MiddleName || "-",
          "Last Name": guest.guest2LastName || "-",
          "Gender": guest.guest2Gender || "-",
          "Passport No.": guest.guest2PassportNo || "-",
          "Nationality": guest.guest2Nationality || "-",
          "Birth Date": guest.guest2BirthDate || "-",
          "Check-out Date": guest.guest2CheckOutDate || "-",
          "Phone No.": guest.guest2PhoneNo || "-",
          "Registration Date": new Date(guest.createdAt).toLocaleString(),
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Immigration Data");

    const maxWidth = 20;
    const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.min(maxWidth, Math.max(key.length, ...exportData.map((row) => String(row[key] || "").length))),
    }));
    worksheet["!cols"] = columnWidths;

    XLSX.writeFile(workbook, `Immigration_Data_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <CardTitle className="text-2xl">Immigration Data Table</CardTitle>
                  <p className="text-sm text-purple-100 mt-1">ข้อมูลสำหรับตำรวจตรวจคนเข้าเมือง</p>
                </div>
              </div>
              <Button onClick={handleExportExcel} className="bg-white text-purple-600 hover:bg-purple-50" disabled={guests.length === 0}>
                <FileDown className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {guests.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                  <FileDown className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
                <p className="text-gray-500">ยังไม่มีข้อมูลแขกที่ลงทะเบียน</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-sm text-gray-600 mb-4">Total Guests: {guests.length} registration(s)</div>

                {guests.map((guest) => (
                  <div key={guest.id} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50/50">
                    <div className="mb-3 pb-2 border-b border-purple-300">
                      <span className="font-mono text-sm bg-purple-600 text-white px-3 py-1 rounded-full">Reg No. {guest.regNumber}</span>
                      <span className="ml-3 text-xs text-gray-600">Registered: {new Date(guest.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                        <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Guest 1</span>
                        Primary Guest
                      </h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-purple-100">
                              <TableHead>First Name</TableHead>
                              <TableHead>Middle Name</TableHead>
                              <TableHead>Last Name</TableHead>
                              <TableHead>Gender</TableHead>
                              <TableHead>Passport No.</TableHead>
                              <TableHead>Nationality</TableHead>
                              <TableHead>Birth Date</TableHead>
                              <TableHead>Check-out Date</TableHead>
                              <TableHead>Phone No.</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow className="bg-white">
                              <TableCell className="font-medium">{guest.firstName}</TableCell>
                              <TableCell>{guest.middleName || <span className="text-gray-400 italic">-</span>}</TableCell>
                              <TableCell className="font-medium">{guest.lastName}</TableCell>
                              <TableCell>{guest.gender || <span className="text-gray-400 italic">-</span>}</TableCell>
                              <TableCell>{guest.passportNo ? <span className="font-mono bg-blue-50 px-2 py-1 rounded text-sm">{guest.passportNo}</span> : <span className="text-gray-400 italic">-</span>}</TableCell>
                              <TableCell>{guest.nationality || <span className="text-gray-400 italic">-</span>}</TableCell>
                              <TableCell>{guest.birthDate || <span className="text-gray-400 italic">-</span>}</TableCell>
                              <TableCell>{guest.checkOutDate || <span className="text-gray-400 italic">-</span>}</TableCell>
                              <TableCell>{guest.phoneNo || <span className="text-gray-400 italic">-</span>}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {(guest.guest2FirstName || guest.guest2LastName) && (
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                          <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded">Guest 2</span>
                          Second Guest
                        </h4>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-pink-100">
                                <TableHead>First Name</TableHead>
                                <TableHead>Middle Name</TableHead>
                                <TableHead>Last Name</TableHead>
                                <TableHead>Gender</TableHead>
                                <TableHead>Passport No.</TableHead>
                                <TableHead>Nationality</TableHead>
                                <TableHead>Birth Date</TableHead>
                                <TableHead>Check-out Date</TableHead>
                                <TableHead>Phone No.</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow className="bg-white">
                                <TableCell className="font-medium">{guest.guest2FirstName || <span className="text-gray-400 italic">-</span>}</TableCell>
                                <TableCell>{guest.guest2MiddleName || <span className="text-gray-400 italic">-</span>}</TableCell>
                                <TableCell className="font-medium">{guest.guest2LastName || <span className="text-gray-400 italic">-</span>}</TableCell>
                                <TableCell>{guest.guest2Gender || <span className="text-gray-400 italic">-</span>}</TableCell>
                                <TableCell>{guest.guest2PassportNo ? <span className="font-mono bg-blue-50 px-2 py-1 rounded text-sm">{guest.guest2PassportNo}</span> : <span className="text-gray-400 italic">-</span>}</TableCell>
                                <TableCell>{guest.guest2Nationality || <span className="text-gray-400 italic">-</span>}</TableCell>
                                <TableCell>{guest.guest2BirthDate || <span className="text-gray-400 italic">-</span>}</TableCell>
                                <TableCell>{guest.guest2CheckOutDate || <span className="text-gray-400 italic">-</span>}</TableCell>
                                <TableCell>{guest.guest2PhoneNo || <span className="text-gray-400 italic">-</span>}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}