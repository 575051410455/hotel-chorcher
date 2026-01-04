import { useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { CreateGuestInput } from "@backend/types";
import { useCreateGuest, useUploadImage } from "@/lib/api";
import { SuccessDialog } from "@/components/SuccessDialog";

interface RegistrationFormProps {
  onSuccess?: (regNumber: string) => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState<Partial<CreateGuestInput>>({
    firstName: "",
    lastName: "",
    flightNumber: "",
    guest2FirstName: "",
    guest2LastName: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const createGuest = useCreateGuest();
  const uploadImage = useUploadImage();

  // Success dialog state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successRegNumber, setSuccessRegNumber] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type - Support HEIC/HEIF from iPhone
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"];

      // Check both MIME type and file extension
      const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension || "");

      if (!isValidType) {
        alert("Please upload an image file (JPEG, PNG, GIF, WEBP, HEIC) only");
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File too large. Maximum size is 10MB");
        return;
      }

      // Store file for upload
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName) {
      alert("Please enter first name and last name for the primary guest");
      return;
    }

    console.log("show api:", formData);

    try {
      let imageUrl: string | null = null;

      // Step 1: Upload image first if exists
      if (imageFile) {
        console.log("Uploading image...");
        try {
          const uploadResult = await uploadImage.mutateAsync(imageFile);
          imageUrl = uploadResult.url;
          console.log("Image uploaded successfully:", imageUrl);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          alert("Failed to upload image. Please try again");
          return;
        }
      }

      // Step 2: Create guest with image URL
      console.log("Creating guest with image URL:", imageUrl);
      const result = await createGuest.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        flightNumber: formData.flightNumber || null,
        guest2FirstName: formData.guest2FirstName || null,
        guest2LastName: formData.guest2LastName || null,
        image: imageUrl || null,
      });

      console.log("Guest created:", result);

      // Show Success Dialog with regNumber
      setSuccessRegNumber(result.regNumber);
      setShowSuccess(true);

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        flightNumber: "",
        guest2FirstName: "",
        guest2LastName: "",
        image: null,
      });
      setImagePreview(null);
      setImageFile(null);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result.regNumber);
      }
    } catch (error) {
      alert("An error occurred during registration");
      console.error(error);
    }
  };

  const isSubmitting = createGuest.isPending || uploadImage.isPending;

  // Handle close success dialog
  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setSuccessRegNumber("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#e9dcc7] to-[#e4d7c3]  flex flex-col items-center justify-center md:p-4">
      <Card className="w-full max-w-2xl shadow-xl sm:p-4 md:p-4 ">
        <CardHeader className="text-center bg-[url('/bg-1.webp')] bg-cover bg-center bg-no-repeat rounded-t-xl p-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-24 h-24 flex items-center justify-center">
              <img src="/chorcher.png" alt="Chorcher Logo" className="h-20 w-20" />
            </div>
          </div>
          <CardTitle className="text-3xl">Lay Over Registration</CardTitle>
          <p className="text-amber-950 mt-2">Welcome to ChorCher Hotel</p>
        </CardHeader>
        {/* Decorative Outline */}
        <div id="chorcher-outlinesd-des" className="flex items-center justify-center">
          <div className="w-[7px] h-[7px] bg-[#C08329] rotate-45"></div>
          <div className="w-full h-[2px] bg-[#C08329]"></div>
          <div className="w-[7px] h-[7px] bg-[#C08329] rotate-45"></div>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Guest Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">
                Primary Guest Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="flightNumber">Flight Number (Optional)</Label>
                <Input
                  id="flightNumber"
                  name="flightNumber"
                  value={formData.flightNumber || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., TG123, BA456"
                  className="uppercase"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>ID Card / Passport (Optional)</Label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      id="imageUpload"
                      className="hidden"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif,.heic,.heif"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Camera className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="text-blue-600 font-medium">Click to upload or take photo</span>
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP, HEIC up to 10MB</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={imagePreview}
                      alt="ID Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {imageFile && (
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Guest No.2 Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-700 border-b pb-2">
                Guest No.2 Information (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest2FirstName">First Name</Label>
                  <Input
                    id="guest2FirstName"
                    name="guest2FirstName"
                    value={formData.guest2FirstName || ""}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guest2LastName">Last Name</Label>
                  <Input
                    id="guest2LastName"
                    name="guest2LastName"
                    value={formData.guest2LastName || ""}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col space-y-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-[#C08329] to-[#C08329] hover:from-[#dca758] hover:to-[#dca758]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadImage.isPending ? "Uploading image..." : "Registering..."}
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ✅ Success Dialog */}
      <SuccessDialog
        open={showSuccess}
        onClose={handleCloseSuccess}
        regNumber={successRegNumber}
      />
      <Card className="w-full max-w-2xl shadow-xl sm:p-4 md:p-4 mt-6">
        <CardHeader className="text-center text-black rounded-t-xl p-4">
          <CardTitle className="text-2xl">How to Register</CardTitle>
        </CardHeader>
        {/* Decorative Outline */}
        <div id="chorcher-outlinesd-des" className="flex items-center justify-center">
          <div className="w-[7px] h-[7px] bg-[#C08329] rotate-45"></div>
          <div className="w-full h-[2px] bg-[#C08329]"></div>
          <div className="w-[7px] h-[7px] bg-[#C08329] rotate-45"></div>
        </div>
      </Card>
      <footer>
        <div className="text-center text-sm text-gray-500 mt-4">
          &copy; {new Date().getFullYear()} Chorcher Hotel. Lay Over-All rights reserved.
        </div>
      </footer>
    </div>
  );
}