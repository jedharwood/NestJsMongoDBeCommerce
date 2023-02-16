import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Item } from './schemas/item.schema';

@Injectable()
export class CartRepository {
  constructor(
    @InjectModel('Cart') private readonly cartModel: Model<CartDocument>,
  ) {}
  async getCart(userId: string): Promise<CartDocument> {
    return await this.cartModel.findOne({ userId });
  }

  async createCart(
    userId: string,
    items: Item[],
    totalPrice: number,
  ): Promise<Cart> {
    return await this.cartModel.create({
      userId,
      items,
      totalPrice,
    });
  }

  async deleteCart(userId: string): Promise<Cart> {
    return await this.cartModel.findOneAndRemove({ userId });
  }

  async save(cart: CartDocument): Promise<Cart> {
    return await new this.cartModel(cart).save();
  }
}
