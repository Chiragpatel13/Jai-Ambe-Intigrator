# JAYAMBE INTEGRATORS - Project Documentation

Welcome to the official developer documentation for the **JayAmbe Integrators** web application. This document outlines the project overview, system architecture, database models, API route specifications, and local development configurations.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Folder & Directory Structure](#-folder--directory-structure)
4. [Key Features & Business Logic](#-key-features--business-logic)
5. [Database Architecture & Schemas](#-database-architecture--schemas)
6. [API Endpoints Directory](#-api-endpoints-directory)
7. [Installation & Local Setup](#-installation--local-setup)

---

## 🌟 Project Overview
**JayAmbe Integrators** is a premium, state-of-the-art catalog and business management portal for an electrical, electronic spares, and CCTV integration business located in Boisar, Palghar. 
The application functions as a dynamic product showcase for visitors and integrates a fully featured administrative dashboard supporting lead inquiry processing, content management, analytics reporting, and customer testimonial moderation.

---

## 🛠️ Tech Stack
* **Framework:** Next.js (App Router, Turbopack enabled)
* **Styling:** TailwindCSS & Vanilla CSS
* **Database & Persistence:**
  * **Primary:** Firebase Firestore (for high-availability serverless persistence)
  * **Secondary/Development:** MongoDB & Mongoose schemas (supporting hybrid configurations)
* **Icons & UI:** Lucide React
* **Image Hosting:** Cloudinary (secure image uploads)

---

## 📂 Folder & Directory Structure
```bash
├── app/                      # Next.js App Router Pages & APIs
│   ├── (public)/             # Public client-side pages (Home, Products, Categories, Gallery, About, Contact)
│   ├── admin/                # Admin Panel pages (Inquiries, Products, Gallery, Categories, Settings, Analytics)
│   └── api/                  # Backend REST API Routes
├── components/               # Reusable UI Components (Navbar, Footer, AdminLayout, Toast, Loader)
├── config/                   # Environment presets (.env.dev, .env.prod)
├── hooks/                    # Custom React hooks (useTheme, useLiveSync)
├── lib/                      # Firebase setup, DB Helpers, Mock data definitions
├── models/                   # Mongoose Database schemas (Product, Category, Inquiry, Setting, Gallery)
├── public/                   # Static assets & client uploaded media
└── PROJECT_DOCUMENTATION.md  # Project documentation
```

---

## ✨ Key Features & Business Logic

### 1. Catalog Partitioning & Smart Hiding
* **Partitions:** Products are cataloged into three sections on the homepage: *Featured Products*, *New Arrivals*, and *Used/Refurbished Products*.
* **New Arrivals Filter:** Displays products added within the last 30 days.
* **Auto-Hide Sections:** If a category or section contains no active products, it is dynamically hidden from the client view to maintain an active-looking catalog.

### 2. Client Product Viewer & Interactive Controls
* **Keyboard Navigation:** Users can swipe through product image galleries using the `Left Arrow` and `Right Arrow` keys (guarded against active form input focus).
* **Hover Chevrons:** Next/previous overlays on mouse hover for easy navigation.
* **Flowing Thumbnails:** Compact carousel using wrapping thumbnail buttons to accommodate products with many images without expanding page size.
* **Dynamic Specification Cards:** Highlights Brand, Warranty details, and Location (defaulting to `'Boisar'`).

### 3. Customer Review Engine & Pinning Controls
* **Submission Form:** Visitors can write product reviews directly on the product's detail page (supplying Name, Comments, and a 1-5 Star rating).
* **Admin Review Management:** Admins can view and delete product reviews from the product edit modal.
* **Homepage Testimonial Pinning:** Admins can "pin" specific client reviews to the homepage.
* **Smart Testimonial Fallback:** If fewer than 3 reviews are pinned, the system fills the remaining grids with pre-configured default local testimonials to preserve the 3-column layout.
* **Enable/Disable Global Flag:** Shop settings include a global toggle to turn off reviews completely, hiding them from the homepage and product pages.

### 4. Admin Lead Inquiry Pipeline
* **Dynamic Notifications:** The admin sidebar bell query counts pending inquiries in the database and updates a red badge count in real-time.
* **Interactive Lists:** Mobile cards and desktop table rows in Inquiry Management are fully clickable to open detailed inquiry modals. Event propagation is guarded to prevent conflicting action clicks.

---

## 🗄️ Database Architecture & Schemas

### 1. Product Schema
```javascript
const ProductSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  condition: { type: String, enum: ['new', 'used'], default: 'new' },
  description: { type: String, required: true },
  images: [{ type: String }],
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  stock: { type: Number, default: 1 },
  availability: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  brand: { type: String, default: '' },
  warranty: { type: String, default: '' },
  location: { type: String, default: 'Boisar' },
  reviews: [{
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    featured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });
```

### 2. Setting Schema
```javascript
const SettingSchema = new Schema({
  shopName: { type: String, default: 'JAYAMBE INTEGRATORS' },
  ownerName: { type: String, default: 'Er. Anand' },
  designation: { type: String, default: 'EXTC ENGINEER' },
  email: { type: String, default: 'anandp4994@gmail.com' },
  phone: { type: String, default: '+91 8879430925' },
  whatsapp: { type: String, default: '918879430925' },
  address: { type: String, default: 'Office: Mahavir Nagar, Shop No. 28...' },
  workingHours: { type: String, default: 'Monday - Saturday: 9:00 AM - 8:00 PM' },
  enableReviews: { type: Boolean, default: true }
}, { timestamps: true });
```

---

## 🌐 API Endpoints Directory

### Public Routes
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/settings` | Retrieve active store configurations |
| `GET` | `/api/categories?hasProducts=true` | Fetch categories (optionally only those containing products) |
| `GET` | `/api/products` | Query products list (supports pagination, featured, condition, and age limits) |
| `GET` | `/api/products/[id]` | Fetch detailed specifications for a single product |
| `POST` | `/api/products/[id]/reviews` | Submit a public product review |
| `GET` | `/api/reviews/featured` | Fetch pinned homepage testimonials |

### Admin Moderation & Control (Requires Authentication Session)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/categories` | Add a new product category |
| `POST` | `/api/products` | Create a new product listing |
| `PUT` | `/api/products/[id]` | Edit existing product details |
| `DELETE` | `/api/products/[id]` | Remove product from database |
| `PUT` | `/api/products/[id]/reviews` | Pin/unpin a product review on the homepage |
| `DELETE` | `/api/products/[id]/reviews` | Delete an inappropriate review |
| `GET` | `/api/inquiries` | List customer consultation requests |
| `PUT` | `/api/inquiries/[id]` | Toggle inquiry action status (e.g. pending/completed) |
| `DELETE` | `/api/inquiries/[id]` | Clear inquiry from history |
| `PUT` | `/api/settings` | Save global shop configuration changes |
| `POST` | `/api/upload` | Securely upload product images |

---

## 🚀 Installation & Local Setup

### 1. Environment Configurations
Prepare your `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/jai-ambe-integrator
JWT_SECRET=your_jwt_secret_hash
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Firebase configs (Primary Database)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Launch Development Server
```bash
# Install dependencies
npm install

# Run the app locally
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Production Build
To build and optimize the application for production:
```bash
npm run build
npm start
```
All routes will build statically or dynamically according to configuration schema guidelines.

---
*Documentation last updated: June 2026.*
