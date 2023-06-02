export default /**
* @param {InputQuery} input
* @returns {FunctionResult}
*/
  (input) => {
    const { cart } = input;
    const { customer } = cart.buyerIdentity;

    if (!customer || !customer.hasAnyTag('VIP')) {
      // Return an empty discount if the customer is not a VIP
      console.error("Unauthorized access: customer is not a VIP.");
      return EMPTY_DISCOUNT;
    }

    const targets = cart.lines
      // Only include cart lines with a quantity of two or more
      // and a targetable product variant
      .filter(line => line.quantity >= 4 &&
        line.merchandise.__typename == "ProductVariant")
      .map(line => {
        const variant = /** @type {ProductVariant} */ (line.merchandise);
        return /** @type {Target} */ ({
          // Use the variant ID to create a discount target
          productVariant: {
            id: variant.id
          }
        });
      });

    if (!targets.length) {
      // You can use STDERR for debug logs in your function
      console.error("No cart lines qualify for volume discount.");
      return EMPTY_DISCOUNT;
    }

    // The @shopify/shopify_function package applies JSON.stringify() to your function result
    // and writes it to STDOUT
    return {
      discounts: [
        {
          // Apply the discount to the collected targets
          targets,
          // Define a percentage-based discount
          value: {
            percentage: {
              value: "50.0"
            }
          }
        }
      ],
      discountApplicationStrategy: DiscountApplicationStrategy.First
    };
  };