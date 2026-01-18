export default function Footer() {
  // Automatically updates to current year
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-800 text-white py-8" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-white" style={{ color: '#ffffff' }} suppressHydrationWarning>&copy; {currentYear} Wissen Publication Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
