const { S3Client, GetObjectCommand , PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require("multer");
const multerS3 = require("multer-s3");
const { EMAIL, PASSWORD } = process.env;
const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// // configure AWS SDK
// aws.config.update({
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   region: process.env.AWS_BUCKET_REGION,
// });

// // create S3 instance
// const s3 = new aws.S3();
// // configure multer middleware to upload image to S3

const s3 = new S3Client({
  endpoint: 'https://s3.us-east-005.backblazeb2.com', // Example endpoint, update with yours
  forcePathStyle: false,
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Use your environment variables here
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


const upload = async (req, res, next) => {
  try {
    const file = req.files.image; // Assuming you're using an appropriate middleware like express-fileupload
    const folder = req?.route?.path === '/productCategory' ? 'categories/' : 'products/';
    const filePath = folder + Date.now().toString() + '-' + file.name;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filePath,
      Body: file.data, // file.data contains the file buffer
      ContentType: file.mimetype, // Set the correct content type
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    // Manually attach the file information to the `req` object
    req.file = {
      key: filePath, // The key is the path in S3
      url: `https://soulpizza-bucket.s3.us-east-005.backblazeb2.com/${filePath}`, // Construct the URL to access the file
    };

    next(); // Proceed to the next middleware
  } catch (err) {
    console.error('Error uploading image to S3:', err);
    res.status(500).send({ error: 'Error uploading image' });
  }
};


const uploadPdf = async (req, res, next) => {
  try {
    const file = req.files.pdf; // Assuming you're using an appropriate middleware like express-fileupload
    const filePath = 'menu/' + Date.now().toString() + '-' + file.name;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filePath,
      Body: file.data, // file.data contains the file buffer
      ACL: 'public-read',
      ContentType: file.mimetype, // Set the correct content type
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    req.file = {
      key: filePath, // The key is the path in S3
      url: `https://soulpizza-bucket.s3.us-east-005.backblazeb2.com/${filePath}`, // Construct the URL to access the file
    };

    next(); 
  } catch (err) {
    console.error('Error uploading PDF to S3:', err);
    res.status(500).send({ error: 'Error uploading PDF' });
  }
};

// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_BUCKET_NAME,
//     acl: "public-read",
//     key: function (req, file, cb) {
//       const folder =
//         req?.route?.path === "/productCategory" ? "categories/" : "products/";
//       cb(null, folder + Date.now().toString() + "-" + file.originalname);
//     },
//   }),
// }).single("image");

// const uploadPdf = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_BUCKET_NAME,
//     acl: "public-read",
//     key: function (req, file, cb) {
//       const folder = "menu/";
//       cb(null, folder + Date.now().toString() + "-" + file.originalname);
//     },
//   }),
// }).single("pdf");

const getImage = async (bucket, imagePath) => {
  // console.log(bucket ,  imagePath)
  const params = {
    Bucket: bucket,
    Key: imagePath,
  };

  try {
    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 7 * 24 * 60 * 60 });
    return signedUrl;
  } catch (error) {
    console.error('Error fetching signed URL for image', error);
    throw error;
  }
};

// Step 4: Function to get signed URL for PDF
const getPdf = async (bucket, pdfPath) => {
  const params = {
    Bucket: bucket,
    Key: pdfPath,
    ResponseContentType: 'application/pdf',
  };

  try {
    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 7 * 24 * 60 * 60 });
    return signedUrl;
  } catch (error) {
    console.error('Error fetching signed URL for PDF', error);
    throw error;
  }
};

// const getImage = (bucket, imagePath) => {
//   // console.log({bucket, imagePath});
//   return new Promise((resolve, reject) => {
//     var params = {
//       Bucket: bucket,
//       Key: imagePath,
//       Expires: 7 * 24 * 60 * 60,
//     };
//     s3.getSignedUrl("getObject", params, function (error, data) {
//       if (data) {
//         resolve(data);
//       }
//     });
//   });
// };

// const getPdf = (bucket, pdfPath) => {
//   // console.log({bucket, imagePath});
//   return new Promise((resolve, reject) => {
//     var params = {
//       Bucket: bucket,
//       Key: pdfPath,
//       ResponseContentType: "application/pdf",
//       Expires: 7 * 24 * 60 * 60,
//     };
//     s3.getSignedUrl("getObject", params, function (error, data) {
//       if (data) {
//         resolve(data);
//       }
//     });
//   });
// };

