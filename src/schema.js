const { z } = require('zod');

const RATING_MAP = {
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5
};

/**
 * Strict schema for normalized book records
 */
const BookSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty'),
  product_url: z.string().url().startsWith('https://', 'URL must start with https://'),
  price_text: z.string().min(1, 'Raw price text is required'),
  price_gbp: z.number().positive('Price GBP must be a positive number'),
  availability_text: z.string().min(1, 'Availability text is required'),
  in_stock: z.boolean(),
  stock_count: z.number().int().nonnegative().nullable(),
  rating_text: z.string().nullable(),
  rating_numeric: z.number().int().min(1).max(5).nullable(),
  description: z.string().nullable(),
  source_page: z.string().url().startsWith('https://'),
  fetched_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'fetched_at must be a valid ISO timestamp'
  })
});

module.exports = {
  BookSchema,
  RATING_MAP
};
