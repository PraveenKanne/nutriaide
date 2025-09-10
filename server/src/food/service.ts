// server/src/food/service.ts
import fetch from 'node-fetch';
import type { FoodItem } from '@prisma/client';
import { prisma } from '../index';

type OFFProduct = {
  product?: {
    product_name?: string;
    brands?: string;
    categories?: string;
    nutriscore_grade?: string;
    ingredients_text?: string;
    ingredients?: { id?: string; text?: string; vegan?: string; vegetarian?: string; percent_estimate?: number }[];
    allergens_tags?: string[];
    additives_tags?: string[];
    nutriments?: Record<string, any>;
  };
  status?: number;
};

export async function getOrCreateByBarcode(code: string) {
  const existing = await prisma.foodItem.findUnique({ where: { barcode: code } });
  if (existing) return existing;

  const resp = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
  const data = (await resp.json()) as OFFProduct;

  if (!data.product) throw new Error('Not found in Open Food Facts');

  const p = data.product;
  const name = p.product_name || 'Unknown';
  const brand = p.brands?.split(',')[0]?.trim();
  const ingredients = p.ingredients?.map(i => i.text?.trim()).filter(Boolean) ?? parseIngredients(p.ingredients_text);
  const additives = (p.additives_tags ?? []).map(a => a.replace('en:', '').toUpperCase());
  const allergens = (p.allergens_tags ?? []).map(a => a.replace('en:', ''));
  const nutrients = extractNutrients(p.nutriments);
  const processingLevel = p.nutriscore_grade ? `nutriscore:${p.nutriscore_grade.toUpperCase()}` : undefined;

  const shelfLife = estimateShelfLife(name, brand, ingredients);

  const item = await prisma.foodItem.create({
    data: {
      barcode: code,
      name,
      brand,
      category: p.categories?.split(',')?.[0]?.trim(),
      servingUnit: 'g',
      servingValue: 100,
      nutrients,
      ingredients,
      additives,
      allergens,
      shelfLife,
      processingLevel
    }
  });
  return item;
}

function parseIngredients(text?: string) {
  if (!text) return [];
  return text.split(/[.,;\n]/).map(s => s.trim()).filter(Boolean);
}

function extractNutrients(n: Record<string, any> = {}) {
  const pick = (k: string) => Number(n[k]) || undefined;
  return {
    energy: pick('energy-kcal_100g') ?? pick('energy_100g'),
    protein: pick('proteins_100g'),
    fat: pick('fat_100g'),
    satFat: pick('saturated-fat_100g'),
    carbs: pick('carbohydrates_100g'),
    sugar: pick('sugars_100g'),
    fiber: pick('fiber_100g'),
    sodium: pick('sodium_100g') ?? (n['salt_100g'] ? Number(n['salt_100g']) * 400 : undefined)
  };
}

function estimateShelfLife(name?: string, brand?: string, ingredients: string[] = []) {
  const lower = (s?: string) => (s || '').toLowerCase();
  const n = lower(name);
  const isBread = /bread|loaf|bun/.test(n);
  const isMilk = /milk|dairy/.test(n);
  const isChips = /chips|crisps|snack/.test(n);
  if (isBread) return { unopened: '5–7 days', opened: '3–4 days', storage: 'Cool, dry; refrigerate in hot weather' };
  if (isMilk) return { unopened: '5–10 days (pasteurized)', opened: '3–4 days', storage: 'Refrigerate at 4–5°C' };
  if (isChips) return { unopened: '2–3 months', opened: '3–5 days', storage: 'Seal tightly; cool, dry place' };
  const hasPreserv = ingredients.some(i => /sorbate|benzoate|nitrite|sulfite|preserv/i.test(i));
  return hasPreserv
    ? { unopened: '1–3 months', opened: '3–7 days', storage: 'Cool, dry; refrigerate after opening if perishable' }
    : { unopened: '3–7 days', opened: '1–3 days', storage: 'Refrigerate airtight' };
}

export function evaluateProsCons(f: FoodItem) {
  const n = f.nutrients as any;
  const pros: string[] = [];
  const cons: string[] = [];
  if (n.fiber && n.fiber >= 3) pros.push('Good source of fiber');
  if (n.protein && n.protein >= 8) pros.push('High protein per 100g');
  if (n.sugar && n.sugar >= 10) cons.push('High sugar');
  if (n.sodium && n.sodium >= 400) cons.push('High sodium');
  if ((f.additives || []).length) cons.push('Contains additives');
  return { pros, cons };
}

export function cuisineIdeas(f: FoodItem, prefs: { cuisines: string[]; allergies: string[] }) {
  const ideas = [
    { cuisine: 'Indian', prep: 'Tandoor/grill with yogurt-spice marinade', swap: 'Use hung curd instead of cream' },
    { cuisine: 'Mediterranean', prep: 'Bake with olive oil, herbs, lemon', swap: 'Choose whole grains' },
    { cuisine: 'East Asian', prep: 'Steam or stir-fry with minimal oil', swap: 'Low-sodium soy/tamari' },
    { cuisine: 'Latin American', prep: 'Grilled with salsa/beans/brown rice', swap: 'Corn or whole-wheat tortillas' }
  ];
  const allergens = (f.allergens || []).map(a => a.toLowerCase());
  return ideas.filter(() => true).filter(i => !prefs.allergies.some(a => allergens.includes(a.toLowerCase())));
}
