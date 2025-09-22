# IIICI - Innovation & Intellectual Capital Index Certification

A comprehensive web application for institutional innovation assessment and certification, built with Next.js, TypeScript, and Prisma.

## 🚀 Features

### **Core Functionality**

- **Multi-Pillar Assessment**: 6 comprehensive innovation pillars
- **Real-time Scoring**: Dynamic score calculation and validation
- **Progressive Form Wizard**: Step-by-step assessment process
- **Database Integration**: Full CRUD operations with PostgreSQL
- **Authentication**: NextAuth.js with Google OAuth
- **Role-based Access**: User, Admin, and Super Admin roles

### **Dashboard & Reports**

- **Comprehensive Dashboard**: Real-time progress tracking
- **PDF Report Generation**: Professional certification reports
- **Data Export**: CSV and Excel export functionality
- **Advanced Sharing**: Multiple sharing options (email, clipboard, native)
- **Print Functionality**: Print-ready reports
- **Historical Tracking**: Assessment history and trends

### **Admin Panel**

- **Application Review**: Admin review and approval system
- **User Management**: Complete user administration
- **Statistics & Analytics**: Comprehensive reporting
- **Audit Trail**: Complete audit logging

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Shadcn/ui**: Modern component library
- **Lucide React**: Beautiful icons

### **Backend**

- **Next.js API Routes**: Server-side API endpoints
- **Prisma ORM**: Database management
- **PostgreSQL**: Primary database
- **NextAuth.js**: Authentication system

### **Development Tools**

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Google OAuth credentials (for authentication)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/abhishekdev057/IICI.git
cd IICI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/iiici_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
iiicicertification/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Dashboard pages
│   ├── application/              # Form wizard pages
│   └── admin/                    # Admin panel pages
├── components/                   # React components
│   ├── ui/                       # Reusable UI components
│   ├── dashboard/                # Dashboard components
│   ├── application/              # Form components
│   └── admin/                    # Admin components
├── contexts/                     # React contexts
├── lib/                          # Utility libraries
├── prisma/                       # Database schema
├── public/                       # Static assets
└── types/                        # TypeScript type definitions
```

## 🔧 Key Components

### **Form Wizard (`components/application/form-wizard.tsx`)**

- Multi-step form navigation
- Progress tracking
- Validation and error handling
- Progressive unlocking of steps

### **Dashboard (`app/dashboard/page.tsx`)**

- Real-time score display
- Pillar performance charts
- Export and sharing functionality
- Historical data tracking

### **Data Context (`contexts/data-context.tsx`)**

- Global state management
- Database operations
- Real-time updates
- Error handling

### **Export Reports (`components/dashboard/export-reports.tsx`)**

- PDF generation with jsPDF
- CSV/Excel export
- Multiple sharing options
- Print functionality

## 🗄️ Database Schema

### **Core Models**

- **User**: Authentication and profile data
- **Application**: Main application records
- **InstitutionData**: Organization information
- **IndicatorResponse**: Individual indicator responses
- **ScoreAudit**: Score calculation history
- **Certification**: Certification records

### **Enums**

- **UserRole**: USER, ADMIN, SUPER_ADMIN
- **ApplicationStatus**: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
- **CertificationLevel**: CERTIFIED, NOT_CERTIFIED

## 🔐 Authentication & Authorization

### **NextAuth.js Configuration**

- Google OAuth provider
- JWT strategy
- Session management
- Role-based access control

### **Protected Routes**

- `/dashboard`: User dashboard
- `/application`: Form wizard
- `/admin`: Admin panel (ADMIN+ roles)

## 📊 Assessment Framework

### **6 Innovation Pillars**

1. **Strategic Foundation & Leadership**
2. **Resource Allocation & Infrastructure**
3. **Innovation Processes & Culture**
4. **Knowledge & IP Management**
5. **Strategic Intelligence & Collaboration**
6. **Performance Measurement & Improvement**

### **Scoring System**

- **Gold**: 80%+ overall score
- **Certified**: 60-79% overall score
- **Not Certified**: <60% overall score

## 🚀 Deployment

### **Vercel (Recommended)**

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### **Other Platforms**

- **Railway**: Easy PostgreSQL + Next.js deployment
- **Netlify**: Static site hosting
- **AWS**: Full cloud deployment

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate   # Run migrations
npx prisma studio    # Open database GUI

# Linting & Formatting
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API documentation
- [ ] Performance optimizations
- [ ] Additional export formats

---

**Built with ❤️ for innovation assessment and certification**
