export default function Footer() {
  // Use static year to avoid hydration mismatches
  // Update this manually each year or use a build-time constant
  const currentYear = 2025;
  return (
    <footer className="bg-gray-800 text-white py-8" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p suppressHydrationWarning>&copy; {currentYear} Wissen Publication Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
