# CovenX Steering Rules

## Tech Stack
- **Architecture**: MERN Monorepo
- **Backend**: Node.js, Express, TypeScript, Socket.IO
- **Database & Cache**: MongoDB Atlas, Redis Cloud
- **Frontend**: React 19, TypeScript, Vite, Redux Toolkit, Tailwind CSS

## Backend Architecture
Strict **Clean Architecture** layering:
`Controller` -> `Service` -> `Repository` -> `Model`

1. **Controller**: Handles HTTP request parsing, status codes, and delegates to Service. Returns standard API responses.
2. **Service**: Contains core business logic, validation, transaction logic, and delegates to Repository.
3. **Repository**: Data access layer interfacing directly with Mongoose / Redis models. Abstracted via BaseRepository.
4. **Model**: Mongoose schemas and data structures.

## API Response Standard
All HTTP responses from the backend MUST strictly conform to the following schema:

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
}
```

- Success Example: `{ "success": true, "data": { "id": "123", "name": "Contract" }, "error": null }`
- Error Example: `{ "success": false, "data": null, "error": "Unauthorized access" }`

## UI/UX Design System Guidelines
- **Hybrid Theme**:
  - **Light Minimalist Theme**: Applied during Contract Authoring (`/editor`) for high readability, clean typography, and distraction-free writing.
  - **Dark Advanced Theme**: Applied in Analytics & Dashboard views (`/dashboard`) for data visualization, dynamic metrics, and rich UI elements.
