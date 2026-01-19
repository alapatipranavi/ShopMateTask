import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Plus, X, Save, Wand2, Camera } from 'lucide-react';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
    const [imageFile, setImageFile] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        image: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    /* =========================
       FETCH PRODUCTS
    ========================== */
    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    /* =========================
       AI TEXT DESCRIPTION
    ========================== */
    const generateDescription = async () => {
        if (!formData.name && !formData.category) {
            alert('Please enter product name or category first');
            return;
        }

        setIsGeneratingDescription(true);

        try {
            const response = await axios.post(
                'http://localhost:3001/api/products/generate-description',
                {
                    name: formData.name,
                    category: formData.category
                }
            );

            setFormData(prev => ({
                ...prev,
                description: response.data.description
            }));
        } catch (error) {
            console.error('Error generating description:', error);
            alert('Failed to generate description');
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    /* =========================
       IMAGE CHANGE HANDLER
    ========================== */
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    image: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    /* =========================
       AI IMAGE → PRODUCT DETAILS
    ========================== */
    const generateDetailsFromImage = async () => {
        if (!imageFile) {
            alert('Please upload an image first');
            return;
        }

        setIsGeneratingFromImage(true);

        const data = new FormData();
        data.append('image', imageFile);

        try {
            console.log('Generating details from image...');
            const response = await axios.post(
                'http://localhost:3001/api/products/generate-details-from-image',
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            const { name, description, category } = response.data.data;

            setFormData(prev => ({
                ...prev,
                name,
                description,
                category
            }));
        } catch (error) {
            console.error('Error generating details:', error);
            alert('Failed to generate details from image');
        } finally {
            setIsGeneratingFromImage(false);
        }
    };

    /* =========================
       CREATE / UPDATE PRODUCT
    ========================== */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await axios.put(
                    `http://localhost:3001/api/products/${editingProduct._id}`,
                    formData
                );
            } else {
                await axios.post(
                    'http://localhost:3001/api/products',
                    formData
                );
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            setImageFile(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                category: '',
                stock: '',
                image: ''
            });

            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:3001/api/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            image: product.image
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setImageFile(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            stock: '',
            image: ''
        });
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={openAddModal}
                    className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={20} /> Add Product
                </button>
            </div>

            {/* PRODUCTS TABLE */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">Product</th>
                            <th className="px-6 py-3 text-left">Category</th>
                            <th className="px-6 py-3 text-left">Price</th>
                            <th className="px-6 py-3 text-left">Stock</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product._id}>
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <img
                                        src={product.image || 'https://via.placeholder.com/40'}
                                        className="h-10 w-10 rounded-full object-cover"
                                        alt=""
                                    />
                                    {product.name}
                                </td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4">${product.price}</td>
                                <td className="px-6 py-4">{product.stock}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openEditModal(product)} className="mr-3">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(product._id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex justify-between">
                                <h2 className="text-lg font-semibold">
                                    {editingProduct ? 'Edit Product' : 'Add Product'}
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)}>
                                    <X />
                                </button>
                            </div>

                            {/* IMAGE UPLOAD */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">Image</label>
                                    {imageFile && (
                                        <button
                                            type="button"
                                            onClick={generateDetailsFromImage}
                                            disabled={isGeneratingFromImage}
                                            className="text-xs text-indigo-600 flex items-center gap-1"
                                        >
                                            <Camera size={14} />
                                            {isGeneratingFromImage ? 'Analyzing...' : 'Snap & Sell'}
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full border px-3 py-2 rounded"
                                />
                            </div>

                            <input
                                placeholder="Name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border px-3 py-2 rounded"
                            />

                            <button
                                type="button"
                                onClick={generateDescription}
                                disabled={isGeneratingDescription}
                                className="text-sm text-indigo-600 flex items-center gap-1"
                            >
                                <Wand2 size={14} />
                                {isGeneratingDescription ? 'Generating...' : 'Generate with AI'}
                            </button>

                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full border px-3 py-2 rounded"
                            />

                            <input
                                type="number"
                                placeholder="Price"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                className="w-full border px-3 py-2 rounded"
                            />

                            <input
                                type="number"
                                placeholder="Stock"
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                className="w-full border px-3 py-2 rounded"
                            />

                            <input
                                placeholder="Category"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full border px-3 py-2 rounded"
                            />

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="border px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-black text-white px-4 py-2 rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
    
};

export default AdminDashboard;
