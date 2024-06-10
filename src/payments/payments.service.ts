import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(process.env.STRIPE_SECRET);

  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    try {
      const { currency, items } = paymentSessionDto;

      const lineItems = items.map((item) => ({
        price_data: {
          currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      const session = await this.stripe.checkout.sessions.create({
        // colocar aca el id de mi orden
        payment_intent_data: {},
        line_items: lineItems,
        mode: 'payment',
        success_url: 'http://localhost:3003/payments/success',
        cancel_url: 'http://localhost:3003/payments/cancel',
      });
      return session;
    } catch (error) {
      console.log('error', error);
    }
  }

  async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event: Stripe.Event;
    const endpointSecret =
      // 'whsec_26c63369fdf66c27401bbe56eeec7e6698de7e2cf0d5d45f8a5ade0f62723113'; //testing
      'whsec_2zAGLaLtfI0iOmB2snXCPOrJUg608MSm'; //prod
    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret,
      );

      switch (event.type) {
        case 'charge.succeeded': {
          // llamar microservicio
          console.log(event);
          break;
        }
        // case 'payment_intent.succeeded': {
        //   const paymentIntent = event.data.object as Stripe.PaymentIntent;
        //   console.log('payment_intent.succeeded', { paymentIntent });
        //   break;
        // }
        default: {
          console.log(`Unhandled event type ${event.type}`);
          break;
        }
      }
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    return res.status(200).json({ sig });
  }
}
