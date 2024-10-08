const CartItem = require("../../models/cartItem"); // Import your models
const Product = require("../../models/product"); // Import your models
const Store = require("../../models/store"); // Import your models
const Transaction = require("../../models/transaction"); // Import your models
const { createCheckoutSession, calculateTax }= require("../../lib/helper")

const billing = async (req, res, next) => {
    const { id , deliveryType } = req.body; // Get session ID from client

    try {
        const cartItems = await CartItem.findAll({
            where: { user_id: req.user.id }, // Filter by the logged-in user
            include: [
              {
                model: Product,
                as: "product",
                include: ["productCategory", "ingrediants"], // Include ingredients
              },
              {
                model: Store, // Include store to get country
                as: "store", 
              },
            ],
          });
    
          if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: 'No items in the cart.' });
          }
    
          const lineItems = [];
          const store = cartItems[0].store; // Get the store information
          const country = store.country; // Extract the country from the store
          console.log(cartItems[0].store.tax,"Tax")
          let totalAmount = 0; // Initialize total amount
          let totalTax = 0; // Initialize total tax

          // Prepare line items for Stripe
          for (const item of cartItems) {
            const product = item.product;
            const category = product?.productCategory?.name; // Assuming product has a relation to productCategory
            let unitPrice = 0;

            // Calculate the base price based on country and product category
            const priceExist = product.price.some((p) => {
              if (p.country === country) { // Use the country from the store
                unitPrice = parseFloat(
                  category === "Pizza" ? p.price[item.size] : p.price
                );
                return true;
              }
            });

            if (!priceExist || isNaN(unitPrice)) {
              throw new Error("Product price for your country not found.");
            }

            // Add ingredient costs if applicable
            if (category === "Pizza") {
              const glutenFreePrice = store?.gluten_free_price || {};
              if (item.gluten_free) {
                unitPrice += parseFloat(glutenFreePrice[item.size] ?? 0);
              }

              // Add custom ingredients' price
              if (item.ingrediants?.custom?.length > 0) {
                item.ingrediants.custom.forEach(ingrediantId => {
                  const ingredient = product.ingrediants.find(i => i.id === ingrediantId);
                  if (ingredient) {
                    unitPrice += ingredient.price;
                  }
                });
              }
            }

            const itemTax = await calculateTax(store.tax)

            const itemTotal = unitPrice * item.quantity;
            lineItems.push({
              price_data: {
                currency: 'usd', // Change according to your currency
                product_data: {
                  name: product.name,
                },
                unit_amount: unitPrice * 100, // Amount in cents
              },
              quantity: item.quantity,
              tax_rates: [itemTax['id']],
            });

            totalAmount += itemTotal;
          }

          // Add store-specific delivery charges and taxes
          const deliveryCharge = store.delivery_charge || 0; // Set delivery charge if applicable
          totalAmount += deliveryCharge;

    //       orderData.amount = total;
    // orderData.tax = totalAmount - totalAmount / ((store.tax + 100) / 100);

          // Calculate tax based on your criteria
          totalTax = totalAmount - totalAmount / ((store.tax + 100) / 100);
          totalAmount += totalTax; 

          console.log(totalTax , totalAmount , store.tax , ">>>>>>>>>")

          // lineItems.push({
          //   price_data: {
          //     currency: 'usd',
          //     product_data: {
          //       name: 'Delivery Charge',
          //     },
          //     unit_amount: deliveryCharge*100, // Your manual tax amount in cents
          //   },
          //   quantity: 1,
          // })
          // lineItems.push({
          //   price_data: {
          //     currency: 'usd',
          //     product_data: {
          //       name: 'Tax',
          //     },
          //     unit_amount: Math.round(totalTax*100), // Your manual tax amount in cents
          //   },
          //   quantity: 1,
          // })


          console.log(lineItems[lineItems.length-1],"Total")

          // Step 2: Create a transaction record in your database
          const successUrl = `https://soulpizza.co.nz/order-paced?order_type=${deliveryType}`;
          const cancelUrl = 'https://soulpizza.co.nz/cart';

          const session = await createCheckoutSession(lineItems, successUrl, cancelUrl , deliveryCharge);
          await Transaction.create({
            user_id: req.user.id,
            transaction_id: session.id,
            status: 'pending', // Set status as pending initially
            amount: totalAmount, // Set total amount including tax and delivery charges
          });

          // Step 4: Respond with session ID
          res.status(200).json({ id: session.id });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    billing
  };
