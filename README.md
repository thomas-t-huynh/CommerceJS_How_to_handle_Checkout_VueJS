Handling Cart Checkout with Commerce.js using Vue.js

This guide will go over the checkout process for an eCommerce site using Commerece.js and Vue.js. The checkout process gives the vendor information on where to deliver the product, and on how they will charge the customer. At the end of the process, an order confirmation is shown to verify the purchase and to summarize details about the order. This guide will instruct you through three main components of the checkout process: delivery form, payment form, and order confirmation.
Commerce.js v2 will be used in this guide.
Live_Demo_link
Overview
This is a continuation of Adding Products to Cart with Commerce.JS using Vue.js by Thomas Huynh.
If you haven’t done so already, create an account so you can access the Chec Dashboard and add products through your dashboard. In this guide, backpacks will be the products used for demonstration.
This guide will cover:
Cloning and installing the base project.
Generating a checkout token to set up form fields
Using the Commerce.js ‘live’ object to dynamically render the order summary
Handling delivery and payment form logic
Capturing a token and then populating the order confirmation
Requirements
IDE Code Editor
NPM or yarn
Vue JS
Bootstrap
Git
Prerequisites
Basic web development knowledge in HTML, CSS, and JS
Some knowledge Single-page application design
Initial Setup
First, visit the base repo page at https://github.com/thomas-t-huynh/CommerceJS_How_to_handle_Checkout_VueJS_BASE
Fork your own repository.

Clone or download the repo. This setup will go down the cloning path so copy the link shown in the popover.

Open a terminal of your choice, find a directory to store your project, and then enter in `git clone clone-url`.
git clone git@github.com:thomas-t-huynh/CommerceJS_How_to_handle_Checkout_VueJS_BASE.git

CD into the directory.
Cd CommerceJS_How_to_handle_Checkout_VueJS_BASE
Run npm install to get all the required modules
Npm install
Run the serve script found in package.json to boot up the local server
Npm run serve
Visit the localhost link shown in your terminal. 

The app should look like this.

 
Access the cloned project directory with your IDE of choice, and get ready to code!
 
 
Project Tutorial
1. Setting up the Checkout Page

Buying a product online requires a large amount of information so it could arrive accurately to your doorstep. The checkout process takes in  a large amount of information that requires specific formatting such as email or country. Thankfully, Commerce.js methods could help us set up some form data for such formattings.
 
