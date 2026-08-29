import DriverSafetyModal from "@/components/DriverSafetyModal";
import NotificationHelp from "@/components/NotificationHelp";

export default function DashboardLayout({ children }) {
  return (
    <>
      <DriverSafetyModal />
      <NotificationHelp />
      {children}
    </>
  );
}