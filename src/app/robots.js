export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private, logged-in pages - keep them out of Google
        disallow: ["/admin", "/dashboard", "/trip", "/messages", "/time-off", "/api"],
      },
    ],
    sitemap: "https://tripsheethq.com/sitemap.xml",
    host: "https://tripsheethq.com",
  };
}
