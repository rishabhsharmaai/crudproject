const fs = require('fs');
const path = require('path');
const PDFKit = require('pdfkit');
const axios = require('axios');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const jwt=require("jsonwebtoken")

const generatePDF = asyncHandler(async (req, res) => {
    const { proId } = req.params;
    let user
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        user = decode = jwt.decode(token, process.env.JWT_SECRET)
    }

    try {
        const product = await Product.findById(proId).populate('user');
        console.log(product,user)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // if (user.role === 'seller' && String(product.user._id) !== String(user.id)) {
        //     return res.status(403).json({ message: 'Access forbidden: cannot generate PDF for this product' });
        // }

        if (user.role === 'buyer' && (!product.isSold || String(product.buyer?._id) !== String(user.id))) {
            return res.status(403).json({ message: 'Access forbidden: this product is not associated with you' });
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
        
        if (user.role === 'buyer') {
            doc.fontSize(18).text('Your Details (Buyer)', { underline: true });
            doc.moveDown();
            doc.text(`Name: ${user.name}`);
            doc.text(`Email: ${user.email}`);
            doc.text('Your product will be delivered soon.');
        } else if (user.role === 'seller' && product.isSold) {
            doc.fontSize(18).text('Buyer Details', { underline: true });
            doc.moveDown();
            doc.text(`Name: ${product.buyer?.name}`);
            doc.text(`Email: ${product.buyer?.email}`);
        } else {
            doc.fontSize(15).text('Product not sold yet. Still looking for a buyer.');
        }

        doc.end();

        writeStream.on('finish', () => {
            const pdfURL = `${req.protocol}://${req.get('host')}/pdfs/${fileName}`;
            res.status(200).json({ message: 'PDF generated successfully', pdfURL });
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
});

module.exports = { generatePDF };
