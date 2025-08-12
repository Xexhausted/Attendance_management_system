# ZenFlow - Attendance Management System

A modern, full-featured attendance management application built with React, TypeScript, and shadcn/ui components. ZenFlow provides a beautiful and intuitive interface for tracking employee attendance with advanced analytics and user management features.

## 🌟 Features

### Core Functionality
- **User Authentication & Authorization** - Secure login system with role-based access
- **Real-time Attendance Tracking** - Check-in/check-out functionality with time tracking
- **Role-based Dashboards** - Different interfaces for users and administrators
- **Comprehensive Analytics** - Advanced charts and statistics for attendance patterns
- **User Management** - Profile settings, preferences, and account management

### User Experience
- **Zen-inspired Design** - Beautiful, calming interface with smooth animations
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Mode Support** - Customizable theme preferences
- **Real-time Updates** - Live data updates and notifications
- **Accessibility** - WCAG compliant with keyboard navigation support

### Admin Features
- **Analytics Dashboard** - Comprehensive attendance analytics with charts
- **User Management** - View and manage all users and their attendance
- **Department Performance** - Track attendance by department
- **Export Capabilities** - Download attendance reports and data
- **System Settings** - Configure application preferences and policies

### User Features
- **Personal Dashboard** - Individual attendance overview and statistics
- **Profile Management** - Update personal information and preferences
- **Attendance History** - View past attendance records and patterns
- **Notifications** - Real-time alerts and reminders
- **Settings Customization** - Personalize the application experience

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
npm run dev
```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   ├── Navigation.tsx # Main navigation component
│   ├── UserDashboard.tsx # User dashboard
│   └── AdminDashboard.tsx # Admin dashboard
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── data/              # Mock data and utilities
│   └── mockData.ts    # Attendance data
├── hooks/             # Custom React hooks
├── pages/             # Page components
│   ├── Index.tsx      # Main dashboard
│   ├── Login.tsx      # Login page
│   ├── Settings.tsx   # Settings page
│   ├── Analytics.tsx  # Analytics page
│   └── NotFound.tsx   # 404 page
├── types/             # TypeScript type definitions
└── lib/               # Utility functions
```

## 🎨 Design System

### Color Palette
- **Primary**: Zen-inspired green gradients
- **Success**: Emerald green for positive actions
- **Warning**: Amber for late arrivals
- **Destructive**: Red for errors and absences
- **Muted**: Subtle grays for secondary information

### Components
Built with shadcn/ui components for consistency and accessibility:
- Cards, Buttons, Inputs, and Forms
- Charts and Data Visualization
- Navigation and Layout components
- Toast notifications and Alerts

### Animations
- Smooth page transitions
- Hover effects and micro-interactions
- Loading states and feedback
- Zen-inspired floating animations

## 🔐 Authentication

The application uses a mock authentication system with two default users:

### Demo Users
- **Admin User**
  - Email: `admin@company.com`
  - Password: `demo123`
  - Role: Administrator

- **Regular User**
  - Email: `user@company.com`
  - Password: `demo123`
  - Role: Employee

### Features
- Role-based access control
- Protected routes
- Session persistence
- Role switching for testing

## 📊 Analytics & Data

### Charts and Visualizations
- **Line Charts** - Attendance trends over time
- **Bar Charts** - Department performance comparison
- **Pie Charts** - Attendance distribution
- **Real-time Statistics** - Live attendance metrics

### Data Management
- Mock data generation for demonstration
- Real-time data processing
- Export capabilities
- Historical data tracking

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Icon library
- **Recharts** - Data visualization library

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=your_api_url_here
VITE_APP_NAME=ZenFlow
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Mobile app version
- [ ] Advanced reporting
- [ ] Integration with HR systems
- [ ] Biometric authentication
- [ ] Offline support
- [ ] Multi-language support
- [ ] Advanced analytics

---

**ZenFlow** - Find your zen in attendance management 🌿
