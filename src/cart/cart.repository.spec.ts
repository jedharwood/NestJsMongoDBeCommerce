import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { CartRepository } from './cart.repository';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Item } from './schemas/item.schema';

describe('ProductService', () => {
  const userOneId = 'user1';
  const itemArray: Item[] = [
    {
      productId: 'product1',
      name: 'Product 1',
      quantity: 1,
      price: 1,
      subTotalPrice: 1,
    },
    {
      productId: 'product2',
      name: 'Product 2',
      quantity: 2,
      price: 2,
      subTotalPrice: 4,
    },
  ];
  const totalPrice = 5;
  const userOneCart: Cart = {
    userId: userOneId,
    items: itemArray,
    totalPrice: totalPrice,
  };

  let cartRepository: CartRepository;
  let cartModel: Model<CartDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartRepository,
        {
          provide: getModelToken('Cart'),
          useValue: {
            findOne: jest.fn().mockReturnThis(),
            create: jest.fn(),
            findOneAndRemove: jest.fn(),
          },
        },
      ],
    }).compile();

    cartRepository = module.get<CartRepository>(CartRepository);
    cartModel = module.get<Model<CartDocument>>(getModelToken('Cart'));
  });

  describe('getCart', () => {
    it('should return null if .findOne returns no match', async () => {
      (cartModel.findOne as jest.Mock).mockReturnValue(null);

      const result: Cart = await cartRepository.getCart(userOneId);

      expect(result).toBeNull();
      expect(cartModel.findOne).toHaveBeenCalledTimes(1);
      expect(cartModel.findOne).toHaveBeenCalledWith({ userId: userOneId });
    });

    it('should return cart if .findOne returns a match', async () => {
      (cartModel.findOne as jest.Mock).mockReturnValue(userOneCart);

      const result: Cart = await cartRepository.getCart(userOneId);

      expect(result).toEqual(userOneCart);
      expect(cartModel.findOne).toHaveBeenCalledTimes(1);
      expect(cartModel.findOne).toHaveBeenCalledWith({ userId: userOneId });
    });
  });

  describe('createCart', () => {
    it('should create cart', async () => {
      (cartModel.create as jest.Mock).mockReturnValue(userOneCart);

      const result: Cart = await cartRepository.createCart(
        userOneId,
        itemArray,
        totalPrice,
      );

      expect(result).toEqual(userOneCart);
      expect(cartModel.create).toHaveBeenCalledTimes(1);
      expect(cartModel.create).toHaveBeenCalledWith(userOneCart);
    });
  });

  describe('deleteCart', () => {
    it('should return null if .findOneAndRemove returns no match', async () => {
      (cartModel.findOneAndRemove as jest.Mock).mockReturnValue(null);

      const result: Cart = await cartRepository.deleteCart(userOneId);

      expect(result).toBeNull();
      expect(cartModel.findOneAndRemove).toHaveBeenCalledTimes(1);
      expect(cartModel.findOneAndRemove).toHaveBeenCalledWith({
        userId: userOneId,
      });
    });

    it('should delete cart if .findOneAndRemove returns a match', async () => {
      (cartModel.findOneAndRemove as jest.Mock).mockReturnValue(userOneCart);

      const result: Cart = await cartRepository.deleteCart(userOneId);

      expect(result).toEqual(userOneCart);
      expect(cartModel.findOneAndRemove).toHaveBeenCalledTimes(1);
      expect(cartModel.findOneAndRemove).toHaveBeenCalledWith({
        userId: userOneId,
      });
    });
  });
});
