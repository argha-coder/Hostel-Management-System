# Best Practices for Scalable MERN Dashboard Apps

To ensure your Hostel Management System remains fast and scalable as user count grows, follow these production-grade patterns.

## 1. Database Indexing (MongoDB)

Indexes are critical for read performance. Run these commands in your MongoDB shell or include them in a migration script.

```javascript
// User Collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "room_id": 1 });

// Room Collection
db.rooms.createIndex({ "room_number": 1 }, { unique: true });
db.rooms.createIndex({ "status": 1 });

// Booking Collection
db.bookings.createIndex({ "student_id": 1 });
db.bookings.createIndex({ "status": 1 });
db.bookings.createIndex({ "payment_status": 1 });

// Fine Collection
db.fines.createIndex({ "student_id": 1 });
db.fines.createIndex({ "status": 1 });

// GatePass Collection
db.gatepasses.createIndex({ "student_id": 1 });
db.gatepasses.createIndex({ "status": 1 });
```

## 2. Backend Optimizations

### Use `.lean()` for Read Operations
By default, Mongoose returns "Hydrated Documents" which have heavy internal state. Using `.lean()` returns plain JS objects, reducing memory and CPU usage by ~5x.

### Connection Pooling
For Vercel/Serverless, always use a cached connection promise (as implemented in `db.js`) to avoid "Too many connections" errors during traffic spikes.

### Aggregation with Limits
When using `.aggregate()`, always filter (`$match`) as early as possible and avoid `$lookup` on large collections without proper indexing.

## 3. Frontend Optimizations

### Chunk Splitting
Group your dependencies into separate chunks. This allows the browser to cache common libraries (like React) while only downloading page-specific code when needed.

### Skeleton States
Instead of a global loading spinner, use component-level skeletons. This improves "Perceived Performance" as users see the layout immediately.

### Memoization
Use `React.memo` for components that render frequently but whose props change rarely (e.g., Sidebar, Navbar, Stat Cards).

## 4. Vercel Deployment Tips

- **Serverless Regions**: Ensure your Vercel deployment region matches your MongoDB Atlas region (e.g., `iad1` for US East).
- **Environment Variables**: Use `NODE_ENV=production` to enable React/Express production optimizations.
- **Cache-Control**: Set `Cache-Control` headers for API responses that don't change often (e.g., Notice Board).

```javascript
res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
```
