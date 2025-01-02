const Purchase = require('../models/purchaseModel');

const getSalesData = async (req, res) => {
    try {
        const { month, type } = req.body;

        if (!month || !['highest', 'lowest'].includes(type)) {
            return res.status(400).json({ message: 'Invalid request body. Use month and type (highest/lowest).' });
        }

        const monthNumber = parseInt(month);

        const result = await Purchase.aggregate([
            {
                $project: {
                    purchaseMonth: { $month: "$purchaseDate" },  
                    productId: "$product", 
                }
            },
            {
                $match: {
                    purchaseMonth: monthNumber 
                }
            },
            {
                $group: {
                    _id: "$productId",  
                    totalQuantity: { $sum: 1 }, 
                }
            },
            {
                $sort: { totalQuantity: type === 'highest' ? -1 : 1 },  
            },
            { 
                $limit: 1  
            }
        ]);


        if (result.length === 0) {
            return res.status(404).json({ message: 'No products found for the given month.' });
        }

        return res.status(200).json(result[0]);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};



module.exports = { getSalesData };
