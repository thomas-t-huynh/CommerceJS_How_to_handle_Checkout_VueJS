<template>
  <form>
    <h3>Customer</h3>
    <div class="form-group">
      <label for="checkout-email">Email address</label>
      <input
        type="email"
        class="form-control"
        id="checkout-email"
        name="email"
        @change="onChange"
      />
    </div>
    <div class="form-group">
      <label for="checkout-fullName">Full name</label>
      <input
        type="text"
        class="form-control"
        id="checkout-fullName"
        name="name"
        @change="onChange"
      />
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
      />
    </div>
    <div class="form-group">
      <label for="checkout-address">Street Address</label>
      <input
        type="text"
        class="form-control"
        id="checkout-address"
        name="address"
        @change="onChange"
      />
    </div>
    <div class="form-group">
      <label for="checkout-optionalAddress">Apt, Suite, etc. (Optional)</label>
      <input
        type="text"
        class="form-control"
        id="checkout-optionalAddress"
        name="optionalAddress"
        @change="onChange"
      />
    </div>
    <div class="form-group">
      <label for="checkout-city">City</label>
      <input
        type="text"
        class="form-control"
        id="checkout-city"
        name="city"
        @change="onChange"
      />
    </div>
    <div class="form-group">
      <label for="checkout-zipCode">Zip Code</label>
      <input
        type="text"
        class="form-control"
        id="checkout-zipCode"
        name="zipCode"
        @change="onChange"
      />
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
        <option v-for="(state, i) in states" :value="state" :key="i">{{
          state
        }}</option>
      </select>
    </div>
    <div class="form-group">
      <label for="checkout-country">Country</label>
      <select
        class="form-control"
        id="checkout-country"
        name="country"
        @change="onChange"
      >
        <option v-for="(country, i) in countries" :value="country" :key="i">{{
          country
        }}</option>
      </select>
    </div>
    <div class="form-group">
      <label for="checkout-number">Phone Number</label>
      <input
        type="text"
        class="form-control"
        id="checkout-number"
        name="number"
        @change="onChange"
      />
    </div>
  </form>
</template>

<script>
import { states, countries } from "../StatesAndCountries";
export default {
  name: "DeliveryForm",
  methods: {
    onChange(e) {
      this.$emit("onChange", e);
    }
  },
  data() {
    return {
      states: states,
      countries: countries
    };
  },
  props: ["disableStates"],
  computed: {

  }
};
</script>

<style></style>
