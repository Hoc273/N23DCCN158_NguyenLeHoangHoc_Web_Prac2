# Order Management API Lab

Dự án backend quản lý đơn hàng sử dụng Node.js, Express và MongoDB (Mongoose).

## Tác giả

- Nguyễn Lê Hoàng Học - N23DCCN158

## Trạng thái hiện tại

- Đã deploy thành công lên Render.com
- Hỗ trợ CRUD đơn hàng
- Validation totalAmount theo tổng quantity x unitPrice
- Response chuẩn hóa theo mẫu:
  - success: true/false
  - data: dữ liệu hoặc null
  - message: thông báo
- Logging request với morgan (dev)
- Filter theo status
- Search theo tên khách hàng
- Sort theo totalAmount

## Deploy (Render)

Bạn đã deploy thành công trên Render.

Nếu cần cập nhật tài liệu để demo, thêm URL service của bạn vào đây:
- Production base URL: https://<your-render-service>.onrender.com

## Cấu trúc thư mục

- order-management-api/
  - server.js
  - models/Order.js
  - routes/orderRoutes.js
  - package.json

## Cài đặt và chạy local

1. Di chuyển vào thư mục API:
   - cd order-management-api
2. Cài dependency:
   - npm install
3. Tạo file .env với biến:
   - MONGO_URI=<your_mongodb_connection_string>
   - PORT=5000
4. Chạy server development:
   - npm run dev
5. Hoặc chạy production mode:
   - npm start

## Base URL

- Local: http://localhost:5000
- Production: https://<your-render-service>.onrender.com

## Định dạng response

Thành công:
{
  "success": true,
  "data": {},
  "message": "..."
}

Thất bại:
{
  "success": false,
  "data": null,
  "message": "..."
}

## API Endpoints

1) Health check
- GET /

2) Lấy danh sách đơn hàng (có filter/sort)
- GET /api/orders
- GET /api/orders?status=pending
- GET /api/orders?sort=asc
- GET /api/orders?sort=desc
- GET /api/orders?status=pending&sort=desc

3) Tìm kiếm theo tên khách hàng
- GET /api/orders/search?name=hoang

4) Lấy chi tiết đơn hàng
- GET /api/orders/:id

5) Tạo đơn hàng mới
- POST /api/orders

Body mẫu:
{
  "customerName": "Nguyen Van A",
  "customerEmail": "a@gmail.com",
  "items": [
    {
      "productName": "Bàn phím",
      "quantity": 2,
      "unitPrice": 300000
    },
    {
      "productName": "Chuột",
      "quantity": 1,
      "unitPrice": 150000
    }
  ],
  "totalAmount": 750000
}

Lưu ý validation:
- totalAmount phải đúng bằng tổng (quantity x unitPrice) của tất cả items.
- Nếu sai, API trả về 400.

6) Cập nhật đơn hàng
- PUT /api/orders/:id

7) Xóa đơn hàng
- DELETE /api/orders/:id

## Status hợp lệ

- pending
- confirmed
- shipped
- delivered
- cancelled

## Công nghệ sử dụng

- express
- mongoose
- cors
- dotenv
- morgan
- nodemon
