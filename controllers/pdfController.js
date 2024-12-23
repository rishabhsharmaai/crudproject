const asyncHandler = require('express-async-handler');
const PDFKit = require('pdfkit');
const axios = require('axios');
const Product = require('../models/productModel');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const generatePDF = asyncHandler(async (req, res) => {
    const { proId } = req.params;
    let user;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        user = jwt.decode(token, process.env.JWT_SECRET);
    }

    try {
        const product = await Product.findById(proId)
            .populate('user')  
            .populate('buyer');  

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const fileName = `${product.name}_product.pdf`;
        const filePath = path.join(__dirname, '../pdfs', fileName);

        const pdfDir = path.dirname(filePath);
        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

        const doc = new PDFKit();
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        if (product.image) {
            const imagePath = path.join(__dirname, '../uploads', product.image.split('/uploads/')[1]);
            const isImageLocal = fs.existsSync(imagePath);

            try {
                if (isImageLocal) {
                    doc.image(imagePath, 400, 50, { width: 150, height: 150 });
                } else {
                    const response = await axios.get(product.image, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(response.data, 'binary');
                    doc.image(imageBuffer, 400, 50, { width: 150, height: 150 });
                }
            } catch (error) {
                console.log('Error fetching remote image:', error.message);
                doc.text('Image could not be loaded.');
            }
        }

        doc.fontSize(20).text('Product Details', { align: 'center' });
        doc.moveDown(3);
        doc.fontSize(15).text(`Product ID: ${product._id}`);
        doc.text(`Name: ${product.name}`);
        doc.text(`Quantity: ${product.quantity}`);
        doc.text(`Price: ${product.price}`);
        doc.moveDown();

        if (product.isSold) {
            if (user.role === 'admin' || user.role === 'seller') {
                if (product.buyer) {
                    doc.fontSize(18).text('Buyer Details', { underline: true });
                    doc.moveDown();
                    doc.text(`Name: ${product.buyer?.name || 'N/A'}`);
                    doc.text(`Email: ${product.buyer?.email || 'N/A'}`);
                } else {
                    doc.text('Buyer information is missing.');
                }
            }

            if (user.role === 'buyer') {
                doc.fontSize(18).text('Your Details (Buyer)', { underline: true });
                doc.moveDown();
                doc.text(`Name: ${product.buyer ? product.buyer.name : 'N/A'}`);
                doc.text(`Email: ${product.buyer ? product.buyer.email : 'N/A'}`);
                doc.text('Your product will be delivered soon.');
            }
        } else {
            if (user.role === 'admin' || user.role === 'seller') {
                doc.fontSize(18).text('Product Not Sold Yet', { underline: true });
                doc.moveDown();
                doc.text('The product is still looking for a buyer.');
            }

            if (user.role === 'buyer') {
                doc.fontSize(18).text('Product Not Sold Yet', { underline: true });
                doc.moveDown();
                doc.text('The product you are trying to buy is not yet sold.');
            }
        }

        doc.end();

        writeStream.on('finish', () => {
            const pdfURL = `${req.protocol}://${req.get('host')}/pdfs/${fileName}`;
            res.status(200).json({ message: 'PDF generated successfully', pdfURL });
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
});

module.exports = { generatePDF };
