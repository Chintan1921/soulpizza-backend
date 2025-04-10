const CartItem = require("../../models/cartItem"); // Import your models
const Product = require("../../models/product"); // Import your models
const Store = require("../../models/store"); // Import your models
const Transaction = require("../../models/transaction"); // Import your models
const {
  createCheckoutSession,
  calculateTax,
  createDiscount,
} = require("../../lib/helper");
const couponCode = "SOULPIZZA";

const billing = async (req, res, next) => {
  const { id, deliveryType, coupon } = req.body; // Get session ID
  console.log("Delivery Type", deliveryType);
  //from client

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
      return res.status(400).json({ error: "No items in the cart." });
    }

    const lineItems = [];
    const store = cartItems[0].store; // Get the store information
    const country = store.country; // Extract the country from the store
    console.log(cartItems[0].store.tax, "Tax");
    let totalAmount = 0; // Initialize total amount
    let totalTax = 0; // Initialize total tax

    // Prepare line items for Stripe
    for (const item of cartItems) {
      const product = item.product;
      let comboDealItems = [];
      if (item.comboItems && item.comboItems.length > 0) {
        // Fetch details of combo products if needed
        const comboProducts = await Product.findAll({
          where: { id: item.comboItems },
        });
        comboDealItems = [...comboProducts];
      }
      item.product.dataValues.comboDealItems = comboDealItems;
      let premiumCount = comboDealItems.filter(
        (element) => element.dataValues.sub_category === "PREMIUM"
      ).length;
      console.log(product.dataValues, "Product");

      const category = product?.productCategory?.name; // Assuming product has a relation to productCategory
      let unitPrice = 0;

      // Calculate the base price based on country and product category
      const priceExist = product.price.some((p) => {
        if (p.country === country) {
          // Use the country from the store
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
          item.ingrediants.custom.forEach((ingrediantId) => {
            const ingredient = product.ingrediants.find(
              (i) => i.id === ingrediantId
            );
            if (ingredient) {
              unitPrice += ingredient.price;
            }
          });
        }
      }

      const itemTax = await calculateTax(store.tax);
      if (premiumCount > 0) {
        // console.log("this has premium pizza", premiumCount);
        unitPrice += premiumCount * 2;
      }
      const itemTotal = unitPrice * item.quantity;
      lineItems.push({
        price_data: {
          currency: "nzd", // Change according to your currency
          product_data: {
            name: product.name,
          },
          unit_amount: unitPrice * 100, // Amount in cents
        },
        quantity: item.quantity,
        // tax_rates: [itemTax["id"]],
      });

      totalAmount += itemTotal;
    }

    // Add store-specific delivery charges and taxes
    let deliveryCharge = null;
    if (deliveryType === "DELIVERY") {
      deliveryCharge = store.delivery_charge || 5; // Set delivery charge if applicable
      totalAmount += deliveryCharge;
    }
    //       orderData.amount = total;
    // orderData.tax = totalAmount - totalAmount / ((store.tax + 100) / 100);

    // Calculate tax based on your criteria
    totalTax = totalAmount - totalAmount / ((store.tax + 100) / 100);
    // totalAmount += totalTax;

    // console.log(totalTax, totalAmount, store.tax, ">>>>>>>>>");

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

    console.log(lineItems[lineItems.length - 1], "Total");

    // Step 2: Create a transaction record in your database
    // const successUrl = `http://localhost:3001/order-paced?order_type=${deliveryType}&transaction_id={CHECKOUT_SESSION_ID}`;
    // const cancelUrl = "http://localhost:3001/cart";
    const successUrl = `https://soulpizza.co.nz/order-paced?order_type=${deliveryType}&transaction_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = "https://soulpizza.co.nz/cart";

    // const couponData = await createDiscount(10, coupon);
    // console.log(couponData);

    const session = await createCheckoutSession(
      lineItems,
      successUrl,
      cancelUrl,
      deliveryCharge,
      req.user.id
    );
    await Transaction.create({
      user_id: req.user.id,
      transaction_id: session.id,
      status: "pending", // Set status as pending initially
      amount: totalAmount, // Set total amount including tax and delivery charges
    });

    // Step 4: Respond with session ID
    console.log("Session", session);
    res.status(200).json({ id: session.id });
  } catch (error) {
    next(error);
  }
};

const validateCoupon = async (req, res, next) => {
  const { coupon } = req.body;
  try {
    if (coupon != couponCode) {
      res.status(401).json({ isValid: false, message: "Invalid coupon code" });
      return;
    }

    // const currentDate = new Date();
    // if (coupon.expiryDate < currentDate) {
    //   return { isValid: false, message: 'Coupon code has expired' };
    // }

    // if (!coupon.isActive) {
    //   return { isValid: false, message: 'Coupon code is inactive' };
    // }

    res.status(200).json({
      isValid: true,
      message: "Coupon code is valid",
      coupon,
      discount: 10, // Return the discount amount if it exists
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  billing,
  validateCoupon,
};
