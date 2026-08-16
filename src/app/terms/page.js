export default function TermsOfServicePage() {
  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "32px" }}>
        Last updated: August 16, 2026
      </p>

      <Section title="1. Acceptance of Terms">
        By accessing or using TripSheetHQ (the "Service"), you agree to be
        bound by these Terms of Service. If you do not agree, do not use
        the Service.
      </Section>

      <Section title="2. Description of Service">
        TripSheetHQ is a digital trip sheet platform for trucking
        companies, allowing drivers to log trips, fuel, expenses, and
        related documentation, and allowing company administrators,
        dispatchers, and payroll staff to review and manage that data.
      </Section>

      <Section title="3. Driver Safety — Use While Driving Prohibited">
        <strong>This app must not be used while operating a vehicle.</strong>{" "}
        All data entry, including trip logs, odometer readings, fuel
        purchases, and expenses, must be completed only when the vehicle
        is safely parked or stopped. Users are solely responsible for
        complying with all applicable laws regarding phone and device use
        while driving. TripSheetHQ and KingsMakers are not liable for any
        accident, injury, fine, or damage resulting from use of the app
        while a vehicle is in motion.
      </Section>

      <Section title="4. Accounts & Company Access">
        <ul style={listStyle}>
          <li>
            Companies are responsible for managing their own driver
            invites and admin access.
          </li>
          <li>
            You are responsible for maintaining the confidentiality of
            your login credentials.
          </li>
          <li>
            Each company's data is logically separated from other
            companies on the platform. TripSheetHQ is not responsible for
            a company's own misuse of invite codes or account sharing.
          </li>
        </ul>
      </Section>

      <Section title="5. Acceptable Use">
        You agree not to:
        <ul style={listStyle}>
          <li>Enter false or fraudulent trip, fuel, or expense data</li>
          <li>Attempt to access another company's data without authorization</li>
          <li>Interfere with or disrupt the Service's operation or security</li>
          <li>Use the Service for any unlawful purpose</li>
        </ul>
      </Section>

      <Section title="6. Subscription & Billing">
        Certain features of TripSheetHQ may require a paid subscription.
        Pricing, trial periods, and billing terms will be presented at the
        time of signup or upgrade. Subscriptions may be cancelled at any
        time; access to paid features will continue until the end of the
        current billing period unless otherwise stated.
      </Section>

      <Section title="7. Data Accuracy & Recordkeeping">
        TripSheetHQ is a tool to help record and organize trip, fuel, and
        expense data, including for IFTA reporting purposes. You are
        responsible for the accuracy of data you enter. TripSheetHQ does
        not guarantee compliance with any specific regulatory requirement
        and should not be treated as a substitute for professional tax,
        legal, or compliance advice.
      </Section>

      <Section title="8. Disclaimer of Warranties">
        The Service is provided "as is" and "as available" without
        warranties of any kind, express or implied. We do not guarantee
        the Service will be uninterrupted, error-free, or fully secure.
      </Section>

      <Section title="9. Limitation of Liability">
        To the fullest extent permitted by law, TripSheetHQ and
        KingsMakers shall not be liable for any indirect, incidental,
        special, or consequential damages arising from your use of the
        Service, including but not limited to damages resulting from use
        of the app while driving.
      </Section>

      <Section title="10. Termination">
        We reserve the right to suspend or terminate access to the Service
        for any account found to be in violation of these Terms.
      </Section>

      <Section title="11. Changes to These Terms">
        We may update these Terms from time to time. Continued use of the
        Service after changes take effect constitutes acceptance of the
        updated Terms.
      </Section>

      <Section title="12. Contact Us">
        Questions about these Terms can be directed to the contact email
        listed on tripsheethq.com.
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
