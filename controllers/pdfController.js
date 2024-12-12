const fs = require('fs');
const path = require('path');
const PDFKit = require('pdfkit');
const axios = require('axios');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const mongoose = require("mongoose");

const generatePDF = async (req, res) => {
    const { proId } = req.params;

    try {
        const product = await Product.findById(proId).populate('user'); 
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


        doc.fontSize(20).text('Product Details', { align: 'center' });
        doc.moveDown();
        doc.fontSize(15).text(`Product ID: ${product._id}`);
        doc.text(`Name: ${product.name}`);
        doc.text(`Quantity: ${product.quantity}`);
        doc.text(`Price: ${product.price}`);
        if (product.image) {
            doc.text(`Image URL: ${product.image}`);
            const imagePath = path.join(__dirname, '../uploads', product.image); 
            const isImageLocal = fs.existsSync(imagePath);

            if (isImageLocal) {
                doc.image(imagePath, { fit: [250, 250], align: 'center', valign: 'top' });
            } else {
                try {
                    const response = await axios.get(product.image, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(response.data, 'binary');
                    doc.image(imageBuffer, { fit: [250, 250], align: 'center', valign: 'top' });
                } catch (error) {
                    console.log('Error fetching remote image:', error.message);
                }
            }
        }
        doc.moveDown();

        if (product.user) {
            doc.fontSize(18).text('Added By (User)', { underline: true });
            doc.moveDown();
            doc.fontSize(15).text(`User ID: ${product.user._id}`);
            doc.text(`Name: ${product.user.name}`);
            doc.text(`Email: ${product.user.email}`);
        } else {
            doc.fontSize(15).text('No user associated with this product.');
        }

        doc.end();

        writeStream.on('finish', () => {
            const pdfURL = `${req.protocol}://${req.get('host')}/pdfs/${fileName}`;
            res.status(200).json({ message: 'PDF generated successfully', pdfURL });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
};

module.exports = { generatePDF };

