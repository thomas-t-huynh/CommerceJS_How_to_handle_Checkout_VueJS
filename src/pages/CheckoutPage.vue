<template>
  <div>
    <OrderSummary :live="live"/>
    <div v-if="status" class="alert alert-danger fade show" role="alert">{{ status }}</div>
    <router-view
      @onChange="handleOnChange"
      @onShippingChange="setShippingMethod"
      @onSubmit="handleOnSubmit"
      :live="live"
      :disableStates="disableStates"
      :states="states"
      :countries="countries"
      :shippingMethods="shippingMethods"
      :receipt="receipt"
    />
  </div>
</template>

<script>
import OrderSummary from "../components/OrderSummary";
import CreditCard from "creditcard.js";
export default {
  name: "CheckoutPage",
  components: {
    OrderSummary
  },
  props: {
    commerce: {
      type: Object
    }
  },
  data() {
    const dummyPayment = {
      number: "4242424242424242",
      expire: "11/11",
      cvc: "111"
    };
    return {
      checkoutToken: {},
      live: {},
      validator: new CreditCard(),
      deliveryForm: {
        country: ""
      },
      paymentForm: dummyPayment,
      countries: {},
      states: {},
      status: "",
      shippingMethods: [],
      receipt: {}
    };
  },
  methods: {
    handleOnChange(e) {
      const { form, name, value } = e.target;
      this[form.name][name] = value;
      form.name === "deliveryForm" && this.updateCheckoutSubtotal();
    },
    handleOnSubmit(e) {
      e.preventDefault();
      if (e.target.name === "deliveryForm") {
        this.$router.push(`/checkout/${this.$route.params.id}/paymentform`);
      } else {
        const isValidated = this.validator.isValid(this.paymentForm.number);
        if (isValidated) {
          this.status = "";
          let spacedNumber = this.paymentForm.number.split("");
          for (var i = 0; i < 3; i++) {
            spacedNumber.splice((i + 1) * 4 + i, 0, " ");
          }
          spacedNumber = spacedNumber.join("");
          const splitExpire = this.paymentForm.expire.split("/");
          this.handleCaptureToken(spacedNumber, splitExpire[0], splitExpire[1]);
        } else {
          this.status = "The card number you entered is invalid.";
        }
      }
    },
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
    checkShippingAndTax(country, zip_code = "", state = "") {
      this.commerce.checkout
        .setTaxZone(this.checkoutToken.id, {
          postal_zip_code: zip_code,
          country: country,
          region: state
        })
        .then(res => {
          console.log("tax", res);
          this.live = res.live;
        })
        .catch(err => console.log(err));

      this.commerce.checkout
        .getShippingOptions(this.checkoutToken.id, {
          country: country,
          region: state
        })
        .then(res => {
          console.log("shipping", res);
          this.shippingMethods = res;
        })
        .catch(err => console.log(err));
    },
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
    },
    handleCaptureToken(number, month, year) {
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
  },
  computed: {
    disableStates() {
      return this.deliveryForm.country === "US" ? false : true;
    }
  },
  created() {
    // idea - include cartId in url to find cart upon refresh
    // is generatin a token everytime isntead of grabbing an existing token okay?
    const getCartId = this.$route.params.id;
    this.commerce.checkout
      .generateToken(getCartId, { type: "cart" })
      .then(res => {
        this.checkoutToken = res;
        this.live = res.live;
      })
      .catch(err => console.log(err));

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
  }
};
</script>

<style scoped>
.alert {
  margin-top: 20px;
}
</style>
