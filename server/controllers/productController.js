const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const {
    generateProductDescriptionWithAI,
    generateProductDetailsFromImageWithAI
} = require('../services/aiServices');

const collectionName = 'products';

const getCollection = () => getDB().collection(collectionName);

const getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await getCollection().find(query).toArray();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }

        const product = await getCollection().findOne({ _id: new ObjectId(id) });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, image } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        const newProduct = {
            name,
            description,
            price: Number(price),
            category,
            stock: Number(stock) || 0,
            image: image || '',
            createdAt: new Date()
        };

        const result = await getCollection().insertOne(newProduct);
        const createdProduct = await getCollection().findOne({ _id: result.insertedId });

        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }

        const updates = { ...req.body };
        if (updates.price) updates.price = Number(updates.price);
        if (updates.stock) updates.stock = Number(updates.stock);
        delete updates._id;

        await getCollection().updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        const updated = await getCollection().findOne({ _id: new ObjectId(id) });

        if (!updated) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Product ID' });
        }

        const result = await getCollection().deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const generateDescription = async (req, res) => {
    try {
        const { name, category } = req.body;

        const description = await generateProductDescriptionWithAI(name, category);

        res.json({ description });
    } catch (error) {
        res.status(500).json({
            message: 'Service Error',
            error: error.message
        });
    }
};

const generateDetailsFromImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log("In generateDetailsFromImage", req.file);

        const details = await generateProductDetailsFromImageWithAI(
            req.file.buffer,
            req.file.mimetype
        );

        res.status(200).json({
            success: true,
            data: details
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "This is an error: " + error.message
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    generateDescription,
    generateDetailsFromImage
};
