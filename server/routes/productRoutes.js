const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    generateDescription,
    generateDetailsFromImage
} = require('../controllers/productController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/')
    .get(getProducts)
    .post(createProduct);

router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

router.post('/generate-description', generateDescription);

router.post(
    '/generate-details-from-image',
    upload.single('image'),
    generateDetailsFromImage
);

module.exports = router;
