# Frontend ↔ Backend integration

The frontend targets the API described in the backend contract. Configure:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_USE_MOCK=false
```

## Mapping summary

| Frontend | Backend |
|----------|---------|
| `tabitayo_token` | `access_token` from login/register |
| `/e/:slug` | `public_slug` via `GET /public/events/{slug}` |
| Guest search (API mode) | `POST /public/events/{token}/guest-lookup` · fallback `GET .../guests/search?name=` |
| Guest arrival confirm | `PATCH /public/events/{token}/guests/{guest_id}/seat-found` |
| Host sees arrivals | `GET /host/events/{id}/guests` → `seat_confirmation_status`, `seat_confirmed_at` |
| Host events | `GET/POST/PATCH/DELETE /host/events` (DELETE = soft-delete / archive) |
| Menu photo | `POST /host/events/{id}/menu` (multipart `file`), `DELETE .../menu` |
| Guests | `GET/POST/DELETE /host/events/{id}/guests` |
| CSV import | `POST /host/events/{id}/guests/upload-csv` |
| Admin hosts | `GET /admin/users` (role=host) |
| Approve/reject event | `PATCH /admin/payment-submissions/{id}/review` |

## Mock-only (until API exists)

- Activity log
- Photo share upload/moderation
- Admin host approve/suspend
- Client-side fuzzy search + browse-by-table on guest page

See the full contract from the backend repo or `frontend-api-contract.md` in project downloads.
