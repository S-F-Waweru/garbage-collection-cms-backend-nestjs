# Garbage Collection CMS - Module Use Cases

## User & Role Management

- Register new user (admin only) - `POST /auth/register`
- User login - `POST /auth/login`
- Refresh JWT token - `POST /auth/refresh`
- Get user profile - `GET /users/profile`
- List all users - `GET /users`
- Update user role - `PUT /users/:id/role`
- Update user details - `PUT /users/:id`
- Delete/deactivate user - `DELETE /users/:id`

---

## Client Management

- Create new client - `POST /clients`
- Update client details - `PUT /clients/:id`
- Deactivate client - `PATCH /clients/:id/deactivate`
- Reactivate client - `PATCH /clients/:id/reactivate`
- Get client by ID - `GET /clients/:id`
- List all clients (with pagination) - `GET /clients`
- Search clients by name/ID/unit - `GET /clients/search`
- Filter clients by location/status - `GET /clients?location=&status=`
- View client history - `GET /clients/:id/history`
- Get client units count - `GET /clients/:id/units`

---

## Billing & Payments

- Generate invoice for single client - `POST /invoices/generate`
- Auto-generate invoices for all due clients (cron) - `POST /invoices/generate-all`
- Get invoice by ID - `GET /invoices/:id`
- List invoices by client - `GET /invoices/client/:clientId`
- List all invoices (with filters) - `GET /invoices`
- Record payment - `POST /payments`
- Apply payment to oldest invoice - (handled automatically in payment logic)
- Handle partial payments - (handled automatically in payment logic)
- Store excess payment as client credit - (handled automatically in payment logic)
- Apply client credit to new invoice - (handled automatically in invoice generation)
- Get payment by ID - `GET /payments/:id`
- List payments by client - `GET /payments/client/:clientId`
- List all payments (with filters) - `GET /payments`
- Get client outstanding balance - `GET /clients/:id/outstanding`
- Get client credit balance - `GET /clients/:id/credit`
- Update invoice status - `PATCH /invoices/:id/status`
- Get next sequential invoice number - (handled automatically in invoice generation)

---

## Expenses & Petty Cash

- Record new expense - `POST /expenses`
- Update expense - `PUT /expenses/:id`
- Delete/archive expense - `DELETE /expenses/:id`
- Get expense by ID - `GET /expenses/:id`
- List all expenses (with filters) - `GET /expenses`
- Filter expenses by category - `GET /expenses?category=`
- Filter expenses by date range - `GET /expenses?startDate=&endDate=`
- Get current petty cash balance - `GET /petty-cash/balance`
- Get petty cash history - `GET /petty-cash/history`
- Add funds to petty cash - `POST /petty-cash/add-funds`
- Calculate total expenses by category - `GET /expenses/total-by-category`
- Get expenses by user who entered - `GET /expenses?enteredBy=`

---

## Other Income

- Record new income entry - `POST /other-income`
- Update income entry - `PUT /other-income/:id`
- Delete income entry - `DELETE /other-income/:id`
- Get income by ID - `GET /other-income/:id`
- List all income entries (with filters) - `GET /other-income`
- Filter income by source - `GET /other-income?source=`
- Filter income by date range - `GET /other-income?startDate=&endDate=`
- Calculate total income by source - `GET /other-income/total-by-source`
- Get income aggregation summary - `GET /other-income/summary`

---

## Reporting

- Generate outstanding balance report - `GET /reports/outstanding-balances`
- Generate revenue report (by client) - `GET /reports/revenue?groupBy=client`
- Generate revenue report (by location) - `GET /reports/revenue?groupBy=location`
- Generate petty cash summary report - `GET /reports/petty-cash`
- Generate other income report - `GET /reports/other-income`
- Filter reports by date range - (query params: `?startDate=&endDate=`)
- Filter reports by client - (query params: `?clientId=`)
- Export report to Excel - `GET /reports/export/:reportType`
- Get report summary statistics - `GET /reports/summary`

---

## Locations

- Create new location (City/Region) - `POST /locations`
- Update location - `PUT /locations/:id`
- Delete location - `DELETE /locations/:id`
- Get location by ID - `GET /locations/:id`
- List all locations - `GET /locations`
- Get clients by location - `GET /locations/:id/clients`
- Get location statistics (client count, revenue) - `GET /locations/:id/statistics`

---

**Total Use Cases: 77**  
**Total Endpoints: 68**
