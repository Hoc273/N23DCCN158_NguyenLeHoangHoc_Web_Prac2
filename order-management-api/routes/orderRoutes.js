const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const sendSuccess = (res, statusCode, data, message) => {
    return res.status(statusCode).json({
        success: true,
        data,
        message
    });
};

const sendError = (res, statusCode, message) => {
    return res.status(statusCode).json({
        success: false,
        data: null,
        message
    });
};

const calculateItemsTotal = (items) => {
    if (!Array.isArray(items)) return NaN;
    return items.reduce((sum, item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        return sum + (quantity * unitPrice);
    }, 0);
};

const isValidTotalAmount = (items, totalAmount) => {
    const calculatedTotal = calculateItemsTotal(items);
    const providedTotal = Number(totalAmount);

    if (Number.isNaN(calculatedTotal) || Number.isNaN(providedTotal)) {
        return false;
    }

    return Math.abs(calculatedTotal - providedTotal) < 1e-9;
};

// 1. Lay toan bo don hang (GET /api/orders)
router.get('/', async (req, res) => {
    try {
        const query = {};
        const sortOrder = req.query.sort;
        let sortQuery = { createdAt: -1 };

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (sortOrder === 'asc' || sortOrder === 'desc') {
            sortQuery = { totalAmount: sortOrder === 'asc' ? 1 : -1 };
        }

        const orders = await Order.find(query).sort(sortQuery);
        return sendSuccess(res, 200, orders, 'Lay danh sach don hang thanh cong');
    } catch (err) {
        return sendError(res, 500, err.message);
    }
});
// 2. Tim kiem don hang theo ten khach hang (GET /api/orders/search?name=...)
router.get('/search', async (req, res) => {
    try {
        const keyword = req.query.name;

        if (!keyword) {
            return sendError(res, 400, 'Vui long truyen query name de tim kiem');
        }

        const orders = await Order.find({
            customerName: { $regex: keyword, $options: 'i' }
        }).sort({ createdAt: -1 });

        return sendSuccess(res, 200, orders, 'Tim kiem don hang thanh cong');
    } catch (err) {
        return sendError(res, 500, err.message);
    }
});

// 2. Lay don hang theo ID (GET /api/orders/:id)
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return sendError(res, 404, 'Khong tim thay don hang');
        }

        return sendSuccess(res, 200, order, 'Lay don hang thanh cong');
    } catch (err) {
        return sendError(res, 500, err.message);
    }
});
// 3. Tao don hang moi (POST /api/orders)
router.post('/', async (req, res) => {
    if (!isValidTotalAmount(req.body.items, req.body.totalAmount)) {
        return sendError(
            res,
            400,
            'totalAmount khong hop le. Tong tien phai bang tong (quantity x unitPrice) cua tat ca items.'
        );
    }

    const order = new Order({
        customerName: req.body.customerName,
        customerEmail: req.body.customerEmail,
        items: req.body.items,
        totalAmount: req.body.totalAmount
    });

    try {
        const newOrder = await order.save();
        return sendSuccess(res, 201, newOrder, 'Tao don hang thanh cong');
    } catch (err) {
        return sendError(res, 400, err.message);
    }
});
// 4. Cap nhat trang thai don hang (PUT /api/orders/:id)
router.put('/:id', async (req, res) => {
    try {
        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) {
            return sendError(res, 404, 'Khong tim thay don hang');
        }

        const mergedItems = req.body.items !== undefined ? req.body.items : existingOrder.items;
        const mergedTotalAmount = req.body.totalAmount !== undefined
            ? req.body.totalAmount
            : existingOrder.totalAmount;

        if (
            req.body.items !== undefined
            || req.body.totalAmount !== undefined
        ) {
            if (!isValidTotalAmount(mergedItems, mergedTotalAmount)) {
                return sendError(
                    res,
                    400,
                    'totalAmount khong hop le. Tong tien phai bang tong (quantity x unitPrice) cua tat ca items.'
                );
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        return sendSuccess(res, 200, updatedOrder, 'Cap nhat don hang thanh cong');
    } catch (err) {
        return sendError(res, 400, err.message);
    }
});
// 5. Xoa don hang (DELETE /api/orders/:id)
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Order.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return sendError(res, 404, 'Khong tim thay don hang');
        }

        return sendSuccess(res, 200, deleted, 'Da xoa don hang thanh cong!');
    } catch (err) {
        return sendError(res, 500, err.message);
    }
});

module.exports = router;
