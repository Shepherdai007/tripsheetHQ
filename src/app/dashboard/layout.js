import DriverSafetyModal from "@/components/DriverSafetyModal";

export default function DashboardLayout({ children }) {
  return (
    <>
      <DriverSafetyModal />
      {children}
    </>
  );
}
