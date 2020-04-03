<template>
  <div>
    <div v-if="status" class="alert alert-danger fade show" role="alert">{{ status }}</div>
    <OrderSummary :live="live"/>
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
</template>

<script>
// subroute - delivery and payment pages
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
    return {
      checkoutToken: {},
      live: {},
      validator: new CreditCard(),
      deliveryForm: {},
      paymentForm: {},
      countries: {},
      states: {},
      status: "",
      shippingMethods: []
    };
  },
  methods: {
    handleOnChange(e) {
      const { form, name, value } = e.target;
      this[form.name][name] = value
      form.name === "deliveryForm" && this.updateCheckoutSubtotal();
    },
    handleOnSubmit(e) {
      e.preventDefault();
      // for (let field in this.deliveryForm) {
      //   if (this.deliveryForm[field] === "" && field !== "optionalAddress") {
      //     window.scrollTo(0, 0);
      //     console.log(field);
      //     this.status = `Required field is missing: ${field}`;
      //     return;
      //   }
      // }
      if (e.target.name === "deliveryForm") {
        console.log(this.deliveryForm)
        this.$router.push(`/checkout/${this.$route.params.cartId}/paymentform`);
      } else {
        console.log(this.paymentForm)
        console.log(this.validator.getCreditCardNameByNumber(this.paymentForm.number))
      }
      // this.status = "";
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
          this.deliveryForm.shipping = shippingId;
          this.live = res.live;
        })
        .catch(err => console.log(err));
    }
  },
  computed: {
    disableStates() {
      if (this.deliveryForm.country === "US") {
        return false;
      }
      return true;
    }
  },
  created() {
    // idea - include cartId in url to find cart upon refresh
    const getCartId = this.$route.params.cartId;
    this.commerce.checkout
      .generateToken(getCartId, { type: "cart" })
      .then(res => {
        this.checkoutToken = res;
        console.log(res.live);
        this.live = res.live;
      })
      .catch(err => console.log(err));

    // this.commerce.checkout
    //   .getLocationFromIP(this.checkoutToken.id)
    //   .then(res => {
    //     console.log(res)
    //   })
    //   .catch(err => console.log(err))

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
