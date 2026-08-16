export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "32px" }}>
        Last updated: August 16, 2026
      </p>

      <Section title="1. Overview">
        TripSheetHQ ("we," "us," "our") provides a digital trip sheet
        platform for trucking companies, drivers, dispatchers, and payroll
        staff. This Privacy Policy explains what information we collect,
        how we use it, and how it is protected when you use TripSheetHQ
        (the "Service").
      </Section>

      <Section title="2. Information We Collect">
        <ul style={listStyle}>
          <li>
            <strong>Account information:</strong> name, email address,
            phone number, company affiliation, and role (driver, admin,
            dispatcher, payroll).
          </li>
          <li>
            <strong>Trip data:</strong> odometer readings, fuel purchases,
            expenses, delivery details, dates, and IFTA-related mileage
            information you enter.
          </li>
          <li>
            <strong>Documents and photos:</strong> receipt photos, load
            proof documents, ACI/ACE documents, and company branding
            assets you upload.
          </li>
          <li>
            <strong>Usage data:</strong> basic technical data such as
            device type and app activity, used to maintain and improve the
            Service.
          </li>
        </ul>
        We do not collect real-time GPS location or continuously track
        vehicle location. TripSheetHQ does not include live odometer or
        GPS auto-tracking features.
      </Section>

      <Section title="3. How We Use Your Information">
        <ul style={listStyle}>
          <li>To operate and maintain your trip sheet records</li>
          <li>To let your company's admin and payroll staff review trip and expense data</li>
          <li>To generate documentation needed for IFTA and payroll purposes</li>
          <li>To send account-related emails (e.g. invites, notifications)</li>
          <li>To improve the reliability and functionality of the Service</li>
        </ul>
      </Section>

      <Section title="4. How Your Data Is Shared Within Your Company">
        TripSheetHQ is a multi-tenant platform. Each company's data is kept
        separate from other companies using the Service. Within your own
        company, your trip data, documents, and expenses are visible to
        your company's administrators, dispatchers, and payroll staff as
        appropriate to their role. Your data is never visible to other
        companies using TripSheetHQ.
      </Section>

      <Section title="5. Data Storage & Security">
        Data is stored using industry-standard cloud infrastructure
        (Firebase/Google Cloud) with authentication and access controls in
        place. While we take reasonable steps to protect your information,
        no system is 100% secure, and we cannot guarantee absolute
        security.
      </Section>

      <Section title="6. Data Retention">
        We retain trip and account data for as long as your company's
        account remains active, or as required for tax, payroll, or legal
        recordkeeping purposes. You may request deletion of your personal
        account data by contacting us, subject to your company's own
        recordkeeping requirements.
      </Section>

      <Section title="7. Your Rights">
        Depending on your location, you may have rights to access, correct,
        or request deletion of your personal information. Contact your
        company administrator or reach out to us directly to make a
        request.
      </Section>

      <Section title="8. Changes to This Policy">
        We may update this Privacy Policy from time to time. Material
        changes will be communicated through the app or by email.
      </Section>

      <Section title="9. Contact Us">
        Questions about this Privacy Policy can be directed to the contact
        email listed on tripsheethq.com.
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h2
        style={{
          fontSize: "17px",
          fontWeight: 600,
          marginBottom: "10px",
          color: "#111827",
        }}
      >
        {title}
      </h2>
      <div style={{ fontSize: "14px", lineHeight: "1.7", color: "#374151" }}>
        {children}
      </div>
    </div>
  );
}

const listStyle = {
  paddingLeft: "20px",
  marginTop: "8px",
  marginBottom: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};
