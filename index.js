import { DiscountApplicationStrategy } from "../generated/api";
// Use JSDoc annotations for type safety
/**
* @typedef {import("../generated/api").InputQuery} InputQuery
* @typedef {import("../generated/api").FunctionResult} FunctionResult
* @typedef {import("../generated/api").Target} Target
* @typedef {import("../generated/api").ProductVariant} ProductVariant
*/
/**
* @type {FunctionResult}
*/
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

export default (input) => {
  console.log("Input data:", JSON.stringify(input));

  const { cart } = input;
  if (!cart.buyerIdentity) {
    console.error("Unauthorized access: cart.buyerIdentity is missing.");
    return EMPTY_DISCOUNT;
  }
  const { customer } = cart.buyerIdentity;

  
  if (!customer || customer.hasAnyTag !== true){
    // Return an empty discount if the customer is not a VIP
    console.error("Unauthorized access: customer is not a VIP.");
    return EMPTY_DISCOUNT;
  }

  const targets = cart.lines
    .filter(line => line.quantity >= 1 && line.merchandise.__typename == "ProductVariant")
    .map(line => {
      const variant = line.merchandise;
      return {
        productVariant: {
          id: variant.id,
        },
      };
    });

  if (!targets.length) {
    console.error("No cart lines qualify for volume discount.");
    return EMPTY_DISCOUNT;
  }

  return {
    discounts: [
      {
        targets,
        value: {
          percentage: {
            value: "50.0",
          },
        },
      },
    ],
    discountApplicationStrategy: DiscountApplicationStrategy.First,
  };
};
