<template>
  <form @submit="onSubmit">
    <h3>Customer</h3>
    <div class="form-group">
      <label for="checkout-email">Email address</label>
      <input type="email" class="form-control" id="checkout-email" name="email" @change="onChange">
    </div>
    <div class="form-group">
      <label for="checkout-full_name">Full name</label>
      <input type="text" class="form-control" id="checkout-full_name" name="full_name" @change="onChange">
    </div>

    <h3>Delivery</h3>
    <div class="form-group">
      <label for="checkout-recipient">Recipient Name</label>
      <input
        type="text"
        class="form-control"
        id="checkout-recipient"
        name="recipient"
        @change="onChange"
      >
    </div>
    <div class="form-group">
      <label for="checkout-address">Street Address</label>
      <input
        type="text"
        class="form-control"
        id="checkout-address"
        name="address"
        @change="onChange"
      >
    </div>
    <div class="form-group">
      <label for="checkout-optional_address">Apt, Suite, etc. (Optional)</label>
      <input
        type="text"
        class="form-control"
        id="checkout-optional_address"
        name="optional_address"
        @change="onChange"
      >
    </div>
    <div class="form-group">
      <label for="checkout-city">City</label>
      <input type="text" class="form-control" id="checkout-city" name="city" @change="onChange">
    </div>
    <div class="form-group">
      <label for="checkout-zip_code">Zip Code</label>
      <input
        type="text"
        class="form-control"
        id="checkout-zip_code"
        name="zip_code"
        @change="onChange"
      >
    </div>
    <div class="form-group">
      <label for="checkout-states">State</label>
      <select
        class="form-control"
        id="checkout-states"
        name="state"
        @change="onChange"
        :disabled="disableStates"
      >
        <option v-for="(state, i) in Object.keys(states)" :value="state" :key="i">
          {{
          states[state]
          }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label for="checkout-country">Country</label>
      <select class="form-control" id="checkout-country" name="country" @change="onChange">
        <option v-for="(country, i) in Object.keys(countries)" :value="country" :key="i">
          {{
          countries[country]
          }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label for="checkout-number">Phone Number</label>
      <input type="text" class="form-control" id="checkout-number" name="number" @change="onChange">
    </div>
    <h5 v-if="shippingMethods.length > 0" >Shipping Method</h5>
    <div v-for="method in shippingMethods" :key="method.id" class="form-check">
      <input  class="form-check-input" type="radio" :name="method.description" :value="method.id" @change="onShippingChange">
      <label class="form-check-label" for="exampleRadios1">{{ method.description }}</label>
    </div>
    <button class="btn btn-primary">Continue to Payment</button>
  </form>
</template>

<script>
export default {
  name: "DeliveryForm",
  methods: {
    onChange(e) {
      this.$emit("onChange", e);
    },
    onShippingChange(e) {
      this.$emit("onShippingChange", e.target.value)
    },
    onSubmit(e) {
      this.$emit("onSubmit", e)
    }
  },
  props: ["disableStates", "states", "countries", "shippingMethods"]
};
</script>

<style>
form {
  margin-top: 20px;
}

.form-check {
  margin-bottom: 20px;
}

</style>
