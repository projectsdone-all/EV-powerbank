EV ASSIST — on-road EV charging & roadside help (Bengaluru)
===========================================================

Frontend-only app (React + Vite + Tailwind). No backend server or database needed:
accounts, vehicles and bookings are stored in the browser, and every role works on
the same data in that browser — book as a customer, dispatch as the manager,
complete as the executive, and watch it update live.

LOGINS (also shown as one-tap buttons on the Login page)
  Admin      admin@evassist.in       Admin@123     users, passwords, reports, dispatch
  Manager    manager@evassist.in     Manager@123   dispatch board, assign executives
  Executive  executive@evassist.in   Exec@123      Rahul K — accept and complete jobs
             vikram@evassist.in      Exec@123
             pradeep@evassist.in     Exec@123
  Customer   user@evassist.in        User@123      Tejaraj — vehicles, booking, tracking
             meera@evassist.in       User@123
Customers can also log in with their 10-digit mobile number.
New customers sign up from "Create Account". Admin can add staff, change roles,
set anyone's password, disable or delete accounts, and restore the demo data.
Everyone can change their own password (Profile / My account).

FLOW
  Customer requests help -> nearest free executive is auto-assigned
  (if none is free, it waits on the Manager's dispatch board to be assigned)
  -> executive: Start trip -> Arrived -> Start service -> Complete (UPI/Cash/Card)
  -> customer sees every step live, can cancel before service starts, and rate after.

RUN
  npm install
  npm run dev

DEPLOY (Vercel)
  Push to GitHub, import in Vercel (framework: Vite). No environment variables needed.

Note: data lives in each browser's storage, so different devices have separate data.
