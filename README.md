# VOTESECURE - Multi-Election Voting Platform

A secure, modern, and user-friendly voting platform built with the MERN stack. NCITHub enables organizations to conduct multiple elections simultaneously with robust security features and real-time results.

## 🚀 Features

### 🔐 **Authentication & Security**
- Secure user registration and login
- JWT-based authentication
- Role-based access control (Admin/User)
- Password encryption with bcrypt

### 🗳️ **Election Management**
- Create and manage multiple elections
- Set election start/end dates
- Real-time election status tracking
- Candidate management system

### 👥 **User Experience**
- Intuitive dashboard for voters
- One-vote-per-election enforcement
- Voting history tracking
- Responsive design for all devices

### 📊 **Results & Analytics**
- Real-time vote counting
- Interactive results visualization
- Election statistics and metrics
- Configurable results visibility

### 🛡️ **Admin Features**
- Complete election lifecycle management
- Candidate addition/removal
- User voting status monitoring
- Comprehensive analytics dashboard

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons
- **CSS3** - Custom styling with modern design

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
ncithub-voting-platform/
├── backend/                 # Backend API
│   ├── middleware/         # Authentication & error handling
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   └── server.js          # Express server
├── src/                   # Frontend React app
│   ├── components/        # React components
│   │   ├── admin/        # Admin dashboard
│   │   ├── auth/         # Login/Register
│   │   ├── layout/       # Header/Navigation
│   │   ├── results/      # Results display
│   │   ├── user/         # User dashboard
│   │   └── voting/       # Voting interface
│   ├── contexts/         # React contexts
│   ├── services/         # API services
│   └── styles/           # CSS stylesheets
└── package.json          # Dependencies
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack-voting-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment Setup**
   
   Create `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/votesecure-voting
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   PORT=5000
   ```

4. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately:
   # Backend only
   npm run server
   
   # Frontend only
   npm run client
   ```

5. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

## 📚 API Documentation

### **Authentication Endpoints**
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
```

### **Election Endpoints**
```
GET    /api/elections           # Get all elections
GET    /api/elections/:id       # Get single election
POST   /api/elections           # Create election (Admin)
PUT    /api/elections/:id       # Update election (Admin)
DELETE /api/elections/:id       # Delete election (Admin)
GET    /api/elections/:id/results # Get election results
```

### **Candidate Endpoints**
```
GET    /api/candidates/election/:id  # Get candidates for election
POST   /api/candidates              # Create candidate (Admin)
PUT    /api/candidates/:id          # Update candidate (Admin)
DELETE /api/candidates/:id          # Delete candidate (Admin)
```

### **Voting Endpoints**
```
POST /api/votes              # Cast vote
GET  /api/votes/check/:id    # Check if user voted
GET  /api/votes/history      # Get user voting history
```

## 🎨 Design Features

### **Modern UI/UX**
- Clean, professional design
- Intuitive navigation
- Responsive layout
- Smooth animations and transitions

### **Color Scheme**
- Primary: `#2563eb` (Blue)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Amber)
- Error: `#dc2626` (Red)
- Neutral: Various grays

### **Typography**
- System fonts for optimal performance
- Clear hierarchy with proper sizing
- Excellent readability across devices

## 🔒 Security Features

- **Password Security**: bcrypt hashing with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation for all inputs
- **Vote Integrity**: One vote per user per election
- **Role-based Access**: Admin/User permission system

## 🚀 Deployment

### **Frontend Deployment**
```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

### **Backend Deployment**
- Set environment variables on your hosting platform
- Ensure MongoDB connection string is configured
- Deploy to services like Heroku, Railway, or DigitalOcean

### **Environment Variables for Production**
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
JWT_EXPIRE=7d
NODE_ENV=production
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

For support, email alexsagar@gmail.com or create an issue in the repository.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Lucide React for beautiful icons
- All contributors and testers

---

**Built with ❤️ by the Sagar Nepali**

*Empowering democratic participation through secure digital voting*
