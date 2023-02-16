import { Injectable } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { ItemDto } from './dtos/item.dto';
import { UpdateQuantityDto } from './dtos/update-quantity.dto';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Item } from './schemas/item.schema';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  private getItemIndex(items: Item[], productId: string): number {
    return items.findIndex((i) => i.productId === productId);
  }

  private recalculateCart(cart: CartDocument) {
    cart.totalPrice = 0;
    cart.items.forEach((item) => {
      cart.totalPrice += item.quantity * item.price;
    });
  }

  private async updateItemQuantityAndSubtotal(
    cart: CartDocument,
    itemIndex: number,
    quantity: number,
  ): Promise<Cart> {
    const item = cart.items[itemIndex];
    item.quantity = quantity;
    item.subTotalPrice = item.quantity * item.price;
    cart.items[itemIndex] = item;
    this.recalculateCart(cart);

    return this.cartRepository.save(cart);
  }

  async addItemToCart(userId: string, itemDto: ItemDto): Promise<Cart> {
    const { productId, quantity, price } = itemDto;
    const subTotalPrice = quantity * price;

    const cart = await this.cartRepository.getCart(userId);
    if (!cart) {
      return await this.cartRepository.createCart(
        userId,
        [{ ...itemDto, subTotalPrice }],
        subTotalPrice,
      );
    }

    const itemIndex = this.getItemIndex(cart.items, productId);
    if (itemIndex >= 0) {
      const item = cart.items[itemIndex];
      const itemQuantity = item.quantity + quantity;

      return this.updateItemQuantityAndSubtotal(cart, itemIndex, itemQuantity);
    } else {
      cart.items.push({ ...itemDto, subTotalPrice });
      this.recalculateCart(cart);

      return this.cartRepository.save(cart);
    }
  }

  async removeItemFromCart(userId: string, productId: string): Promise<Cart> {
    const cart = await this.cartRepository.getCart(userId);
    const itemIndex = this.getItemIndex(cart.items, productId);

    if (itemIndex >= 0) {
      cart.items.splice(itemIndex, 1);
      this.recalculateCart(cart);

      return this.cartRepository.save(cart);
    }
  }

  async updateItemQuantity(
    userId: string,
    updateQuantityDto: UpdateQuantityDto,
  ): Promise<Cart> {
    const cart = await this.cartRepository.getCart(userId);
    const itemIndex = this.getItemIndex(
      cart.items,
      updateQuantityDto.productId,
    );

    if (itemIndex >= 0) {
      const itemQuantity =
        updateQuantityDto.quantity > 0 ? updateQuantityDto.quantity : 0;

      return this.updateItemQuantityAndSubtotal(cart, itemIndex, itemQuantity);
    }
  }

  async deleteCart(userId: string): Promise<Cart> {
    return await this.cartRepository.deleteCart(userId);
  }
}
