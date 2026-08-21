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
      <div style={{ marginBottom: "8px" }}>
        <span>© {new Date().getFullYear()} TripSheetHQ. All rights reserved.</span>
        <span style={{ margin: "0 10px" }}>·</span>
        <a href="/privacy" style={{ color: "#6B7280", textDecoration: "underline" }}>
          Privacy Policy
        </a>
        <span style={{ margin: "0 10px" }}>·</span>
        <a href="/terms" style={{ color: "#6B7280", textDecoration: "underline" }}>
          Terms of Service
        </a>
      </div>

      <div>
        <a href="mailto:tripsheethq@gmail.com" style={{ color: "#6B7280", textDecoration: "underline" }}>
          tripsheethq@gmail.com
        </a>
        <span style={{ margin: "0 10px" }}>·</span>
        <a
          href="https://wa.me/16478521007"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#6B7280", textDecoration: "underline" }}
        >
          WhatsApp
        </a>
        {/* Facebook link goes here once the page URL is ready:
        <span style={{ margin: "0 10px" }}>·</span>
        <a href="FACEBOOK_URL_HERE" target="_blank" rel="noopener noreferrer" style={{ color: "#6B7280", textDecoration: "underline" }}>
          Facebook
        </a>
        */}
      </div>
    </footer>
  );
}
