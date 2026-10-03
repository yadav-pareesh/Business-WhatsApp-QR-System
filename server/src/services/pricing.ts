import { prisma } from '../db/client';

export interface OrderItemInput {
  productId: string;
  quantity: number;
  selectedVariantOptionIds?: string[];
  selectedAddonIds?: string[];
}

export interface ValidatedOrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  selectedVariants: { groupName: string; optionName: string; priceModifier: number }[];
  selectedAddons: { name: string; price: number }[];
}

export interface OrderCalculationResult {
  isValid: boolean;
  error?: string;
  items: ValidatedOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
}

export async function calculateAuthoritativeOrder(
  businessId: string,
  rawItems: OrderItemInput[],
  isDelivery = false
): Promise<OrderCalculationResult> {
  if (!rawItems || rawItems.length === 0) {
    return {
      isValid: false,
      error: 'Order must contain at least one item.',
      items: [],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      deliveryFee: 0,
      totalAmount: 0,
    };
  }

  // 1. Fetch business rules
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      id: true,
      name: true,
      isTaxEnabled: true,
      taxRate: true,
      deliveryFee: true,
      minOrderAmount: true,
    },
  });

  if (!business) {
    return {
      isValid: false,
      error: 'Business not found.',
      items: [],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      deliveryFee: 0,
      totalAmount: 0,
    };
  }

  // 2. Fetch all products requested in this business
  const productIds = rawItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      businessId,
    },
    include: {
      variantGroups: {
        include: {
          options: true,
        },
      },
      addons: true,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const validatedItems: ValidatedOrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const itemInput of rawItems) {
    // Validate quantity
    const quantity = Math.floor(Number(itemInput.quantity));
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return {
        isValid: false,
        error: `Invalid quantity for product.`,
        items: [],
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        deliveryFee: 0,
        totalAmount: 0,
      };
    }

    if (quantity > 100) {
      return {
        isValid: false,
        error: `Maximum quantity per item is 100.`,
        items: [],
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        deliveryFee: 0,
        totalAmount: 0,
      };
    }

    const product = productMap.get(itemInput.productId);
    if (!product) {
      return {
        isValid: false,
        error: `Product no longer exists.`,
        items: [],
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        deliveryFee: 0,
        totalAmount: 0,
      };
    }

    if (!product.isAvailable) {
      return {
        isValid: false,
        error: `"${product.name}" is currently sold out or unavailable.`,
        items: [],
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        deliveryFee: 0,
        totalAmount: 0,
      };
    }

    let unitPrice = product.price;
    const selectedVariants: { groupName: string; optionName: string; priceModifier: number }[] = [];
    const selectedAddons: { name: string; price: number }[] = [];

    // Validate Variants
    if (itemInput.selectedVariantOptionIds && itemInput.selectedVariantOptionIds.length > 0) {
      for (const optId of itemInput.selectedVariantOptionIds) {
        let foundOpt = false;
        for (const group of product.variantGroups) {
          const opt = group.options.find((o) => o.id === optId);
          if (opt) {
            if (!opt.isAvailable) {
              return {
                isValid: false,
                error: `Option "${opt.name}" for "${product.name}" is unavailable.`,
                items: [],
                subtotal: 0,
                taxRate: 0,
                taxAmount: 0,
                deliveryFee: 0,
                totalAmount: 0,
              };
            }
            unitPrice += opt.priceModifier;
            selectedVariants.push({
              groupName: group.name,
              optionName: opt.name,
              priceModifier: opt.priceModifier,
            });
            foundOpt = true;
            break;
          }
        }
        if (!foundOpt) {
          return {
            isValid: false,
            error: `Invalid variant option selected for "${product.name}".`,
            items: [],
            subtotal: 0,
            taxRate: 0,
            taxAmount: 0,
            deliveryFee: 0,
            totalAmount: 0,
          };
        }
      }
    }

    // Validate required variant groups
    for (const group of product.variantGroups) {
      if (group.required) {
        const hasChoice = selectedVariants.some((v) => v.groupName === group.name);
        if (!hasChoice) {
          return {
            isValid: false,
            error: `Please select an option for "${group.name}" in "${product.name}".`,
            items: [],
            subtotal: 0,
            taxRate: 0,
            taxAmount: 0,
            deliveryFee: 0,
            totalAmount: 0,
          };
        }
      }
    }

    // Validate Add-ons
    if (itemInput.selectedAddonIds && itemInput.selectedAddonIds.length > 0) {
      for (const addonId of itemInput.selectedAddonIds) {
        const addon = product.addons.find((a) => a.id === addonId);
        if (!addon) {
          return {
            isValid: false,
            error: `Invalid add-on selected for "${product.name}".`,
            items: [],
            subtotal: 0,
            taxRate: 0,
            taxAmount: 0,
            deliveryFee: 0,
            totalAmount: 0,
          };
        }
        if (!addon.isAvailable) {
          return {
            isValid: false,
            error: `Add-on "${addon.name}" is unavailable.`,
            items: [],
            subtotal: 0,
            taxRate: 0,
            taxAmount: 0,
            deliveryFee: 0,
            totalAmount: 0,
          };
        }
        unitPrice += addon.price;
        selectedAddons.push({
          name: addon.name,
          price: addon.price,
        });
      }
    }

    const itemTotalPrice = unitPrice * quantity;
    calculatedSubtotal += itemTotalPrice;

    validatedItems.push({
      productId: product.id,
      productName: product.name,
      unitPrice,
      quantity,
      totalPrice: itemTotalPrice,
      selectedVariants,
      selectedAddons,
    });
  }

  // Minimum order amount check
  if (business.minOrderAmount > 0 && calculatedSubtotal < business.minOrderAmount) {
    return {
      isValid: false,
      error: `Minimum order amount is ₹${business.minOrderAmount}. Current subtotal is ₹${calculatedSubtotal}.`,
      items: [],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      deliveryFee: 0,
      totalAmount: 0,
    };
  }

  // Calculate Tax & Delivery
  const taxRate = business.isTaxEnabled ? business.taxRate : 0;
  const taxAmount = business.isTaxEnabled ? Math.round((calculatedSubtotal * taxRate) / 100) : 0;
  const deliveryFee = isDelivery ? business.deliveryFee : 0;
  const totalAmount = calculatedSubtotal + taxAmount + deliveryFee;

  return {
    isValid: true,
    items: validatedItems,
    subtotal: calculatedSubtotal,
    taxRate,
    taxAmount,
    deliveryFee,
    totalAmount,
  };
}
