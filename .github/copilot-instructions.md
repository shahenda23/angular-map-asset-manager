# GeoAssetSystem AI Agent Instructions

## Project Overview

**GeoAssetSystem** is an Angular 21 standalone component application with ArcGIS map integration for managing geographic asset locations. The system implements client authentication and communicates with a .NET backend API for CRUD operations on asset locations.

### Tech Stack
- **Frontend**: Angular 21 (standalone components, signals)
- **Styling**: SCSS with Prettier formatting (100 char line width)
- **Maps**: ArcGIS Core 4.34.8
- **Testing**: Vitest 4.0.8
- **HTTP**: Angular HttpClient with token-based auth
- **State**: RxJS observables with BehaviorSubject pattern

## Architecture

### Data Flow Architecture
```
User (Login/Register) → AuthService → localStorage (token)
                                    ↓
                              LocationService (BehaviorSubject)
                                    ↓
                    MapComponent + AssetManagerComponent
                                    ↓
                            .NET Backend API
```

### Key Components & Boundaries

**Authentication Layer** ([src/app/guards/auth.guard.ts](src/app/guards/auth.guard.ts), [src/app/services/auth.service.ts](src/app/services/auth.service.ts))
- Token-based auth stored in localStorage
- Guard protects `/map` route; redirects unauthenticated users to login
- AuthService handles login, register, logout, and token retrieval
- No auth interceptor: **tokens manually added to headers** in each service call

**Location Service** ([src/app/services/location.service.ts](src/app/services/location.service.ts))
- Central state manager using `BehaviorSubject<AssetLocation[]>`
- Loads initial locations in constructor
- All CRUD operations update the subject, triggering reactive updates
- Manual header management pattern: tokens retrieved via `localStorage.getItem('token')`
- **Pattern**: Service methods return Observable + call `locationsSubject.next()` in `tap()` operator

**Route Structure** ([src/app/app.routes.ts](src/app/app.routes.ts))
- `/` → LoginComponent
- `/register` → RegisterComponent  
- `/map` → MapComponent (guarded by authGuard)
- `**` → redirects to root

### Data Model

**AssetLocation** ([src/app/models/location.model.ts](src/app/models/location.model.ts))
```typescript
interface AssetLocation {
  id?: number;           // undefined for new locations
  name: string;
  latitude: number;      // Range: -90 to 90
  longitude: number;     // Range: -180 to 180
  description?: string;
}
```

## Critical Developer Workflows

### Running the Application
```bash
npm start                    # Start dev server on http://localhost:4200
ng build                     # Production build
ng build --watch             # Watch mode
npm test                     # Run Vitest test suite
```

### API Integration
- **Base URL**: `https://localhost:44322/api` (from [src/environments/environment.ts](src/environments/environment.ts))
- **Endpoints**: 
  - POST `/Account/login` → returns `{ token: string }`
  - POST `/Account/register` → user creation
  - GET/POST/PUT/DELETE `/Locations` → asset management
- **Auth**: Bearer token in `Authorization` header (manual in each request)

### Adding Features
1. **New Component**: `ng generate component components/my-component`
   - Sets `style: scss` automatically (configured in angular.json)
   - Uses standalone component pattern with explicit imports
2. **Observable Updates**: Trigger `locationService.locations$` subscription updates via `tap()` operator
3. **Form Validation**: Use `ReactiveFormsModule`, custom validators (see [src/app/components/asset-manager/asset-manager.ts](src/app/components/asset-manager/asset-manager.ts) lines 10-24 for latitude/longitude validators)

## Project-Specific Patterns

### Reactive State Management (BehaviorSubject Pattern)
**Example**: LocationService uses `BehaviorSubject` exposed as public Observable:
```typescript
private locationsSubject = new BehaviorSubject<AssetLocation[]>([]);
public locations$ = this.locationsSubject.asObservable();

// After API call, always update subject:
return this.http.post(...).pipe(
  tap(newLocation => {
    const current = this.locationsSubject.value;
    this.locationsSubject.next([...current, newLocation]);
  })
);
```
- **Rule**: When creating new features that consume locations, subscribe to `locations$` in templates with async pipe or in components with `subscribe()`

### Manual Token Management
- No HTTP interceptor present; **every service call must manually add auth header**
- Token retrieval pattern (LocationService):
  ```typescript
  const token = localStorage.getItem('token');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(url, { headers });
  ```
- **When extending**: Replicate this pattern for any new API calls

### Standalone Components & Signals
- All components use `standalone: true` with explicit `imports: []`
- RootApp uses `signal()` for title (src/app/app.ts)
- **Rule**: No NgModule files; import dependencies directly in component decorators

### Form Validation Patterns
- Custom validators are pure functions returning `ValidationErrors | null`
- Applied directly to FormControl in [AssetManagerComponent](src/app/components/asset-manager/asset-manager.ts)
- Latitude/longitude validators check range bounds and NaN

### Dialog/Modal Components
- [ConfirmationDialogComponent](src/app/components/confirmation-dialog/confirmation-dialog.ts) and [AddPointDialogComponent](src/app/components/add-point-dialog/add-point-dialog.ts) are reusable
- Use `@ViewChild()` + template ref pattern for programmatic control
- Emit events via `@Output() EventEmitter` for parent communication

## Integration Points & Cross-Component Communication

1. **MapComponent** ↔ **AssetManagerComponent**
   - MapComponent injects AssetManagerComponent with `@ViewChild()`
   - AssetManager emits `onLocationSelect` when user picks an asset
   - MapComponent calls `zoomTo()` and highlights selected location

2. **NavbarComponent** ↔ **AuthService**
   - NavbarComponent exposes logout button
   - Calls `onLogout()` which triggers `authService.logout()`
   - Logout clears token and redirects to `/`

3. **LocationService** ↔ All Consuming Components
   - Multiple components subscribe to `locations$`
   - Any CRUD operation in service immediately propagates to all subscribers

## Testing Approach

- Test files use `.spec.ts` suffix in parallel directories (e.g., [src/app/components/asset-manager/asset-manager.spec.ts](src/app/components/asset-manager/asset-manager.spec.ts))
- Vitest is configured; run with `npm test`
- Test runner: jsdom (configured in package.json devDependencies)

## Code Style & Formatting

- **Prettier config** (package.json): 100 char line width, single quotes, SCSS support
- **Component style**: SCSS by default (angular.json config)
- **Naming**: camelCase for properties/methods, PascalCase for classes/components
- **Imports**: Sort in order: Angular → services → models → other

## Common Gotchas

1. **Forget Auth Headers**: API calls fail silently if Bearer token not added
2. **Manual BehaviorSubject Updates**: UI won't update unless `tap()` calls `locationsSubject.next()`
3. **Environment API URL**: Uses `https://localhost:44322/api` (hardcoded in environment.ts) — must match backend
4. **Route Guards**: Only `/map` is guarded; other routes accessible without auth
5. **ArcGIS Container**: MapComponent requires a div with template ref `#mapViewNode` for initialization

---

*Last updated: January 2026 | Angular 21, Vitest framework*
