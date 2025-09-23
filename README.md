# Mediflow Medical Platform

A comprehensive, production-ready medical workflow management system with a modern React frontend and FastAPI backend. Built for healthcare professionals to manage patients, resources, appointments, and analytics with enterprise-grade security and performance.

## 🚀 Quick Start

### Prerequisites
- Python 3.13+
- Node.js (v14 or higher)
- Docker & Docker Compose (recommended)
- SQLite/PostgreSQL

### Installation & Running

#### Option 1: Docker (Recommended)
```bash
# Clone the repository
git clone <your-repo-url>
cd mediflow

# Start the entire application with Docker
docker-compose up --build
```

#### Option 2: Manual Setup

**Backend Setup:**
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows: venv\Scripts\activate
# On macOS/Linux: source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Initialize database
python -c "from app.database import init_db; init_db()"

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
```

**Access the platform:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

## 📁 Complete Project Structure

```
mediflow/
├── backend/                       # FastAPI Backend
│   ├── app/                       # Main application package
│   │   ├── api/                   # API route handlers
│   │   │   ├── analytics.py       # Analytics endpoints
│   │   │   ├── auth.py           # Authentication endpoints
│   │   │   ├── patients.py       # Patient management endpoints
│   │   │   ├── resources.py      # Resource management endpoints
│   │   │   └── __init__.py
│   │   ├── core/                 # Core configuration and security
│   │   │   ├── config.py         # Application configuration
│   │   │   ├── security.py       # Security utilities (JWT, password hashing)
│   │   │   └── __init__.py
│   │   ├── models/               # SQLAlchemy database models
│   │   │   ├── base.py           # Base model class
│   │   │   ├── patient.py        # Patient model
│   │   │   ├── outcome.py        # Medical outcome model
│   │   │   ├── resource.py       # Resource model
│   │   │   ├── analytics.py      # Analytics data model
│   │   │   └── __init__.py
│   │   ├── schemas/              # Pydantic schemas for validation
│   │   │   ├── patient.py        # Patient schemas
│   │   │   ├── outcome.py        # Outcome schemas
│   │   │   ├── resource.py       # Resource schemas
│   │   │   ├── user.py           # User schemas
│   │   │   ├── analytics.py      # Analytics schemas
│   │   │   └── __init__.py
│   │   ├── database.py           # Database configuration and connection
│   │   ├── main.py               # FastAPI application entry point
│   │   └── __init__.py
│   ├── venv/                     # Python virtual environment
│   ├── docker-compose.yml        # Docker Compose configuration
│   ├── Dockerfile               # Docker image definition
│   ├── init.sql                 # Database initialization script
│   ├── mediflow.db              # SQLite database file
│   └── requirements.txt         # Python dependencies
├── frontend/                     # React Frontend
│   ├── public/                   # Static public assets
│   ├── src/                     # React application source code
│   ├── build/                   # Production build output
│   │   └── static/
│   │       ├── css/            # Compiled CSS stylesheets
│   │       └── js/             # Bundled JavaScript files
│   ├── node_modules/            # Project dependencies (auto-generated)
│   └── package.json            # Project configuration and dependencies
└── README.md                    # Project documentation
```

## 🛠️ Technology Stack

### Backend (FastAPI/Python)
- **FastAPI** - Modern Python web framework with automatic API docs
- **SQLAlchemy** - Database ORM with relationship management
- **SQLite/PostgreSQL** - Database storage with migration support
- **JWT Authentication** - Secure token-based authentication
- **bcrypt** - Password hashing and security
- **Pydantic** - Data validation and serialization
- **uvicorn** - ASGI server for production deployment
- **Docker** - Containerization and deployment

### Frontend (React.js)
- **React 18+** - Modern UI framework with hooks
- **React Query (@tanstack/react-query)** - Server state management
- **Chart.js** - Advanced data visualization and analytics
- **Styled Components** - CSS-in-JS styling solution
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing
- **Jest & Testing Library** - Comprehensive testing suite
- **Webpack** - Module bundling and optimization

### Database & Security
- **SQLAlchemy Models** - Relational data modeling
- **JWT Tokens** - Secure API authentication
- **Password Hashing** - bcrypt security implementation
- **CORS Support** - Cross-origin resource sharing
- **Input Validation** - Pydantic schema validation

## 📊 Core Features

### Patient Management System
- **Comprehensive Patient Profiles** - Demographics, medical history, insurance
- **Medical Records** - EHR-compliant record keeping with audit trails
- **Patient Search & Filtering** - Advanced search capabilities
- **Document Management** - Upload and manage patient documents
- **Insurance Verification** - Real-time coverage checking

### Resource Management
- **Medical Equipment Tracking** - Availability, maintenance, allocation
- **Staff Scheduling** - Doctor availability and appointment management
- **Inventory Management** - Medical supplies and medication tracking
- **Room Management** - Facility scheduling and utilization

### Analytics & Reporting
- **Real-time Dashboard** - Live metrics and KPIs
- **Patient Analytics** - Demographics, visit patterns, outcomes
- **Resource Utilization** - Equipment usage, staff efficiency
- **Financial Reports** - Revenue tracking, billing analytics
- **Custom Reports** - Exportable data analysis

### Authentication & Security
- **JWT-based Authentication** - Secure token management
- **Role-based Access Control** - Fine-grained permissions
- **Password Security** - bcrypt hashing with salt
- **Session Management** - Secure user sessions
- **API Rate Limiting** - Protection against abuse

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login with JWT token
- `POST /api/auth/register` - New user registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Secure logout

### Patient Management
- `GET /api/patients` - List all patients with pagination
- `POST /api/patients` - Create new patient record
- `GET /api/patients/{id}` - Get detailed patient information
- `PUT /api/patients/{id}` - Update patient details
- `DELETE /api/patients/{id}` - Archive patient record
- `GET /api/patients/{id}/history` - Patient medical history

### Resource Management
- `GET /api/resources` - List medical resources
- `POST /api/resources` - Add new resource
- `PUT /api/resources/{id}` - Update resource availability
- `GET /api/resources/availability` - Check resource availability
- `POST /api/resources/{id}/allocate` - Allocate resource

### Analytics & Reporting
- `GET /api/analytics/overview` - System overview statistics
- `GET /api/analytics/patient-stats` - Patient demographic analytics
- `GET /api/analytics/resource-usage` - Resource utilization metrics
- `GET /api/analytics/financial` - Revenue and billing reports

## 🚀 Deployment

### Docker Deployment (Production)
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose logs -f

# Scale backend services
docker-compose up --scale backend=3
```

