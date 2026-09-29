# Shop Backend

Architecture: Route -> Middleware -> Controller -> Service -> Model.
`resourceController.js` and `resourceRoutes.js` are intentionally removed.

## Install
```bash
npm install
cp .env.example .env
npm run dev
```

## MongoDB
Local:
`mongodb://127.0.0.1:27017/shopdb`

Docker:
```bash
docker compose up -d --build
```

## Seed development accounts
```bash
npm run seed
```
Accounts: admin@gmail.com / 12345678, manager@gmail.com / 12345678, staff@gmail.com / 12345678.
Change these passwords before production.

## API base
`http://192.168.1.198:5000/api`

### Auth
- POST /auth/register
- POST /auth/login
- GET /auth/me
- PATCH /auth/me
- PATCH /auth/change-password
- POST /auth/logout

### Full CRUD resources
- Users: /users
- Addresses: /addresses (owner CRUD), /admin/addresses (admin/manager/staff permission CRUD)
- Brands: /brands
- Categories: /categories
- Products: /products
- Variants: /variants
- Cart: /cart plus /cart/items/:itemId
- Coupons: /coupons
- Notifications: /notifications
- Orders: /orders; admin full CRUD at /admin/orders
- OrderItems: /order-items
- Payments: /payments; admin full CRUD at /admin/payments
- Reviews: /reviews; admin full CRUD at /admin/reviews
- Wishlist: /wishlist plus /wishlist/products/:productId
- News: public list/detail/search/filter at /news; article management at /news and /admin/newsArticles
- News categories: public active list at /news-categories; management at /news-categories and /admin/newsCategories
- Banners: public page-specific list at /banners?page=home; protected management CRUD at /admin/banners

News management requires the matching `newsArticle.*` and `newsCategory.*` permissions. Admin, manager, and staff roles include these permissions.

Seed development storefront content and page banners (idempotent; refuses `NODE_ENV=production`):
```bash
npm run seed:sample
npm run seed:banners
```
This adds sample products/categories and news categories/articles without removing unrelated records.

Every resource has GET collection and GET `/:id` where applicable. List endpoints support pagination where implemented. Responses return the complete stored document; User never returns the password hash.

## Important checkout flow
1. Login.
2. Create address: POST /addresses.
3. Add variant to cart: POST /cart/items with `{ product, variant, quantity }`.
4. Create order: POST /orders with `{ addressId, paymentMethod, couponCode?, note? }`.
5. Create payment: POST /payments with `{ order, amount, provider?, metadata? }` for payment methods that need a payment record.

The server calculates cart/order prices from ProductVariant; clients cannot set cart item price or order total.

## Authentication: Access Token + Refresh Token

- Access token: short-lived JWT (`JWT_ACCESS_EXPIRES_IN`, default `15m`).
- Refresh token: random opaque token stored only as a SHA-256 hash in MongoDB, default lifetime `30` days.
- `POST /api/auth/refresh` rotates the refresh token. The old refresh token is revoked immediately.
- `POST /api/auth/logout` revokes the supplied refresh token. It does not require an access token, so logout still works after the access token expires.
- `POST /api/auth/logout-all` revokes all refresh-token sessions for the current user.
- Changing password revokes all refresh-token sessions.

For Postman, send the refresh token in JSON:

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

Login/register response:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

Use only `accessToken` in `Authorization: Bearer <token>` for protected APIs.
