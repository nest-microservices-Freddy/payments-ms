import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  STRIPE_SECRET: string;
  SUCCESS_URL: string;
  CANCEL_URL: string;
  STRIPE_ENDPOINT_SECRET: string;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required(),
    SUCCESS_URL: joi.string().required(),
    CANCEL_URL: joi.string().required(),
    STRIPE_ENDPOINT_SECRET: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) throw new Error(`Config validation error ${error.message}`);

const envsVars: EnvVars = value;

export const envs = {
  port: envsVars.PORT,
  stripeSecret: envsVars.STRIPE_SECRET,
  successUrl: envsVars.SUCCESS_URL,
  cancelUrl: envsVars.CANCEL_URL,
  stripeEndpointSecret: envsVars.STRIPE_ENDPOINT_SECRET,
};