const getOffsetAndLimit = (query) => {
  const page = +query?.page || 1;
  const limit = +query?.limit || 10;
  const offset = (page - 1) * limit;

  return { limit, offset, page };
};

const transporter = nodemailer.createTransport({
  service: "gmail", // e.g., 'gmail'
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

const moment = require('moment');
const sendOrderConfirmationEmail = async (
  to,
  subject,
  { orderData, orderItems , id }
  
) => {
  try {
    // Ensure pickup_time is parsed to a moment object
   
    const formattedPickupTime = moment(orderData.pickup_time).isValid()
        ? moment(orderData.pickup_time).format("DD/MM/YYYY, h:mm a")
        : 'Invalid pickup time';

    console.log(`Formatted Pickup Time: ${formattedPickupTime}`);
    // Use formattedPickupTime where necessary
    orderData.pickup_time = formattedPickupTime;
} catch (error) {
    console.error('Error formatting pickup time:', error);
}

let deliveryAddressSection = '';
    if (orderData.address) {
      deliveryAddressSection = `
        <tr>
          <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">
            <p style="font-weight: 800;">Delivery Address</p>
            <p>${orderData.address}</p>
          </td>
        </tr>
      `;
    }

  const itemsTable =`
  <table width="100%" cellpadding="0" cellspacing="0" >
  
    <tr>
      <td width="50%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; 
        font-size: 16px; font-weight: 800; line-height: 24px; padding: 15px 10px 5px 10px;">
        Item
      </td>
      <td width="25%" align="right" style="font-family: Open Sans, Helvetica, Arial, sans-serif; 
        font-size: 16px; font-weight: 800; line-height: 24px; padding: 15px 10px 5px 10px;">
       Quantity
      </td>
      <td width="25%" align="right" style="font-family: Open Sans, Helvetica, Arial, sans-serif; 
        font-size: 16px; font-weight: 800; line-height: 24px; padding: 15px 10px 5px 10px;">
        Price
      </td>
    </tr>
    ${orderItems
      .map(
        (item) => `
        <tr>
          <td width="50%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; 
            font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
            ${item.name}
          </td>
          <td width="25%" align="right" style="font-family: Open Sans, Helvetica, Arial, sans-serif; 
            font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
            ${item.quantity}
          </td>
          <td width="25%" align="right" style="font-family: Open Sans, Helvetica, Arial, sans-serif; 
            font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
            $${item.price}
          </td>
        </tr>
        `
      )
      .join('')}
  </table>
`;

  const template = `<!DOCTYPE html>
<html>
<head>
<title></title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<style type="text/css">
body,
table,
td,
a {
-webkit-text-size-adjust: 100%;
-ms-text-size-adjust: 100%;
}
table,
td {
mso-table-lspace: 0pt;
mso-table-rspace: 0pt;
}
img {
-ms-interpolation-mode: bicubic;
}
img {
border: 0;
height: auto;
line-height: 100%;
outline: none;
text-decoration: none;
}
table {
border-collapse: collapse !important;
}
body {
height: 100% !important;
margin: 0 !important;
padding: 0 !important;
width: 100% !important;
}
a[x-apple-data-detectors] {
color: inherit !important;
text-decoration: none !important;
font-size: inherit !important;
font-family: inherit !important;
font-weight: inherit !important;
line-height: inherit !important;
}
@media screen and (max-width: 480px) {
.mobile-hide {
display: none !important;
}
.mobile-center {
text-align: center !important;
}
}
div[style*="margin: 16px 0;"] {
margin: 0 !important;
}
</style>
<body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">
<div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
For what reason would it be advisable for me to think about business content? That might be little bit risky to have crew member like them.
</div>
<table border="0" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
<tr>
<td align="center" valign="top" style="font-size:0; padding: 35px;" bgcolor="#ec643c">
<div style="display:inline-block; max-width:50%; min-width:100px; vertical-align:top; width:100%;">
<table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
<tr>
<td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 36px; font-weight: 800; line-height: 48px;" class="mobile-center">
<h1 style="font-size: 20px; font-weight: 800; margin: 0; color: #ffffff;">Soul Pizaa</h1>
</td>
</tr>
</table>
</div>
<div style="display:inline-block; max-width:100%; min-width:100px; vertical-align:top; width:100%;" class="mobile-hide">
<table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
<tr>
<td align="right" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; line-height: 48px;">
<table cellspacing="0" cellpadding="0" border="0" align="right">
<tr>
<td style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400;">
</td>
<td style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 24px;"> <a href="https://soulpizza.co.nz/" target="_blank" style="color: #ffffff; text-decoration: none;"><img src="https://soulpizza.co.nz/static/media/Soul_pizza_logo.60b6ee38fe5710f0b0cd.png" width="70" height="70" style="display: block; border: 0px;" /></a> </td>
</tr>
</table>
</td>
</tr>
</table>
</div>
</td>
</tr>

<tr>
<td align="left" style="padding-top: 20px;">
<table cellspacing="0" cellpadding="0" border="0" width="100%">
<tr >
<td width="70%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px 10px 0px 10px; width:100%";> Order Id </td>
 <td width="10%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px 10px 0px 10px;"></td>
<td  width="20%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px 10px 0px 10px;"> ${id} </td>
</tr>
<tr >
<td width="70%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 0px 10px 0px 10px; width:100%";> Customer Name  </td>
 <td width="10%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 0px 10px 0px 10px;"></td>
<td  width="20%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 0px 10px 0px 10px;"> ${orderData?.customer_name} </td>

</tr>
<tr >
<td width="70%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 0px 10px 0px 10px; width:100%";> Order Type </td>
 <td width="10%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 0px 10px 0px 10px; "></td>
<td  width="20%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 0px 10px 0px 10px; "> ${orderData.type.charAt(0).toUpperCase() + orderData.type.slice(1)} </td>

</tr>
<tr >
<td width="70%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 0px 10px 10px 10px; border-bottom: 3px solid #000; width:100%";> Payment Type  </td>
 <td width="10%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 0px 10px 10px 10px; border-bottom: 3px solid #000;"></td>
<td  width="20%" align="right" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 0px 10px 10px 10px; border-bottom: 3px solid #000;">  ${orderData.payment_type === 'COD' ? 'Un-Paid' : orderData.payment_type === 'Online' ? 'Paid' : orderData.payment_type} </td>

</tr>

${itemsTable}
                    <tr>
                      <td width="50%" align="left" 
                        style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; 
                        font-weight: 400; line-height: 24px; padding: 5px 10px;">
                        Tax
                      </td>
                       <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; 
        font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
      </td>
                      <td width="25%" align="right" 
                        style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; 
                        font-weight: 400; line-height: 24px; padding: 5px 10px;">
                        $${orderData.tax}
                      </td>
                    </tr>
</table>
</td>
</tr>
<tr>
<td align="left" style="padding-top: 20px;">
<table cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #000; border-bottom: 3px solid #000;"> TOTAL </td>
<td width="25%" align="right" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #000; border-bottom: 3px solid #000;"> $${orderData.amount} </td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
<tr>
<td align="center" height="100%" valign="top" width="100%" style= "background-color: #ffffff;" bgcolor="#ffffff">
<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px;">
<tr>
<td align="center" valign="top" style="font-size:0;">
<div style="display:inline-block; max-width:100%; min-width:240px; vertical-align:top; width:100%;">
${deliveryAddressSection}
</div>
<div style="display:inline-block; max-width:100%; min-width:240px; vertical-align:top; width:100%;">
<table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
<tr>
<td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">
<p style="font-weight: 800;">Estimated Delivery Date</p>
<p>${orderData.pickup_time}</p>
</td>
</tr>
</table>
</div>
</td>
</tr>
</table>
</td>
</tr>
<!--<tr>-->
<!--<td align="center" style=" padding: 35px; background-color: #ff7361;" bgcolor="#1b9ba3">-->
<!--<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">-->
<!--<tr>-->
<!--<td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">-->
<!--<h2 style="font-size: 24px; font-weight: 800; line-height: 30px; color: #ffffff; margin: 0;"> Get 30% off your next order. </h2>-->
<!--</td>-->
<!--</tr>-->
<!--<tr>-->
<!--<td align="center" style="padding: 25px 0 15px 0;">-->
<!--<table border="0" cellspacing="0" cellpadding="0">-->
<!--<tr>-->
<!--<td align="center" style="border-radius: 5px;" bgcolor="#66b3b7"> <a href="#" target="_blank" style="font-size: 18px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; background-color: #F44336; padding: 15px 30px; border: 1px solid #F44336; display: block;">Shop Again</a> </td>-->
<!--</tr>-->
<!--</table>-->
<!--</td>-->
<!--</tr>-->
<!--</table>-->
<!--</td>-->
<!--</tr>-->
<!--<tr>-->
<!--<td align="center" style="padding: 35px; background-color: #ffffff;" bgcolor="#ffffff">-->
<!--<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">-->
<!--<tr>-->
<!--<td align="center"> <img src="logo-footer.png" width="37" height="37" style="display: block; border: 0px;" /> </td>-->
<!--</tr>-->
<!--<tr>-->
<!--<td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; padding: 5px 0 10px 0;">-->
<!--<p style="font-size: 14px; font-weight: 800; line-height: 18px; color: #333333;"> 675 Parko Avenue<br> LA, CA 02232 </p>-->
<!--</td>-->
<!--</tr>-->
<!--<tr>-->
<!--<td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px;">-->
<!--<p style="font-size: 14px; font-weight: 400; line-height: 20px; color: #777777;"> If you didn't create an account using this email address, please ignore this email or <a href="#" target="_blank" style="color: #777777;">unsusbscribe</a>. </p>-->
<!--</td>-->
<!--</tr>-->
<!--</table>-->
<!--</td>-->
<!--</tr>-->
</table>
</td>
</tr>
</table>
</body>
</html> `;

  const mailOptions = {
    from: EMAIL,
    to,
    subject,
    html:template,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Error sending email: " + error.message);
  }
};


const contactUsMail = async (name, email, phoneNumber, message) => {
  const tp = nodemailer.createTransport({
    service: 'gmail', // or any other email service
    auth: {
      user: EMAIL,
      pass: PASSWORD
    }
  });

  const mailOptions = {
    from: EMAIL,
    to: "connectsoulpizza@gmail.com", // Your receiving email address
    subject: `New Contact Us Request from ${name}`,
    text: `You have received a new message from ${name} (${email}, Phone: ${phoneNumber}):\n\n${message}`,
  };

  // Send the email
  await tp.sendMail(mailOptions);
};

const createCheckoutSession = async (lineItems, successUrl, cancelUrl , deliveryCharge , coupon) => {
  console.log(lineItems , "createCheck")
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // You can add other payment methods like 'alipay' or 'paypal'
      line_items: lineItems,
      mode: "payment", // Mode can be 'payment', 'setup', or 'subscription'
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: deliveryCharge*100,
              currency: 'usd',
            },
            display_name: 'Charges',
            // delivery_estimate: {
            //   minimum: {
            //     unit: 'business_day',
            //     value: 1,
            //   },
            //   maximum: {
            //     unit: 'business_day',
            //     value: 1,
            //   },
            // },
          },
        },
      ],
      discounts: [{
        coupon: coupon.id,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      
    });
    return session; // Return the session object to the caller
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

