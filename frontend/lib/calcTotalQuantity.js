export default function calcTotalPrice(cart) {
  return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}
