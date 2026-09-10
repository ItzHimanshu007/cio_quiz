# BFSI 2030 — Implementation & Verification Tasks

## Phase A — Backend Fixes
- [x] `lib/event-server.ts` — remove hardcoded LIVE_SESSION_ID, add getActiveSession()
- [x] `/api/live/route.ts` — dynamic session lookup by ?sessionId or first LIVE session
- [x] `/api/attendance/route.ts` — rate limiting before code validation & duplicate prevention
- [x] `/api/feedback/route.ts` — remove relevance field, remove feedback_open gate
- [x] `/api/admin/session-control/route.ts` — support action-based open/close with status transitions
- [x] `/api/admin/sessions/route.ts` — support session creation with name, number, start/end time, status
- [x] `/api/admin/draw/route.ts` — cryptographic tie-break draw with GET history & unblocked re-runs
- [x] `/api/admin/export/route.ts` — export tied participants to CSV and Excel XLSX
- [x] `/api/admin/analytics/route.ts` — per-session analytics endpoint
- [x] `/api/admin/leaderboard/route.ts` — admin leaderboard with mobile numbers & tie detection

## Phase B — Admin UI Rebuild
- [x] `admin-dashboard.tsx` — Sessions list + per-session controls (Open Attendance, Close Attendance, Generate Code, View Analytics, Make Live)
- [x] `admin-dashboard.tsx` — Session creation form with Name, Number, Start/End Time, and Status
- [x] `admin-dashboard.tsx` — Real admin leaderboard table (Rank/Name/Mobile/Company/Sessions/Points)
- [x] `admin-dashboard.tsx` — Tie detection with finalist cards & export links
- [x] `admin-dashboard.tsx` — Draws panel with drawing animation, winner reveal, and past draw records history table

## Phase C — Attendee Flow
- [x] `components/attendee-flow.tsx` — Collects only Name, Mobile, Company
- [x] `components/attendee-flow.tsx` — Dynamic session loading for any sessionId
- [x] `components/attendee-flow.tsx` — Rating (1-5) + optional remark feedback

## Phase D — LED Screen & Winner Presentation
- [x] `app/led/page.tsx` — Fixed QR + 60s rotating code display with countdown
- [x] `app/leaderboard/page.tsx` — Public leaderboard with auto-refresh (no mobile numbers)
- [x] `app/winner/page.tsx` — Public winner reveal page for announced lucky draw winners

## Phase E — Complete 26-Point E2E Scenario Verification
- [x] 1. Create Session 5.
- [x] 2. Open attendance.
- [x] 3. Generate dynamic 4-digit code.
- [x] 4. Scan session QR.
- [x] 5. Register participant Rahul.
- [x] 6. Enter code.
- [x] 7. Attendance succeeds.
- [x] 8. Rahul receives 10 points.
- [x] 9. Submit 5-star feedback.
- [x] 10. Rahul receives 5 feedback points.
- [x] 11. Leaderboard shows Rahul with 15.
- [x] 12. Create another participant (Priya).
- [x] 13. Repeat attendance / registration.
- [x] 14. Verify rankings update.
- [x] 15. Try using wrong code (`0000`).
- [x] 16. Verify attendance fails.
- [x] 17. Test expired code.
- [x] 18. Verify old code fails with expiration notice.
- [x] 19. Try marking Rahul twice.
- [x] 20. Verify duplicate attendance is rejected (+0 pts, alreadyMarked: true).
- [x] 21. Create a tie (Test User, Amit Verma, Rahul Sharma at 15 pts).
- [x] 22. Verify tie detection on admin dashboard.
- [x] 23. Export tied participants to CSV and Excel XLSX.
- [x] 24. Start lucky draw.
- [x] 25. Verify only tied finalists are eligible to win.
- [x] 26. Verify winner is stored in database and visible to admin.
