# Varevya Telangana Ruchulu - Restaurant Ordering Web Application

A full-stack restaurant ordering system featuring dynamic menus, shopping cart, custom item reviews, secure WhatsApp order notifications, and a complete PhonePe QR payment flow with automated client-side OCR verification.

---

## 🚀 Key Features

* **Interactive Menu & Category Filters**: Customers can filter dishes, select customizations, and view detailed descriptions.
* **Shopping Cart**: Real-time total calculation.
* **Online Payment + OCR Verification**:
  * Unified checkout with QR-code payment display.
  * Drag-and-drop payment screenshot upload.
  * Local browser-based OCR validation (via Tesseract.js) verifying transaction success, UTR matching, and amount compliance.
  * Secure manual UTR input field fallback.
  * Unique transaction/UTR duplicate checks to block reuse.
* **WhatsApp Cloud API Integration**: Delivers structural order text and Cloudinary payment screenshots directly to the restaurant owner.
* **Order Tracking Timeline**: A 6-stage real-time progress tracker showing payment approval, preparation, and ready-for-pickup states.
* **Administrative Portal**: Secure authentication enabling owner actions, image uploads, and payment verification (Approve / Reject with logged reasons).

---

## 🛠️ Tech Stack

* **Frontend**: Vanilla JS, Vite, HTML5, CSS3, FontAwesome.
* **OCR Scanning**: Tesseract.js (Client-side).
* **Backend**: Node.js, Express, Multer, JWT.
* **Database**: MongoDB (Mongoose schemas).
* **Cloud Storage**: Cloudinary (Direct file uploads).
* **Notifications**: Meta WhatsApp Business Cloud API.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory for local dev or add these in Vercel:

```env
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=dasullah1
CLOUDINARY_API_KEY=526377496749222
CLOUDINARY_API_SECRET=1QjQJ6WSX1YlGSVRnnvHIv4HrZs
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_whatsapp_business_account_id
WHATSAPP_RECIPIENT_NUMBER=your_recipient_phone_number
```

---

## 🚀 Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Backend**:
   ```bash
   npm run server
   ```
3. **Start Frontend Client**:
   ```bash
   npm run dev
   ```
4. Access client at **`http://localhost:5173`** and API at **`http://localhost:5000`**.