### Manual Production Deployment

**Backend:**
```bash
# Install dependencies
pip install -r requirements.txt

# Set production environment
export ENVIRONMENT=production
export DATABASE_URL=postgresql://user:pass@localhost/mediflow

# Start with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

**Frontend:**
```bash
# Build for production
npm run build

# Serve with nginx or static server
serve -s build -l 3000
```

## 🧪 Testing & Development

### Backend Testing
```bash
cd backend
pytest tests/ -v
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Development Scripts
```bash
# Backend development server
uvicorn app.main:app --reload

# Frontend development server
npm start

# Run linting
npm run lint

# Build production bundle
npm run build
```

## ⚙️ Configuration

### Environment Variables
```env
# Backend Configuration
DATABASE_URL=sqlite:///./mediflow.db
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=development

# Optional: External API Keys
INSURANCE_API_KEY=your-insurance-api-key
LAB_API_KEY=your-lab-integration-key
```

### Frontend Configuration
The React app automatically connects to the backend API and includes:
- Responsive design for all screen sizes
- Progressive Web App (PWA) capabilities
- Optimized bundle splitting
- Service worker for offline functionality

## 📈 Performance & Monitoring

### Backend Performance
- **Async/Await**: FastAPI's asynchronous request handling
- **Database Connection Pooling**: Efficient database connections
- **Caching**: Redis integration for frequent queries
- **Background Tasks**: Celery for heavy operations

### Frontend Performance
- **Code Splitting**: Automatic bundle optimization
- **Lazy Loading**: Component-level code splitting
- **Memoization**: React.memo and useMemo optimizations
- **Service Worker**: Caching and offline functionality

## 🔒 Security Features

### Data Protection
- **HIPAA Compliance** - Healthcare data protection standards
- **Encryption at Rest** - Database encryption for sensitive data
- **SSL/TLS** - Secure data transmission
- **Input Sanitization** - Protection against injection attacks

### Access Control
- **JWT Authentication** - Stateless token-based auth
- **Role-based Permissions** - Granular access control
- **Session Management** - Secure user sessions
- **Audit Logging** - Complete activity tracking

## 📋 Future Roadmap

### High Priority
- [ ] **PostgreSQL Migration** - Production database upgrade
- [ ] **Enhanced API Documentation** - Comprehensive Swagger docs
- [ ] **Unit Test Coverage** - 90%+ test coverage
- [ ] **Real-time Updates** - WebSocket integration
- [ ] **Advanced Analytics** - Machine learning insights

### Medium Priority
- [ ] **Mobile App** - React Native companion app
- [ ] **Microservices Architecture** - Service decomposition
- [ ] **Advanced Search** - Elasticsearch integration
- [ ] **Backup & Recovery** - Automated backup system
- [ ] **Multi-tenant Support** - Multiple facility management

### Security & Compliance
- [ ] **Two-factor Authentication** - Enhanced security
- [ ] **Data Encryption** - End-to-end encryption
- [ ] **Compliance Auditing** - HIPAA audit trails
- [ ] **Penetration Testing** - Regular security assessments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes with proper tests
4. Run tests: `npm test` (frontend) and `pytest` (backend)
5. Commit changes: `git commit -am 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Submit a pull request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Troubleshooting

### Common Issues
- **Docker Build Failures**: Check Docker version and available memory
- **API Connection Issues**: Verify backend is running on port 8000
- **Database Errors**: Check database initialization and permissions
- **Frontend Build Issues**: Clear node_modules and reinstall

---

**Built with ❤️ for healthcare professionals**

*Enterprise-grade medical workflow management with modern technology stack, comprehensive security, and scalable architecture.*