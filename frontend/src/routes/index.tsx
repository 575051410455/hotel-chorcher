import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router'

import { RegistrationForm } from '@/components/RegistrationForm'



export const Route = createFileRoute('/')({
  component: App,
})

type Page = "registration" | "admin" | "immigration";

function App() {

 const [currentPage, setCurrentPage] = useState<Page>("registration");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegistrationSuccess = (regNumber: string) => {
    setSuccessMessage(`Registration successful! Your registration number is #${regNumber}`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };



  return (
    <div className="relative">
      {/* Pages */}
        <RegistrationForm 
          onSuccess={handleRegistrationSuccess}
        />
    </div>
  )
}
