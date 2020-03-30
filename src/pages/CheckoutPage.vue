<template>
  <DeliveryForm 
    @onChange="handleOnChange"
    :disableStates="disableStates"
  />
</template>

<script>
// subroute - delivery and payment pages
import DeliveryForm from "../components/DeliveryForm";
export default {
  name: "CheckoutPage",
  components: {
    DeliveryForm
  },
  data() {
    return {
      deliveryForm: {
        country: ""
      }
    };
  },
  methods: {
    handleOnChange(e) {
      this.deliveryForm[e.target.name] = e.target.value;
    }
  },
  computed: {
    disableStates() {
      console.log(this.deliveryForm.country);
      if (this.deliveryForm.country === "United States of America") {
        return false;
      }
      return true;
    }
  }
};
</script>

<style scoped></style>
