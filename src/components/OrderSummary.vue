<template>
    <div class="card">
      <h4 class="card-title">Order Summary</h4>
      <div class="card-body">
        <div class="d-flex justify-content-between">
            <p>Subtotal</p><p>$70</p>
        </div>
        <div class="d-flex justify-content-between">
            <p>Shipping to *user location*</p><p>$10</p>
        </div>
        <div class="d-flex justify-content-between">
            <p>Tax</p><p>$7</p>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  name: "OrderSummary"
};
</script>

<style>

</style>
