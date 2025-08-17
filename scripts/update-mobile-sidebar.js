const fs = require('fs');
const path = require('path');

const dashboardPages = [
  'bookings', 'clients', 'braiders', 'messages', 
  'transactions', 'settings', 'help', 'capacity'
];

dashboardPages.forEach(page => {
  const filePath = path.join(__dirname, '..', 'app', 'dashboard', page, 'page.tsx');
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already has mobile menu state
    if (!content.includes('isMobileMenuOpen')) {
      // Add state after the component declaration
      content = content.replace(
        /export default function \w+\(\) {[\s\S]*?{([^}]*?const { user)/,
        (match, group1) => {
          return match.replace(group1, `
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  ${group1}`);
        }
      );
      
      // Update the Sidebar to include MobileSidebar
      content = content.replace(
        /<Sidebar \/>/g,
        `<Sidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />`
      );
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${page}/page.tsx`);
  }
});