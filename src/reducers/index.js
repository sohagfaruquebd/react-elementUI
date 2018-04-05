import { combineReducers } from 'redux';

const initialAuthState = { token: '', isLoggedIn: false };

const initialCart = { 
  product: [],
  tempProduct: '',
  cartItems: [],
  tempCategory: {}
 };
function auth(state = initialAuthState, action) {
  switch (action.type) {
    case 'Store':
      return { ...state, token: action.token, isLoggedIn: true }
    case 'Logout':
      return { ...state, token: '', isLoggedIn: false }
    default:
      return state;
  }
}
function cart(state = initialCart, action) {
  console.log(action)
  switch (action.type) {
    case 'tempProduct':
      return { ...state, tempProduct: action.product }
    case 'tempCategory':
      return { ...state, tempCategory: action.category }
    case 'cartItems':
      return { ...state, cartItems: [...state.cartItems, action.cartItems] }
    case 'removeCartItems':
      return { ...state, cartItems: [...state.cartItems.slice(0, action.index), ...state.cartItems.slice(action.index + 1)] }
    case 'updateQuantity':
      return { ...state, cartItems: [...state.cartItems[action.index.key].quantity, action.index.value] }
    case 'firstStep':
      return { ...state, product: [...state.product, action.product] }
    case 'Logout':
      return { ...state, token: '', isLoggedIn: false }
    default:
      return state;
  }
}


const AppReducer = combineReducers({
  auth,
  cart
});

export default AppReducer;
