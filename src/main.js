import Vue from "vue";
import VueRouter from "vue-router";
import Commerce from "@chec/commerce.js";

import App from "./App.vue";
import CartPage from "./pages/CartPage.vue";
import ProductViewPage from "./pages/ProductViewPage.vue";
import ProductsPage from "./pages/ProductsPage.vue";
import CheckoutPage from "./pages/CheckoutPage.vue";

Vue.use(VueRouter);

Vue.config.productionTip = false;

// Pass in your own API key to list out your own products.
const API_KEY = "pk_test_17958b576e2ba6850e3191cf217db928655e7e63d4c7b";

const commerce = new Commerce(API_KEY, false);

const router = new VueRouter({
  linkExactActiveClass: "active",
  routes: [
    {
      path: "/",
      name: "ProductsPage",
      component: ProductsPage
    },
    {
      path: "/product/:productId",
      name: "ProductViewPage",
      component: ProductViewPage
    },
    {
      path: "/cart",
      name: "CartPage",
      component: CartPage
    },
    {
      path: "/checkout",
      name: "CheckoutPage",
      component: CheckoutPage
    }
  ]
});

new Vue({
  router,
  render: h => h(App, { props: { commerce } })
}).$mount("#app");
