<<<<<<< HEAD
# RentHub
RentHub is a community resource-sharing platform where users can lend, borrow, rent, and share underutilized items such as tools, books, appliances, and equipment.
=======
# 🌿 RentHub - Community Resource Sharing Platform

A modern, peer-to-peer community platform where neighbors can **share, lend, borrow, or rent underutilized resources** (tools, appliances, outdoor gear, electronics, books, etc.) built with **Java 25 & Spring Boot 3.3.5**, **MySQL 8.0**, and **React 18 & Vite**.

---

## 🏗️ Architecture

```
d:\RentHub\
├── backend/                       # Java 25 & Spring Boot 3.3.5 Backend
│   ├── pom.xml                    # Maven dependencies (Spring Boot, Security, JPA, JJWT, Swagger)
│   ├── src/main/java/com/rental/
│   │   ├── RentalAppApplication.java
│   │   ├── config/                # SecurityConfig, OpenApiConfig, WebMvcConfig, DataSeeder
│   │   ├── controller/            # AuthController, ProductController, CategoryController, RentalController
│   │   ├── dto/                   # AuthDTO, ProductDTO, RentalDTO
│   │   ├── entity/                # User, PhoneOtp, Product, Category, RentalRequest, Review, Enums
│   │   ├── exception/             # GlobalExceptionHandler, Custom Exceptions
│   │   ├── repository/            # UserRepository, PhoneOtpRepository, ProductRepository, etc.
│   │   ├── security/              # JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
│   │   └── service/               # AuthService, FileStorageService, ProductService
│   └── src/main/resources/
│       └── application.properties # MySQL 8.0 datasource & JWT configuration
│
├── frontend/                      # React 18 & Vite SPA
│   ├── package.json               # React, Vite, Tailwind CSS, Lucide Icons, Axios
│   ├── vite.config.js             # Vite proxy forwarding /api to port 8080
│   ├── tailwind.config.js         # Modern Dark/Glassmorphic Theme
│   ├── src/
│   │   ├── api/client.js          # Axios client with automated JWT Bearer interceptor
│   │   ├── context/AuthContext.jsx # Auth session state
│   │   ├── components/Navbar.jsx  # Trust & verification badges, user avatar, logout
│   │   ├── pages/
│   │   │   ├── Register.jsx       # 4-Step Registration with OTP & Aadhaar/PAN KYC
│   │   │   ├── Login.jsx          # Email/Phone login
│   │   │   └── Home.jsx           # Welcome Hero, verified status, categories & stats
│   │   ├── App.jsx                # Client view router
│   │   └── main.jsx
│
├── .gitignore
└── README.md
```

---

## 🔐 4-Step Registration & Verification Flow

1. **STEP 1: Basic Details**
   - Full Name, Email, Phone Number, Password, Confirm Password
2. **STEP 2: Phone OTP (Mandatory)**
   - SMS OTP dispatch $\rightarrow$ 6-digit verification code input $\rightarrow$ Auto-verification
3. **STEP 3: Identity Verification (KYC)**
   - 12-Digit Aadhaar Number with formatting (`XXXX XXXX XXXX`)
   - Aadhaar Card Document/Photo upload
   - PAN Card Document/Photo upload
4. **STEP 4: Submit & Save to MySQL**
   - Encrypts password with BCrypt
   - Stores documents in `/uploads/kyc/`
   - Creates MySQL user record with `KYC_STATUS = 'VERIFIED'`
   - Auto-redirects to the Login Page

---

## 🚀 How to Run the Project

### 1. Run Spring Boot Backend
```bash
cd backend
mvn clean spring-boot:run
```
*Backend runs on `http://localhost:8080`*  
*Swagger API Docs: `http://localhost:8080/swagger-ui.html`*

### 2. Run React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*
>>>>>>> 468bf5d (Registration & login completed)
