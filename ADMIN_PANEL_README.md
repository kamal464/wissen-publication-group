# Universal Publishers Admin Panel

A comprehensive admin panel for managing academic journals, articles, and analytics for the Universal Publishers platform.

## 🚀 Features

### Authentication & Security
- **Secure Login System** - Admin authentication with session management
- **Protected Routes** - All admin pages require authentication
- **Session Management** - Automatic logout and session validation

### Dashboard & Analytics
- **Statistics Overview** - Real-time metrics for journals, articles, and submissions
- **Analytics Dashboard** - Comprehensive analytics with charts and data visualization
- **Performance Metrics** - Track journal performance, review times, and acceptance rates

### Journal Management
- **Complete Journal CRUD** - Create, read, update, and delete journals
- **Content Management** - Manage journal pages including:
  - Journal home page content
  - Aims & scope
  - Author guidelines
  - Editorial board information
  - Current issue content
  - Archive page content
  - Articles in press
- **Metadata Management** - ISSN, impact factor, categories, and subject areas
- **File Upload** - Cover image upload and management

### Article Management
- **Article Review System** - Complete workflow for article review process
- **Status Management** - Track articles through PENDING → UNDER_REVIEW → ACCEPTED/REJECTED → PUBLISHED
- **Search & Filter** - Advanced search and filtering capabilities
- **Bulk Actions** - Mass operations on articles
- **Review Comments** - Add review comments and feedback

### Analytics & Reporting
- **Journal Analytics** - Performance metrics for each journal
- **Article Analytics** - Submission trends and status distribution
- **Search Analytics** - Popular search terms and article views
- **Monthly Reports** - Trend analysis and performance tracking

## 🛠️ Technical Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with modern features
- **PrimeReact** - Professional UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development

### Backend
- **NestJS** - Scalable Node.js framework
- **Prisma** - Modern database ORM
- **PostgreSQL** - Reliable database
- **TypeScript** - Full-stack type safety

## 📁 Project Structure

```
frontend/src/app/admin/
├── login/page.tsx              # Admin login page
├── dashboard/page.tsx          # Main dashboard
├── journals/page.tsx           # Journal management
├── articles/page.tsx           # Article management
├── analytics/page.tsx          # Analytics dashboard
└── layout.tsx                  # Admin layout wrapper

backend/src/admin/
├── admin.controller.ts         # Admin API endpoints
├── admin.service.ts           # Business logic
└── admin.module.ts            # Module configuration
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd universal-publishers
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Setup database**
   ```bash
   # Run migrations
   npx prisma migrate dev
   
   # Seed database
   npx prisma db seed
   ```

4. **Start development servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run start:dev

   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

### Access Admin Panel

1. Navigate to `http://localhost:3000/admin/login`
2. Use demo credentials:
   - **Username:** `admin`
   - **Password:** `admin123`

## 🧪 Testing

### End-to-End Testing

Run the comprehensive E2E test suite:

```bash
# Install test dependencies
npm install puppeteer

# Run tests
node test-admin-flow.js

# Run in headless mode
HEADLESS=true node test-admin-flow.js
```

### Test Coverage

The test suite covers:
- ✅ Admin login flow
- ✅ Dashboard navigation
- ✅ Journal management (CRUD operations)
- ✅ Article management and review process
- ✅ Analytics dashboard functionality
- ✅ Logout and session management

## 📊 API Endpoints

### Admin Dashboard
- `GET /admin/dashboard/stats` - Get dashboard statistics
- `GET /admin/analytics/journals` - Journal analytics
- `GET /admin/analytics/articles` - Article analytics
- `GET /admin/analytics/search` - Search analytics

### Journal Management
- `POST /admin/journals` - Create new journal
- `PUT /admin/journals/:id` - Update journal
- `DELETE /admin/journals/:id` - Delete journal

### Article Management
- `PUT /admin/articles/:id/status` - Update article status

## 🔐 Security Features

- **Authentication Required** - All admin routes protected
- **Session Validation** - Automatic session checking
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **XSS Protection** - React's built-in XSS protection

## 📈 Performance Features

- **Lazy Loading** - Components loaded on demand
- **Pagination** - Efficient data loading for large datasets
- **Caching** - Optimized data fetching
- **Responsive Design** - Mobile-friendly interface

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Works on all device sizes
- **Interactive Charts** - Data visualization with PrimeReact charts
- **Toast Notifications** - User feedback for actions
- **Loading States** - Visual feedback during operations
- **Error Handling** - Graceful error management

## 🔧 Configuration

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend (.env)**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/universal_publishers"
PORT=3001
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📝 Usage Examples

### Creating a New Journal

1. Navigate to Journal Management
2. Click "Add New Journal"
3. Fill in basic information (title, description, ISSN)
4. Switch to "Content Management" tab
5. Add aims & scope, guidelines, editorial board
6. Switch to "Journal Pages" tab
7. Add home page content, current issue info
8. Click "Save Journal"

### Managing Articles

1. Go to Articles Management
2. Use search and filters to find articles
3. Click on an article to view details
4. Switch to "Review" tab
5. Add review comments
6. Update status (Accept/Reject/Request Revision)

### Viewing Analytics

1. Navigate to Analytics Dashboard
2. View overview statistics
3. Switch between tabs:
   - **Overview:** General statistics and charts
   - **Submissions:** Recent submission trends
   - **Journal Analytics:** Per-journal performance
   - **Search Analytics:** Popular terms and views

## 🐛 Troubleshooting

### Common Issues

1. **Login not working**
   - Check if backend is running on port 3001
   - Verify database connection
   - Clear browser localStorage

2. **Pages not loading**
   - Ensure both frontend and backend servers are running
   - Check browser console for errors
   - Verify API endpoints are accessible

3. **Database errors**
   - Run `npx prisma migrate dev` to update schema
   - Check database connection string
   - Verify PostgreSQL is running

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Universal Publishers Admin Panel** - Empowering academic publishing through technology.
