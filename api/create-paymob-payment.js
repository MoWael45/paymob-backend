    const axios = require('axios');

    export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { amount, paymentMethod } = req.body || {};
    if (!amount || !paymentMethod) {
        return res.status(400).json({ error: 'Missing amount or paymentMethod' });
    }

    const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY;
    if (!PAYMOB_SECRET_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const CARD_INTEGRATION_ID = 5066065;
    const MOBILE_WALLET_INTEGRATION_ID = 5066086;
    const PAYMOB_API_URL = 'https://accept.paymob.com';

    try {
        const amountCents = Math.round(amount * 100); // Convert to cents if needed
        const integrationId = paymentMethod === 'card' ? CARD_INTEGRATION_ID : MOBILE_WALLET_INTEGRATION_ID;

        const response = await axios.post(`${PAYMOB_API_URL}/v1/intention/`, {
        amount: amountCents,
        currency: 'EGP',
        payment_methods: [integrationId],
        billing_data: {
            first_name: 'Mohamed',
            last_name: 'Wael',
            email: 'uu325717@gmail.com',
            phone_number: '01033785037',
            street: '123 Test Street',
            building: '1',
            city: 'Cairo',
            country: 'EG',
            state: 'Cairo',
        },
        items: [],
        }, {
        headers: {
            'Authorization': `Token ${PAYMOB_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        });

        res.status(200).json({
        client_secret: response.data.client_secret,
        order_id: response.data.intention_order_id,
        });
    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create payment', details: error.message });
    }
    }