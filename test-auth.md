# วิธีทดสอบ Authentication Flow

## 1. เปิด Backend Server
```bash
cd /Users/ojobabystar1/Documents/Web\ Developer/HotelApp
bun run dev
```
Expected: Server running on port 3000

## 2. เปิด Frontend Server (Terminal ใหม่)
```bash
cd /Users/ojobabystar1/Documents/Web\ Developer/HotelApp/frontend
bun run dev
```
Expected: Vite dev server on http://localhost:5173

## 3. Test Login Flow

### Step 1: เปิด Browser Console (F12)
- Go to http://localhost:5173/login
- เปิด Console tab

### Step 2: Login
- Email: admin@hotel.com
- Password: admin123
- กด Login

### Step 3: ดู Console Logs
คุณควรเห็น logs ตามลำดับนี้:

```
Login successful: {success: true, data: {...}}
[Auth] User authenticated: {success: true, data: {...}}
```

### หาก Login ไม่ได้

#### Case 1: เห็น Error "401 Unauthorized"
- Token ไม่ถูกส่งไปกับ request
- เช็คว่า localStorage มี accessToken หรือไม่:
  ```javascript
  localStorage.getItem("accessToken")
  ```

#### Case 2: Redirect กลับมา /login
- เช็ค Console จะมี error message
- Possible causes:
  - API /auth/me ไม่ตอบกลับ 200
  - Token expired
  - Backend ไม่ทำงาน

#### Case 3: Network Error
- เช็คว่า Backend server ทำงานอยู่หรือไม่
- เช็ค Network tab ว่ามี CORS error หรือไม่

## 4. Manual API Test (ถ้าข้างบนไม่ work)

ใน Browser Console:
```javascript
// Test 1: Login
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@hotel.com',
    password: 'admin123'
  })
});
const loginData = await loginRes.json();
console.log('Login:', loginData);

// Test 2: Save token
localStorage.setItem('accessToken', loginData.data.accessToken);

// Test 3: Get current user
const meRes = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
const meData = await meRes.json();
console.log('Me:', meData);
```

## Expected Results:
- Login response: `{success: true, data: {user: {...}, accessToken: "...", refreshToken: "..."}}`
- Me response: `{success: true, data: {id: "...", email: "admin@hotel.com", ...}}`