Starting off, visit the ‘CartPage.vue`. There should be a method called `pushToCheckoutPage` attached to the checkout button in the template. The method itself is this.
 
CartPage.vue 
pushToCheckoutPage() {
     this.$router.push(`/checkout/${this.cart.id}`);
   }
 
When a user clicks this button, it will send them to the checkout page with the delivery form on it. Passing cart id as a parameter primarily serves to get the checkout token, but it will also persist the checkout process if the page happens to refresh or if the user wants to return to the checkout page.
 
Before you start working on the checkout page, go into `App.vue` and pass down commerce as props into the router-view for the checkout page.
 
App.vue
      <router-view
        ...
        :commerce="commerce"
      />
 
The SDK will be used very often during the checkout process, and it can be completely managed by `CheckoutPage.vue`. This will prevent multiple levels of emitting, and modularize all checkout logic. 
 
In the pages directory, create a file and name it `CheckoutPage.vue`. Copy and paste the code below to quickly get a basic layout.
CheckoutPage.vue
<template>
  <div>
    CheckoutPage
  </div>
</template>
 
<script>
export default {
  name: "CheckoutPage",
  props: {
    commerce: {
      type: Object
    }
  },
  created() {}
};
</script>
 
<style scoped></style>
 
This is a new route that’s not hooked up to the VueRouter yet. Navigate into `main.js`, import in `CheckoutPage.vue`, and add the object containing the new route’s properties.
main.js
	{
      path: "/checkout/:id",
      name: "CheckoutPage",
      component: CheckoutPage,
    }
 
Test the route by clicking the secure checkout button in `CartPage.vue`!
 
Generating checkout token and using Commerce.js services

With the `CheckoutPage.vue` now in place, it’s time to make use of the cart id that was passed through. There will be asynchronous calls with the Commerce.js SDK.
 In `CheckoutPage.vue`, make a `created()` method, and then add this line in it to access the params.

// CheckoutPage.vue
const getCartId = this.$route.params.id;

It’s always a good idea to check objects that are returned so you can find useful properties. Here’s how `this.$route` appears in the console.


 
The following code will be in `created()` because of their asynchronous nature. Using the commerce that was passed down earlier, call `checkout.generatetoken()` with the getCartId const and an object with key-pair value of type and cart respectively.
 
CheckoutPage.vue
    const getCartId = this.$route.params.id;
    this.commerce.checkout
      .generateToken(getCartId, { type: "cart" })
      .then(res => {
        this.checkoutToken = res;
        this.live = res.live;
      })
      .catch(err => console.log(err));
 
This method can be called with a permalink, which is why the type has to be specified. The response from the call is a checkout token that contains its ID used for capturing the token and to access built-in helper functions. Bind the token and the live property of the token to the component’s states.
 

 
The live object holds ‘real-time’ data on the checkout total. Helper functions that check for tax or for available shipping alters the total price of the checkout. The live object is returned when calling the helper functions.

Create default values in the component’s data method to house the states. In addition to that, make properties for countries and states that will come in use very soon.
 
 CheckoutPage.vue
   data() {
    return {
      checkoutToken: {},
      live: undefined,
      countries: {},
      states: {},
    };
  },
 
Now with the checkout token in hand, call two commerce methods `services.localeListCountries(this.checkoutToken.id)` and `services.localeListSubdivisions(“US”)` in the `created()` method.
 
    this.commerce.services
      .localeListCountries(this.checkoutToken.id)
      .then(res => {
        this.countries = { "": "Select a country", ...res.countries };
      })
      .catch(err => console.log(err));
 
    this.commerce.services
      .localeListSubdivisions("US")
      .then(res => {
        this.states = { "": "Select a state", ...res.subdivisions };
      })
      .catch(err => console.log(err));
 
 
The responses should return objects of countries and subdivisions that can be shipped out to the current checkout. The concatenated objects shown above will serve only as display values for users to select a location.
 
2. Creating the delivery form and handling changes

With the state loaded with regional data that the Chec API could understand, it’s time to make the delivery form. With VueJS, the delivery form will emit events on every keystroke, which could lead to a very dynamic form experience for users.
 
Create `DeliveryForm.vue` in the components folder, and then copy and paste this in.
 
DeliveryForm.vue
<template>
  <form name="deliveryForm" @submit="onSubmit">
	Delivery form
  </form>
</template>
 
<script>
export default {
  name: "DeliveryForm",
  props: ["states", "countries"]
};
</script>
 
<style scoped>
</style>
 
The name in the form will be useful later on to detect where the event is firing from. Notice that the `states` and `countries` props are ready to be passed in.
 
Rather than rendering `DeliveryForm.vue` as a component, this guide will introduce nested routes ttps://router.vuejs.org/guide/essentials/nested-routes.html. 
 
Access  the router in `Main.js`, import `DeliveryForm.vue`, and add an additional property named `children` that holds an array of route objects.
 
main.js
{
     path: "/checkout/:id",
     name: "CheckoutPage",
     component: CheckoutPage,
     children: [
       {
         path: "deliveryform",
         component: DeliveryForm
       }
     ]
   }
 
Nested routing allows for rendering of a route within a route itself. This will make the checkout page to be a lot like the `App.vue` page as it will host a router-view tag in its template too.
 
The way to access the child routes is by appending the child’s path at the end of the parent route’s path.
 
"/checkout/:id/deliveryform"
 
This means you will have to change the link in `CartPage.vue`.
 
 CartPage.vue
    this.$router.push(`/checkout/${this.cart.id}/deliveryform`);
 
Now travel back into the `CheckoutPage.vue` and add the router-view component into the template. Bind the `countries` and `states` data states as well.
 
CheckoutPage.vue
<template>
  <div>
    <router-view
      :countries="countries"
      :states="states"
    />
  </div>
</template>
 
The delivery form should now be rendering when you visit the page!
 
The form will need input tags to allow users to enter in their info. Below is a large amount of templating html that is self-explanatory. Copy and paste it into the `DeliveryForm.vue`.
 
DeliveryForm.vue
<h3>Customer</h3>
    <div class="form-group row">
      <label for="checkout-email" class="col-sm-2 col-form-label"
        >Email address</label
      >
      <input
        type="email"
        class="form-control col-sm-10"
        id="checkout-email"
        name="email"
        @change="onChange"
        required
      />
    </div>
    <div class="form-group row">
      <div class="col">
        <label for="checkout-firstname">First name</label>
        <input
          type="text"
          class="form-control"
          name="firstname"
          required
          @change="onChange"
        />
      </div>
      <div class="col">
        <label for="checkout-lastname">Last name</label>
        <input
          type="text"
          class="form-control"
          name="lastname"
          required
          @change="onChange"
        />
      </div>
    </div>
 
    <h3>Delivery</h3>
    <div class="form-group row">
      <label for="checkout-recipient" class="col-sm-2 col-form-label"
        >Recipient Name</label
      >
      <input
        type="text"
        class="form-control col-sm-10"
        id="checkout-recipient"
        name="recipient"
        @change="onChange"
        required
      />
    </div>
    <div class="form-group row">
      <label for="checkout-street" class="col-sm-2 col-form-label"
        >Street Address</label
      >
      <input
        type="text"
        class="form-control col-sm-10"
        id="checkout-street"
        name="street"
        @change="onChange"
        required
      />
    </div>
    <div class="form-group row">
      <label for="checkout-optionalAddress" class="col-sm-2 col-form-label"
        >Apt, Suite, etc. (Optional)</label
      >
      <input
        type="text"
        class="form-control col-sm-10"
        id="checkout-optionalAddress"
        name="optionalAddress"
        @change="onChange"
      />
    </div>
    <div class="form-group row">
      <label for="checkout-town_city" class="col-sm-2 col-form-label">Town/City</label>
      <input
        type="text"
        class="form-control col-sm-10"
        id="checkout-town_city"
        name="town_city"
        @change="onChange"
        required
      />
    </div>
    <div class="form-group row">
      <label for="checkout-zip_code" class="col-sm-2 col-form-label"
        >Zip Code</label
      >
      <input
        type="text"
        class="form-control col-sm-10"
        id="checkout-zip_code"
        name="zip_code"
        @change="onChange"
        required
      />
    </div>
    <div class="form-group row">
      <label for="checkout-states" class="col-sm-2 col-form-label">State</label>
      <select
        class="form-control col-sm-10"
        id="checkout-states"
        name="state"
        @change="onChange"
        :disabled="disableStates"
        required
      >
        <option
          v-for="(state, i) in Object.keys(states)"
          :value="state"
          :key="i"
        >
          {{ states[state] }}
        </option>
      </select>
    </div>
    <div class="form-group row">
      <label for="checkout-country" class="col-sm-2 col-form-label"
        >Country</label
      >
      <select
        class="form-control col-sm-10"
        id="checkout-country"
        name="country"
        @change="onChange"
        required
      >
        <option
          v-for="(country, i) in Object.keys(countries)"
          :value="country"
          :key="i"
        >
          {{ countries[country] }}
        </option>
      </select>
    </div>
    <div class="form-group row">
      <label for="checkout-number" class="col-sm-2 col-form-label"
        >Phone Number</label
      >
      <input
        type="text"
        class="form-control col-sm-10"
        id="checkout-number"
        name="number"
        @change="onChange"
        required
      />
    </div>
    <h5 v-if="shippingMethods.length > 0">Shipping Method</h5>
    <div v-for="method in shippingMethods" :key="method.id" class="form-check">
      <input
        class="form-check-input"
        type="radio"
        name="shipping_method"
        :value="method.id"
        @change="onShippingChange"
        required
      />
      <label class="form-check-label" for="exampleRadios1">{{
        method.description
      }}</label>
    </div>
    <button class="btn btn-primary">Continue to Payment</button>
There’s a lot of information to take in here, but think of most of them as settings you can change. This guide will go over the important details.
 
Type - Adjusts the input to based on the type of data that’s typed in. Password will hide the characters on the screen with asterisks. In this case, the “email” type will check if the email entered follows proper email format such as having an “@” symbol and a domain name following a “.”
Required - an attribute that will prevent users from submitting data if the field is not filled out.
Name - gives the field a name so it can be referenced in event objects. Useful to fill out the checkout page state later. 
Select - this HTML tag has the same purpose as input because it collects data, but it has a limited range of given selections. This is good for collecting specific data that the software could understand. The option tag contains the selectable inputs.
 
The states and countries input will be using the objects you called with the Commerce.js service methods. The state input ill be used as an example.
 
DeliveryForm.vue
      <select
        class="form-control col-sm-10"
        id="checkout-states"
        name="state"
        @change="onChange"
        :disabled="disableStates"
        required
      >
        <option
          v-for="(state, i) in Object.keys(states)"
          :value="state"
          :key="i"
        >
          {{ states[state] }}
        </option>
      </select>
 
 
The v-for directive iterates through each item in an array. Although States isn’t an array, the `Object.keys()` method takes all the keys of the object passed through and returns it as an array. This allows you to use the keys as values (state codes for Commerce.js SDK) and use the actual values (readable state values) for users to select.
 
The disabled attribute contains a boolean value return from a computed function in the checkout page. It checks if the country is “US” and if it is, it will return true so the states of the US can be selected.
 
CheckoutPage.vue
  computed: {
    disableStates() {
      return this.deliveryForm.country === "US" ? false : true;
    }
  },
 
That being said, pass down that computed value along with the other methods and event handlers listed below.
 
 CheckoutPage.vue
<router-view
      @onChange="handleOnChange"
      @onShippingChange="setShippingMethod"
      @onSubmit="handleOnSubmit"
      :disableStates="disableStates"
      :states="states"
      :countries="countries"
      :shippingMethods="shippingMethods"
    />
  </div>
 
Also, because some of these onChange events will modify the state in the checkout page, make sure to add the states in data.
 
CheckoutPage.vue
  data() {
    return {
      checkoutToken: {},
      live: {},
      countries: {},
      states: {},
      shippingMethods: [],
      deliveryForm: {
        country: ""
      },
    };
  },
 
 
 
Each field has a `@change=”onChange”` event emitter so it can communicate with the parent component `CheckoutPage.vue`. It passes up an event object, which will be used to collect the input’s value. Below are the methods that will handle the onChange events.
 
DeliveryForm.vue
  methods: {
    onChange(e) {
      this.$emit("onChange", e);
    },
    onShippingChange(e) {
      this.$emit("onShippingChange", e.target.value);
    },
    onSubmit(e) {
      this.$emit("onSubmit", e);
    }
  },
  props: ["disableStates", "states", "countries", "shippingMethods"]
 
 
Handling change events

Now you’ll create methods that handle the change events being emitted. FIrst off will be the handler for input changes.
 
   handleOnChange(e) {
      const { form, name, value } = e.target;
      this[form.name][name] = value;
      form.name === "deliveryForm" && this.updateCheckoutSubtotal();
    },
 
 Whenever there’s a change in value in the fields that have `onChange` bound to it, it will find the delivery form state you created earlier via bracket notation. The e parameter passed through is the event object that can be accessed from the onChange attribute. Remember the form name in the `DeliveryPage.vue`?
 
DeliveryForm.vue
  <form name="deliveryForm" @submit="onSubmit">
 
The object contains properties detailing most of the information about the form it came from. Console logging `e` will show you all the information if proper attributes are setted up.
 

 
Next method will be the one inside `handleOnChange()` at the last line, `updateCheckoutSubtotal()`.
 
CheckoutPage.vue   
updateCheckoutSubtotal() {
      if (this.deliveryForm.country) {
        const { country, zip_code, state } = this.deliveryForm;
        if (
          this.deliveryForm.country === "US" &&
          this.deliveryForm.zip_code &&
          this.deliveryForm.state
        ) {
          this.checkShippingAndTax(country, zip_code, state);
        } else {
          this.checkShippingAndTax(country);
        }
      }
    },
 
This method checks if certain fields of the form data contain values. It will activate another function that will use the Commerce.js helper function to grab tax and shipping prices based on the location fields. US locations require additional information to grab tax and shipping prices. This function is called during onChange so it can update the form and order summary in real time. Moving on to `checkShippingAndTax()`.
 
 CheckoutPage.vue
checkShippingAndTax(country, zip_code = "", state = "") {
      this.commerce.checkout
        .setTaxZone(this.checkoutToken.id, {
          postal_zip_code: zip_code,
          country: country,
          region: state
        })
        .then(res => {
          this.live = res.live;
        })
        .catch(err => console.log(err));
 
      this.commerce.checkout
        .getShippingOptions(this.checkoutToken.id, {
          country: country,
          region: state
        })
        .then(res => {
          this.shippingMethods = res;
        })
        .catch(err => {
          console.log(err)
          this.shippingMethods = []
        });
    }
  },
 
This method uses Commerce.js methods to grab updated shipping and tax prices based on user inputted location. A live object will return from the tax setTaxZone call. Assign the live state to it so it can update the order summary later on. The getShippingOptions method will return an array of shipping methods. Assign this to the shippingMethods state so it can be used in the delivery form. The shipping method form will appear and look like this if the given location has shipping options available.
 

 
All the fields in the delivery form use the `onChange()` method, but only the shipment selection has its own method `onShippingChange()`. The next method `setShippingMethod()`  will respond to this event emitter.
 
CheckoutPage.vue
    setShippingMethod(shippingId) {
      this.commerce.checkout
        .checkShippingOption(this.checkoutToken.id, {
          shipping_option_id: shippingId,
          country: this.deliveryForm.country,
          region: this.deliveryForm.state
        })
        .then(res => {
          this.deliveryForm.shipping_method = shippingId;
          this.live = res.live;
        })
        .catch(err => console.log(err));
    }
 
The method will take the shipment ID passed from the delivery form and then use that to make a Commerce.js method call `checkShippingOption()` to verify if the shipping option is valid. A live object is returned in the call and if the shipping is valid, it will update the live object. Assign shippingId to the `deliveryForm.shipping_method` property and the returned live to the live state.
 
CheckoutPage.vue
handleOnSubmit(e) {
      e.preventDefault();
this.$router.push(`/checkout/${this.$route.params.id}/paymentform`);
 
 
The last method handles the onSubmit emit. It simply pushes to the payment form. The prevent default method for the event object stops the usual effect of page refreshing when forms are submitted. The reload is unnecessary, causes slowdowns in user experience, and erases state data that will be used later.
 
The delivery form should now be complete!
 
3. Using the live object with the Order Summary
 
An order summary keeps track of the order’s pricing as the customer progresses through the checkout process. With how the delivery form is set up earlier, the retrieve values from the helper functions can dynamically update the order summary with the use of the live object.
 
Very much like the checkout page and the delivery form, you’ll have to create the component. Create `OrderSummary.vue` in the components folder, and then copy and paste this code below to get a quick start.
 
OrderSummary.vue
<template>
  <div class="card orderSummary-card">
    <div class="card-body">
      <h4 class="card-title">Order Summary</h4>
      <hr>
      <OrderSummaryItem v-for="item in live.line_items" :item="item" :key="item.id"/>
      <hr>
      <div class="d-flex justify-content-between">
        <p>Subtotal</p>
        <p>{{ live.subtotal.formatted_with_symbol }}</p>
      </div>
      <div class="d-flex justify-content-between">
        <p>Shipping</p>
        <p>{{ live.shipping.price.formatted_with_symbol }}</p>
      </div>
      <div class="d-flex justify-content-between">
        <p>Tax</p>
        <p>{{ live.tax.amount.formatted_with_symbol }}</p>
      </div>
      <hr>
      <div class="d-flex justify-content-between">
        <h5>Total with Tax</h5>
        <h5>{{ live.total_with_tax.formatted_with_symbol }}</h5>
      </div>
    </div>
  </div>
</template>
 
<script>
import OrderSummaryItem from "./OrderSummaryItem";
export default {
  name: "OrderSummary",
  props: ["live"],
  components: {
    OrderSummaryItem
  }
};
</script>
 
<style>
.orderSummary-card {
  margin: 20px 0;
}
</style>
 
The order summary is a simple component that renders the props it receives from the checkout page. There is a component that needs to be made in this file called “OrderSummaryItem”.
 
Create `OrderSummary.vue` in the components folder and copy and paste this code in.
 
OrderSummary.vue
<template>
    <div class="d-flex justify-content-between">
        <div>
            <h6>{{ item.product_name }}</h6>
            <p>Quantity: {{ item.quantity }}</p>
        </div>
        <p>{{ item.line_total.formatted_with_symbol }}</p>
    </div>
</template>
 
<script>
export default {
    name: "OrderSummaryItem",
    props: ["item"]
}
</script>
 
<style>
</style>
 
This component will list out the items in the user’s cart. Users can double check the items they have during the checkout process, and see how the prices add up for themselves. 
 
Return to `CheckoutPage.vue` and add the component in by importing it in and by passing it into the components method.
 
CheckoutPage.vue
import OrderSummary from "../components/OrderSummary";
export default {
  name: "CheckoutPage",
  components: {
    OrderSummary
  },
 
Add it into the template right above the delivery form.
 
CheckoutPage.vue
    <OrderSummary v-if=”live” :live="live"/>
    <router-view
	...
    />
 
The v-if directive checks if the live object exists. Remember how the default value for the live state was set as undefined? The order summary will only render if the live object is collected from the Commerce.js calls. The component can render regardless of this directive, but it will yield warnings and errors that clouds up the console because the initial render will receive undefined props.
 

 
The order summary should turn out like this. The shipping and tax information updates as the live object gets updates from the delivery form methods.
 
4. Creating the payment form with card validation
 
The next form in this guide is the payment form, a way for users to securely pay for the products. The payment form takes in three values: the card number, the card expiration, and the CVC. The next steps will involve making a much smaller form than the delivery form, but more intricate because the web app should help users enter in valid card data.
 
Before creating the page, hook up the path in the router at `main.js`. Although the file is not yet made, import it in as well.
 
main.js
import PaymentForm from "./components/PaymentForm.vue";
...
 {
      path: "/checkout/:id",
      name: "CheckoutPage",
      component: CheckoutPage,
      children: [
        {
          path: "deliveryform",
          component: DeliveryForm
        },
        {
          path: "paymentform",
          component: PaymentForm
        }
      ]
    }
 
Create `PaymentForm.vue` in the components folder and then copy and paste this code below.
 
PaymentForm.vue
<template>
  <form name="paymentForm" @submit="onSubmit" >
    <h3>Payment Method</h3>
    <div class="form-group">
      <label for="checkout-number">Card Number</label>
      <input
        type="text"
        class="form-control"
        id="checkout-number"
        name="number"
        required
        @change="onChange"
      >
    </div>
  <div class="row">
    <div class="col">
      <label for="checkout-cardNumber">Expiration Date MM/YY</label>
      <input type="text" class="form-control" name="expire" required @change="onChange" pattern="([0-9]{2}[/]?){2}">
    </div>
    <div class="col">
      <label for="checkout-cardNumber">CVC ###</label>
      <input type="text" class="form-control" name='cvc' required @change="onChange" pattern="([0-9]{3})">
    </div>
  </div>
  <button class="btn btn-primary">Submit Order</button>
</form>
</template>
 
<script>
export default {
  name: "PaymentForm",
  methods: {
    onChange(e) {
      this.$emit("onChange", e);
    },
    onSubmit(e) {
      this.$emit("onSubmit", e);
    }
  }
};
</script>
 
<style scoped>
form {
  margin: 20px 0;
}
button {
  margin: 20px 0;
}
</style>
 
This is a very similar file compared to the delivery form. The main difference is that it collects different information. There is one new attribute that needs introduction, which is the pattern attribute found for the expiration data field and the CVC field. 
 
PaymentForm.vue      
<input type="text" class="form-control" name="expire" required @change="onChange" pattern="([0-9]{2}[/]?){2}">
 
The pattern attribute can accept a regex string https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions so it can detect if the user’s input is in the proper format. Explaining regex will take you down a deep rabbit hole so it will not be explained thoroughly in this guide. The regex strings are included in the code above.
 
Validating the card number
 
Back inside of `CheckoutPage.vue`, you’ll install a credit card number validator library so your payment form can verify if the car number is valid. If you want to understand the algorithm used to determine valid card numbers, check out the Luhn’s algorithm. https://www.geeksforgeeks.org/luhn-algorithm/
 
To install, open the temrinal.
 
npm install creditcard.js
Import the package in.
 
CheckoutPage.vue
import CreditCard from "creditcard.js";
 
Then create a state so it can hold the validator object. The additional three states in the code below will also be explained in just a bit.
 
CheckoutPage.vue
  data() {
	...
      validator: new CreditCard(),
paymentForm: {},
status: "",
receipt: {}
	...
    };
  },
 
 
Now for the `handleOnSubmit()` method. Replace the one that’s currently in the payment form with this one.
 
PaymentForm.vue
    handleOnSubmit(e) {
      e.preventDefault();
      if (e.target.name === "deliveryForm") {
        this.$router.push(`/checkout/${this.$route.params.id}/paymentform`);
      } else {
        const isValidated = this.validator.isValid(this.paymentForm.number);
        if (isValidated) {
          this.status = "";
          const spacedNumber = this.paymentForm.number.replace(/(\d{4}(?!\s))/g, "$1 ")
          const splitExpire = this.paymentForm.expire.split("/");
          this.handleCapture(spacedNumber, splitExpire[0], splitExpire[1]);
        } else {
          this.status = "The card number you entered is invalid.";
        }
      }
    },
 
This is the same one you had to copy earlier, but with some changes. The code checks which form is the submit event coming from. If it’s the payment form, it will run the validator you just installed. If the validator returns true, the card is good for transactional use. You will encounter some more regex once again. For the sake of brevity, the regex adds a space after every 4th number. While it’s good to learn regex if you plan to create complex pattern matching, there are plenty of premade regex patterns that can be found with a quick Google search.
 
The const splitExpire separates the month and years on the expire state of the payment form. Split takes in a string argument that tells the method to separate strings into an array based on where the argument is in the string. Ie: “12/20” returns as [ “12”, “20” ].
 
The point of changing these string values is because the Commerce.js SDK can only take them in this format during the token capture. At the end of this method, you’ll find the values passed into another method `handleCapture()`
 
The conditional logic with the status states will send the user a message based on the validity of the credit card number. To have the status state physically appear on the user’s screen, add this element in the template under the order summary.
 
CheckoutPage.vue
    <div v-if="status" class="alert alert-danger fade show" role="alert">{{ status }}</div>
 
 
 CheckoutPage.vue
 handleCapture(number, month, year) {
      let line_items = {};
      this.live.line_items.forEach(item => {
        line_items[item.id] = { quantity: item.quantity };
      });
      // console.log('lineitems',line_items);
      const d = this.deliveryForm;
      const p = this.paymentForm;
      const data = {
        line_items,
        customer: {
          firstname: d.firstname,
          lastname: d.lastname,
          email: d.email
        },
        shipping: {
          name: d.recipient,
          street: d.street,
          town_city: d.town_city,
          county_state: d.state,
          postal_zip_code: d.zip_code,
          country: d.country
        },
        fulfillment: {
          shipping_method: d.shipping_method
        },
        payment: {
          gateway: "test_gateway",
          card: {
            number: number,
            expiry_month: month,
            expiry_year: year,
            cvc: p.cvc,
            postal_zip_code: d.zip_code
          }
        }
      };
      this.commerce.checkout
        .capture(this.checkoutToken.id, data)
        .then(res => {
          console.log(res);
          this.receipt = res;
          this.$router.push(`/checkout/${res.id}/confirmation`);
          this.$emit("getNewCart");
        })
        .catch(err => {
          console.log(err)
          this.shippingMethods = []
        });
    }
 
This code will use the Commerce.js to capture the checkout, which will finalize the purchase and return data used to make the purchase.
 
Item data must be passed in as an object so the first few lines of code returns the array of items into an object. Using a concept called Macros, you can shorten `this.paymentForm` and `this.deliveryForm` to single letters. In this case, you’ll be using d and p.
 
The data object above shows all the required properties. The number, and expiration month and year were passed in from the argument. You’ll be using the ‘test_gateway’ for development purposes.
 
One more detail to add is when making test checkouts, you will have to use this card number "4242424242424242”. This is a valid test number given by Commerece.js documentation. 
 
The SDK makes a call to the server passing in the data you made, and then it will bind the response to the receipt state, which will be used for making the confirmation component. The `$router.push` sends users to the confirmation nested route, and then an emit to `App.vue` will signal a method to clear out the user’s cart.
 
In `App.vue`, create the emit catcher.
 
App.vue
      <router-view
	  ...
        @getNewCart="handleGetNewCart"
      />
 
And the method to handle it.
 
App.vue
    handleGetNewCart() {
      this.commerce.cart
        .retrieve()
        .then(res => {
          this.cart = res;
        })
        .catch(err => console.log(err));
    }
 
 
If you had your debugger on, it will notify you in the console that a new cart is made. This method makes a call after the capture is successful so it can grab that newly made empty cart for the user so the previous cart will no longer show up.
 
With that all set up, the last component is coming up in the last step.
 
5. Making the order confirmation component

The receipt state that receives the object returned from a successful capture will contain information for the order confirmation component. This third nested component will contain all the information the customer entered such as the shipping address, the type of credit card used, and the order number.
Create `Confirmation.vue` in the component folder, and then copy and paste this code in.

Confirmation.vue
<template>
  <div class="card">
    <div class="card-body">
      <h3 class="card-title">Thank you for your order!</h3>
      <hr>
      <div class="confirmation-order_info">
        <div class="d-flex justify-content-between">
          <h6>Order Number</h6>
          <p>{{ receipt.id }}</p>
        </div>
        <div class="d-flex justify-content-between">
          <h6>Order Date</h6>
          <p>{{ moment().millisecond(1585936128).format("ddd MMM d YYYY") }}</p>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <h5>Shipping Address</h5>
          <p>{{ receipt.shipping.name }}</p>
          <p>{{ receipt.shipping.street }}</p>
          <p>{{ receipt.shipping.town_city }}, {{ receipt.shipping.county_state}}, {{ receipt.shipping.postal_zip_code }} {{ receipt.shipping.country }}</p>
          <p>{{ receipt.customer.email }}</p>
        </div>
        <div class="col">
          <h5>Payment Method</h5>
          <p>{{ receipt.payments[0].card_type }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script>
import moment from "moment";
export default {
  name: "Confirmation",
  props: {
    receipt: {
      type: Object
    }
  },
  data() {
    return {
      moment: moment
    };
  }
};
</script>
 
<style scoped>
.card {
  margin: 20px 0;
}
 
.confirmation-order_info {
  width: 400px;
}
 
.row .col p {
  margin: 0;
}
</style>

This is another straightforward component that receives props. It does introduce one new tool that can aid you in all date-related coding. The created property from the returned object is in milliseconds since the unix time https://en.wikipedia.org/wiki/Unix_time. Using the moment library, one can quickly transform those milliseconds into a readable date.
 
Open the terminal and install moment.js https://momentjs.com/
 
npm install moment
The module is already imported and added into the data state for use. Using the milliseconds method, it can take in integers in values of milliseconds and then return a date object. The format method then takes a string pattern (like an easier version of regex) and then returns a date value following that format.
 
Next is to add this subroute into `main.js`. Import and create the route object as usual.

```js
// Main.js
import Confirmation from "./components/Confirmation.vue";
...
{
	path: "/checkout/:id",
	name: "CheckoutPage",
	component: CheckoutPage,
	children: [
		{
		  path: "deliveryform",
		  component: DeliveryForm
		},
		{
		  path: "paymentform",
		  component: PaymentForm
		},
		{
		  path: "confirmation",
		  component: Confirmation
		}
	]
}
```

Now pass down the receipt state in `CheckoutPage.vue` as props into router-view so the `Confirmation.vue` can make use of it.

``` html
<!-- CheckoutPage.vue -->
<router-view
	...
	:receipt="receipt"
/>
```

Fill out the forms to see if it all works. Make sure you use the dummy card number “4242424242424242”, and an email you own (to check if Chec's automated order confirmation email is intact). The component will appear after a few seconds, and will look like this.
 
 ![checkout](/src/assets/checkout.png)
 
And that wraps up the whole checkout process!
 
## Conclusion	

The checkout process takes long to develop because there are so many different ways to go about it. There are many functions that could be incorporated into the checkout process, especially with a flexible SDK such as Commerece.js. Thanks for reading this guide, and I hope you will find more cool features to implement to make the checkout process more user friendly.
 
Built With
NPM Vue.js Bootstrap Codesandbox

## Author
Thomas Huynh - [Github](https://github.com/thomas-t-huynh)

