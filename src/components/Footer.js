export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #E5E7EB",
        padding: "20px",
        textAlign: "center",
        fontSize: "13px",
        color: "#6B7280",
      }}
    >
      <span>© {new Date().getFullYear()} TripSheetHQ. All rights reserved.</span>
      <span style={{ margin: "0 10px" }}>·</span>
      <a href="/privacy" style={{ color: "#6B7280", textDecoration: "underline" }}>
        Privacy Policy
      </a>
      <span style={{ margin: "0 10px" }}>·</span>
      <a href="/terms" style={{ color: "#6B7280", textDecoration: "underline" }}>
        Terms of Service
      </a>
    </footer>
  );
}
