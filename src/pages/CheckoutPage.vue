<template>
  <div>
    <DeliveryForm @onChange="handleOnChange" :disableStates="disableStates" :states="states" :countries="countries" />
    <OrderSummary />
  </div>
</template>

<script>
// subroute - delivery and payment pages
import DeliveryForm from "../components/DeliveryForm";
import OrderSummary from "../components/OrderSummary";
export default {
  name: "CheckoutPage",
  components: {
    DeliveryForm,
    OrderSummary
  },
  props: {
    checkoutToken: {
      type: Object
    },
    commerce: {
      type: Object
    }
  },
  data() {
    return {
      deliveryForm: {
        email: "",
        fullName: "",
        recipient: "",
        address: "",
        optionalAddress: "",
        city: "",
        zipCode: "",
        state: "",
        country: "",
        number: ""
      },
      countries: {},
      states: {}
    };
  },
  methods: {
    handleOnChange(e) {
      this.deliveryForm[e.target.name] = e.target.value;
      this.updateCheckoutSubtotal(e.target.name);
    },
    updateCheckoutSubtotal(param) {
      if (param === "country" || param === "zipCode" || param == "state") {
        const { country, zipCode, state } = this.deliveryForm
        this.commerce.checkout.setTaxZone(this.checkoutToken.id, {
          postal_zip_code: zipCode, country: country, region: state
        })
        .then(res => console.log(res))
        .catch(err => console.log(err))
      }
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
    this.commerce.services.localeListCountries(this.checkoutToken.id)
    .then(res => {
      this.countries = res.countries
    })
    .catch(err => console.log(err))

    this.commerce.services.localeListSubdivisions("US")
    .then(res => {
      this.states = res.subdivisions
    })
    .catch(err => console.log(err))
  }
};
</script>

<style scoped></style>
