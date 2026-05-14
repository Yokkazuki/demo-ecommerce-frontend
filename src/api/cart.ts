import api from './axios'

export interface CartItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
}

export interface CartResponse {
  cartId: number
  items: CartItem[]
  totalAmount: number
  totalItems: number
}

export interface AddToCartRequest {
  productId: number
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export const cartApi = {
  getCart() {
    return api.get<CartResponse>('/cart')
  },
  addToCart(data: AddToCartRequest) {
    return api.post<CartResponse>('/cart/items', data)
  },
  updateCartItem(itemId: number, data: UpdateCartItemRequest) {
    return api.put<CartResponse>(`/cart/items/${itemId}`, data)
  },
  removeCartItem(itemId: number) {
    return api.delete<CartResponse>(`/cart/items/${itemId}`)
  }
}