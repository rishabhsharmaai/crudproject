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
        const token = req.headers.authorization.split(' ')[1];
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

        doc.fontSize(24).font('Helvetica-Bold').text('Order Summary', { align: 'center', underline: true });
        doc.moveDown(2);

        const detailsTop = doc.y;
        doc.fontSize(12).text(
            `Product ID: ${product._id}\nName: ${product.name}\nQuantity: 1`, 
            50,
            detailsTop
        );

        if ( product.buyer) {
            doc.text(
                `\nBuyer Name: ${product.buyer.name || 'N/A'}\nBuyer Email: ${product.buyer.email || 'N/A'}`,
                300,
                detailsTop
            );
        } else {
            doc.text('\nBuyer details not available.', 300, detailsTop);
        }

        doc.moveDown(2);
        doc.strokeColor('#000').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);

        const paymentSummary = doc.y;
        if (product.image) {
            const imagePath = path.join(__dirname, '../uploads', product.image.split('/uploads/')[1]);
            const isImageLocal = fs.existsSync(imagePath);
        
            try {
                const imageWidth = 200; 
                const totalPosition = paymentSummary + 90; 
                const availableHeight = totalPosition - paymentSummary; 
                const imageHeight = availableHeight > 0 ? availableHeight : 200;
        
                if (isImageLocal) {
                    doc.image(imagePath, 50, paymentSummary, { width: imageWidth, height: imageHeight });
                } else {
                    const response = await axios.get(product.image, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(response.data, 'binary');
                    doc.image(imageBuffer, 50, paymentSummary, { width: imageWidth, height: imageHeight });
                }
            } catch (error) {
                console.log('Error fetching remote image:', error.message);
                doc.text('Image could not be loaded.', 50, paymentSummary);
            }
        }

        doc.text('Payment Details:', 300, paymentSummary, { underline: true });
        doc.text(`Price: ${product.price}`, 300, paymentSummary + 30);

        if (product.price < 10000) {
            doc.text(`Shipping Charges: 100`, 300, paymentSummary + 50);
        } else {
            doc.text(`Shipping Charges: 0`, 300, paymentSummary + 50);
        }

        const total = product.price + (product.price < 10000 ? 100 : 0);
        doc.strokeColor('#000').lineWidth(1).moveTo(300, paymentSummary + 80).lineTo(550, paymentSummary + 80).stroke();
        doc.text(`Total: ${total}`, 300, paymentSummary + 90);

        doc.moveDown(2);
        doc.strokeColor('#000').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);
        doc.text('Thank you for shopping with us. Your product will be delivered soon.', 50, doc.y);

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
