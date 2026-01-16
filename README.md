
# Angular Map Application with CRUD Operations

A full-stack geospatial asset management application built with Angular and .NET Web API, featuring interactive mapping capabilities using ArcGIS/ESRI Maps, comprehensive CRUD operations, and real-time location management.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Usage Guide](#usage-guide)
- [API Integration](#api-integration)
- [Environment Configuration](#environment-configuration)
- [Contributing](#contributing)
- [License](#license)

## Overview

This application provides a comprehensive solution for managing geospatial assets with an intuitive map-based interface. Users can authenticate, add locations by clicking on the map, search and filter existing assets, and perform full CRUD operations on location data stored in a SQL database via a .NET Web API backend.

## Features

### Core Functionality
- **Interactive Map Interface**: Built with ArcGIS/ESRI Maps for professional-grade mapping
- **Location Management**: Complete CRUD operations for asset locations
- **Click-to-Add**: Toggle add mode to place new assets directly on the map
- **Search & Filter**: Real-time search functionality to find locations by name
- **Visual Highlighting**: Selected locations are highlighted with distinct markers
- **Responsive Design**: Mobile-friendly interface with modern UI components

### Authentication
- User registration with email validation
- Secure login with JWT token-based authentication
- Protected routes and API endpoints

### Data Management
- Form validation for all input fields
- Latitude/longitude range validation
- Success/error feedback messages
- Real-time data synchronization with backend

## Technology Stack

### Frontend
- **Framework**: Angular 17+ (Standalone Components)
- **Mapping Library**: ArcGIS Maps SDK for JavaScript (@arcgis/core)
- **Forms**: Reactive Forms & Template-driven Forms
- **State Management**: RxJS with BehaviorSubject
- **Styling**: SCSS with component-scoped styles
- **HTTP Client**: Angular HttpClient with interceptors

### Backend Integration
- **.NET Web API**: RESTful API endpoints
- **Database**: SQL Server
- **Authentication**: JWT Bearer tokens

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Angular CLI**: v17.x or higher
  ```bash
  npm install -g @angular/cli
  ```
- **.NET SDK**: 6.0 or higher (for backend)
- **SQL Server**: Express or full version (for backend)
- **Git**: For version control

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <https://github.com/shahenda23/angular-map-asset-manager.git>
cd angular-map-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Update the API URL in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44322/api'
};
```



### 4. Backend Setup

Ensure your .NET Web API backend is running on the configured URL. The backend should have the following endpoints:

- `POST /api/Account/register` - User registration
- `POST /api/Account/login` - User login
- `GET /api/Locations` - Get all locations
- `POST /api/Locations` - Create new location
- `PUT /api/Locations/{id}` - Update location
- `DELETE /api/Locations/{id}` - Delete location

### 5. Run the Application

Development server:
```bash
ng serve
```

The application will be available at `http://localhost:4200/`

Build for production:
```bash
ng build --configuration production
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/              # Login component
│   │   ├── register/           # User registration
│   │   ├── map/                # Main map interface
│   │   ├── navbar/             # Navigation bar
│   │   ├── asset-manager/      # CRUD operations sidebar
│   │   ├── add-asset-dialog/   # Dialog for adding assets
│   │   └── confirmation-dialog/ # Delete confirmation
│   ├── services/
│   │   ├── auth.service.ts     # Authentication service
│   │   └── location.service.ts # Location CRUD service
│   ├── models/
│   │   └── location.model.ts   # Data models
│   └── environments/
│       ├── environment.ts      # Development config
│       └── environment.prod.ts # Production config
```

## Usage Guide

### Registration & Login

1. **Register a New Account**:
   - Navigate to the registration page
   - Provide username (min 3 characters), valid email, and password (min 6 characters)
   - Submit to create your account
   - You'll be redirected to login

2. **Login**:
   - Enter your credentials
   - Upon successful authentication, you'll be redirected to the map interface

### Managing Locations

#### Adding a New Location

**Method 1: Click-to-Add**
1. Click the "Add Asset" button in the navbar to toggle add mode
2. Click anywhere on the map to select coordinates
3. A dialog will appear with pre-filled latitude/longitude
4. Enter the asset name and optional description
5. Submit to save the location

**Method 2: Manual Entry**
1. Use the Asset Manager sidebar on the right
2. Fill in the location details manually
3. Enter precise latitude (-90 to 90) and longitude (-180 to 180)
4. Click "Save" to create the location

#### Searching Locations
- Use the search bar in the Asset Manager sidebar
- Type the location name to filter results in real-time
- Click on any result to zoom to that location on the map
- Selected locations are highlighted in gold

#### Editing a Location
1. Click the "Edit" button next to any location in the list
2. Modify the fields in the form
3. Click "Update" to save changes

#### Deleting a Location
1. Click the "Delete" button next to any location
2. Confirm the deletion in the dialog that appears
3. The location will be removed from the database and map

### Map Interaction

- **Zoom**: Use mouse wheel or +/- buttons
- **Pan**: Click and drag the map
- **View Details**: Click on any marker to see a popup with location details
- **Highlight**: Click a location from the search results to highlight it in gold

## API Integration

The application communicates with the backend using the following structure:

### Location Model
```typescript
interface AssetLocation {
  id?: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}
```

### Authentication Headers
All API requests include JWT token authentication:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Service Methods
- `getAllLocations()`: Fetches all locations and updates observable
- `createLocation(location)`: Creates new location and refreshes list
- `updateLocation(id, location)`: Updates existing location
- `deleteLocation(id)`: Deletes location and refreshes list

## Environment Configuration

### Development
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:44322/api'
};
```


## Key Features Implementation

### Form Validation
- Required field validation
- Email format validation
- Latitude range: -90 to 90
- Longitude range: -180 to 180
- Minimum length requirements

### State Management
- Centralized location state using BehaviorSubject
- Real-time updates across components
- Automatic UI synchronization

### Error Handling
- User-friendly error messages
- API error catching and display
- Form validation feedback
- Success notifications

## Development Notes

- **Standalone Components**: This project uses Angular's standalone component architecture
- **TypeScript**: Strict mode enabled for type safety
- **RxJS**: Observable patterns for reactive programming
- **SCSS**: Component-scoped styling with global variables

## Troubleshooting

### Common Issues

**Map not displaying:**
- Ensure ArcGIS API key is valid (if required)
- Check browser console for errors
- Verify internet connection for map tiles

**API connection errors:**
- Verify backend is running on the correct URL
- Check CORS configuration on backend
- Ensure SSL certificate is valid (for HTTPS)

**Authentication issues:**
- Clear browser localStorage
- Check token expiration
- Verify backend authentication endpoint

## Future Enhancements

- Offline map caching
- Advanced search filters (by description, coordinates range)
- Export locations to CSV/JSON
- Import bulk locations
- User roles and permissions
- Location categories and icons
- Distance measurements
- Route planning

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Author**: [Shahenda]  
**Contact**: [shahendakhaled267@gmail.com]  
**Repository**: [[GitHub URL](https://github.com/shahenda23/angular-map-asset-manager.git)]  
**Documentation**: For backend setup instructions, see the backend repository README.