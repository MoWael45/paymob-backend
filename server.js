const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// استخدمنا الـ Secret Key الجديد
const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY;

// استبدل دول بالـ Integration IDs بتاعك من Paymob Dashboard
const CARD_INTEGRATION_ID = 5066065; // Integration ID بتاع Card
const MOBILE_WALLET_INTEGRATION_ID = 5066086; // Integration ID بتاع Mobile Wallet

// أضف الـ iframe IDs بتاع كل طريقة دفع (من Paymob Dashboard)
const CARD_IFRAME_ID = 916273; // للدفع بـ Card
const MOBILE_WALLET_IFRAME_ID = 916272; // للدفع بـ Mobile Wallet

// الـ Base URL بتاع Paymob API
const PAYMOB_API_URL = 'https://accept.paymob.com';

// Intention API عشان نجيب client_secret
async function createIntention(amount, paymentMethod) {
    try {
        console.log('Creating intention with Paymob...');
        console.log('Using Secret Key:', PAYMOB_SECRET_KEY.substring(0, 10) + '...');
        console.log('Amount (in EGP):', amount);

        // شيلنا الضرب في 100، المبلغ هيجي بالجنيه من التطبيق
        const amountCents = Math.round(amount); // هنا المبلغ بقى 438.90 (جنيه) يتحوّل لـ 439 (قرش تقريبًا)
        console.log('Amount (in cents):', amountCents);

        // حدد الـ integration_id بناءً على طريقة الدفع
        const integrationId = paymentMethod === 'card' ? CARD_INTEGRATION_ID : MOBILE_WALLET_INTEGRATION_ID;

        const response = await axios.post(`${PAYMOB_API_URL}/v1/intention/`, {
        amount: amountCents, // المبلغ بالقرش (Integer)
        currency: 'EGP',
        payment_methods: [integrationId],
        billing_data: {
            first_name: 'Mohamed',
            last_name: 'Wael',
            email: 'uu325717@gmail.com', // حط إيميل حقيقي
            phone_number: '01033785037', // حط رقم تليفون حقيقي
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

        console.log('Intention created successfully!');
        console.log('Client Secret:', response.data.client_secret);
        console.log('Payment Keys:', response.data.payment_keys);

        // حدد الـ iframe_id بناءً على طريقة الدفع
        const iframeId = paymentMethod === 'card' ? CARD_IFRAME_ID : MOBILE_WALLET_IFRAME_ID;

        return {
        client_secret: response.data.client_secret,
        order_id: response.data.intention_order_id,
        iframe_id: iframeId,
        };
    } catch (error) {
        console.error('Intention Creation Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to create intention with Paymob');
    }
    }

    // API Endpoint عشان الأبليكيشن يطلب الدفع
    app.post('/create-paymob-payment', async (req, res) => {
    const { amount, paymentMethod } = req.body;

    try {
        console.log(`Received payment request:`, { amount, paymentMethod });

        // استخدم الـ Intention API لإنشاء الدفع
        const intention = await createIntention(amount, paymentMethod);

        console.log('Payment request processed successfully!');

        res.json({
        client_secret: intention.client_secret,
        order_id: intention.order_id,
        iframe_id: intention.iframe_id,
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Failed to create payment' });
    }
    });

    // ابدأ الـ Server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    });