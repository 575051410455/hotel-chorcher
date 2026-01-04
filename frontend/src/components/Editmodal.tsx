import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import type { Guest, UpdateGuestInput } from "@backend/types";

interface EditModalProps {
  guest: Guest;
  onClose: () => void;
  onSave: (data: UpdateGuestInput) => void;
  isSaving?: boolean;
  userRole?: string;
}

export function EditModal({ guest, onClose, onSave, isSaving, userRole }: EditModalProps) {
  const [firstName, setFirstName] = useState(guest.firstName);
  const [middleName, setMiddleName] = useState(guest.middleName || "");
  const [lastName, setLastName] = useState(guest.lastName);
  const [gender, setGender] = useState(guest.gender || "");
  const [passportNo, setPassportNo] = useState(guest.passportNo || "");
  const [nationality, setNationality] = useState(guest.nationality || "");
  const [birthDate, setBirthDate] = useState(guest.birthDate || "");
  const [checkOutDate, setCheckOutDate] = useState(guest.checkOutDate || "");
  const [phoneNo, setPhoneNo] = useState(guest.phoneNo || "");
  const [flightNumber, setFlightNumber] = useState(guest.flightNumber || "");
  const [guest2FirstName, setGuest2FirstName] = useState(guest.guest2FirstName || "");
  const [guest2MiddleName, setGuest2MiddleName] = useState(guest.guest2MiddleName || "");
  const [guest2LastName, setGuest2LastName] = useState(guest.guest2LastName || "");
  const [checkedIn, setCheckedIn] = useState(guest.checkedIn || false);

  const handleSave = () => {
    // ตรวจสอบว่าผู้ใช้มี permission เป็น admin หรือไม่
    if (userRole !== "admin") {
      alert("คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลแขก\nเฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถแก้ไขข้อมูลได้");
      return;
    }

    if (!firstName || !lastName) {
      alert("กรุณากรอกชื่อและนามสกุลแขกท่านแรก");
      return;
    }

    onSave({
      firstName,
      middleName: middleName || null,
      lastName,
      gender: gender || null,
      passportNo: passportNo || null,
      nationality: nationality || null,
      birthDate: birthDate || null,
      checkOutDate: checkOutDate || null,
      phoneNo: phoneNo || null,
      flightNumber: flightNumber || null,
      guest2FirstName: guest2FirstName || null,
      guest2MiddleName: guest2MiddleName || null,
      guest2LastName: guest2LastName || null,
      checkedIn,
    });
  };

  const isAdmin = userRole === "admin";

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Guest Information</DialogTitle>
          <p className="text-sm text-gray-500">Registration No: #{guest.regNumber}</p>
          {!isAdmin && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ คุณไม่มีสิทธิ์แก้ไขข้อมูล - เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Checkbox id="checkedIn" checked={checkedIn} onCheckedChange={(checked) => setCheckedIn(checked as boolean)} />
              <div className="flex-1">
                <Label htmlFor="checkedIn" className="text-base font-semibold cursor-pointer text-gray-800">Check-in Status</Label>
                <p className="text-xs text-gray-600 mt-1">{checkedIn ? "✓ Guest has checked in" : "Guest has not checked in yet"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 border-b pb-2">Primary Guest</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input id="edit-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input id="edit-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter last name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-middleName">Middle Name</Label>
              <Input id="edit-middleName" value={middleName} onChange={(e) => setMiddleName(e.target.value)} placeholder="Enter middle name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gender">Gender</Label>
              <Select value={gender ?? ""} onValueChange={(value) => setGender(value)}>
                <SelectTrigger className="w-full" id="edit-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-passportNo">Passport Number</Label>
              <Input id="edit-passportNo" value={passportNo} onChange={(e) => setPassportNo(e.target.value)} placeholder="Enter passport number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-flightNumber">Flight Number</Label>
              <Input id="edit-flightNumber" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} placeholder="e.g., TG123, BA456" className="uppercase" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nationality">Nationality</Label>
              <Input id="edit-nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Enter nationality" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-birthDate">Birth Date</Label>
              <Input id="edit-birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-checkOutDate">Check Out Date</Label>
              <Input id="edit-checkOutDate" type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phoneNo">Phone Number</Label>
              <Input id="edit-phoneNo" value={phoneNo} onChange={(e) => setPhoneNo(e.target.value)} placeholder="Enter phone number" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 border-b pb-2">Guest No.2</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-guest2FirstName">First Name</Label>
                <Input id="edit-guest2FirstName" value={guest2FirstName} onChange={(e) => setGuest2FirstName(e.target.value)} placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-guest2LastName">Last Name</Label>
                <Input id="edit-guest2LastName" value={guest2LastName} onChange={(e) => setGuest2LastName(e.target.value)} placeholder="Enter last name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-guest2MiddleName">Middle Name</Label>
              <Input id="edit-guest2MiddleName" value={guest2MiddleName} onChange={(e) => setGuest2MiddleName(e.target.value)} placeholder="Enter middle name" />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={isSaving || !isAdmin}
            title={!isAdmin ? "เฉพาะ Admin เท่านั้นที่สามารถบันทึกการเปลี่ยนแปลงได้" : ""}
          >
            {isSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}