const createDiscount = async (percentage , couponCode) => {
  await stripe.coupons.del(couponCode);
   try {
    const coupon = await stripe.coupons.create({
      duration: 'repeating',
      id: couponCode,
      percent_off: percentage,
      duration_in_months: 6,
    });
    return coupon
   } catch (error) {
      throw error
   }
};
const calculateTax = async (tax) => {
  try {
    // Ensure you have initialized your Stripe instance properly before this call
    const taxRate = await stripe.taxRates.create({
      display_name: 'GST',
      inclusive: true,  // Set to true if GST should be included in the price
      percentage: tax,    // Must be a number, not a string
      country: 'NZ',
      jurisdiction: 'NZ',
      description: 'New Zealand GST',
    });
    
    console.log('Tax rate created successfully:', taxRate); // For debugging purposes
    return taxRate; // Return the tax rate object to the caller
  } catch (error) {
    console.error("Error creating Stripe tax rate:", error.message); // Log the specific error message
    throw error; // Re-throw the error to handle it in the calling function
  }
};




module.exports = {
  getOffsetAndLimit,
  upload,
  getImage,
  uploadPdf,
  getPdf,
  sendOrderConfirmationEmail,
  contactUsMail,
  createCheckoutSession,
  calculateTax,
  createDiscount
};
