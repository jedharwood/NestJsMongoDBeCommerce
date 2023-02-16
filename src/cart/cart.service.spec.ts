import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { Item } from './schemas/item.schema';
import { Cart } from './schemas/cart.schema';
import { CartRepository } from './cart.repository';
import { UpdateQuantityDto } from './dtos/update-quantity.dto';

const generateItem = (productNumber: number): Item => {
  const quantity: number = productNumber;
  const price: number = productNumber;

  return {
    productId: `product${productNumber}`,
    name: `Product ${productNumber}`,
    quantity: quantity,
    price: price,
    subTotalPrice: quantity * price,
  };
};

describe('CartService', () => {
  const productOne: Item = generateItem(1);
  const productTwo: Item = generateItem(2);
  const productThree: Item = generateItem(3);
  const userOneId = 'user1';
  const userTwoId = 'user2';
  const mockCartRepository = {
    getCart: jest.fn(),
    createCart: jest.fn(),
    deleteCart: jest.fn(),
    save: jest.fn(),
  };

  let cartService: CartService;
  let userOneCart: Cart;

  beforeEach(async () => {
    userOneCart = {
      userId: userOneId,
      items: [productOne, productTwo],
      totalPrice: 5,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepository,
          useValue: mockCartRepository,
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    // Assert
    expect(cartService).toBeDefined();
  });

  describe('addItemToCart', () => {
    it('should create cart and add item if user cart does not already exist', async () => {
      // Arrange
      const expectedCart: Cart = {
        userId: userTwoId,
        items: [productThree],
        totalPrice: 9,
      };
      mockCartRepository.getCart.mockReturnValue(null);
      mockCartRepository.createCart.mockReturnValue(expectedCart);

      // Act
      const result: Cart = await cartService.addItemToCart(
        userTwoId,
        productThree,
      );

      // Assert
      expect(result).toEqual(expectedCart);

      expect(mockCartRepository.getCart).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.getCart).toHaveBeenCalledWith(userTwoId);
      expect(mockCartRepository.createCart).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.createCart).toHaveBeenCalledWith(
        expectedCart.userId,
        expectedCart.items,
        expectedCart.totalPrice,
      );
    });

    it('should update item quantity, subTotalPrice and totalPrice if item already exists in cart', async () => {
      // Arrange
      const expectedCart: Cart = {
        userId: userOneId,
        items: [
          {
            ...productOne,
            quantity: 2,
            subTotalPrice: 2,
          },
          productTwo,
        ],
        totalPrice: 6,
      };
      mockCartRepository.getCart.mockReturnValue(userOneCart);
      mockCartRepository.save.mockReturnValue(expectedCart);

      // Act
      const result: Cart = await cartService.addItemToCart(
        userOneId,
        productOne,
      );

      // Assert
      expect(result).toEqual(expectedCart);
      expect(userOneCart).toEqual(expectedCart);

      expect(mockCartRepository.getCart).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.getCart).toHaveBeenCalledWith(userOneId);
      expect(mockCartRepository.save).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.save).toHaveBeenCalledWith(expectedCart);
    });

    it('should add new item if item not already in cart', async () => {
      // Arrange
      const expectedCart: Cart = {
        userId: userOneId,
        items: [...userOneCart.items, productThree],
        totalPrice: 15,
      };
      mockCartRepository.getCart.mockReturnValue(userOneCart);
      mockCartRepository.save.mockReturnValue(expectedCart);

      // Act
      const result: Cart = await cartService.addItemToCart(
        userOneId,
        productThree,
      );

      // Assert
      expect(result).toEqual(expectedCart);
      expect(userOneCart).toEqual(expectedCart);

      expect(mockCartRepository.getCart).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.getCart).toHaveBeenCalledWith(userOneId);
      expect(mockCartRepository.save).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.save).toHaveBeenCalledWith(expectedCart);
    });
  });

  describe('removeItemFromCart', () => {
    it('should return undefined if cart does not contain item', async () => {
      // Arrange
      mockCartRepository.getCart.mockReturnValue(userOneCart);

      // Act
      const result: Cart = await cartService.removeItemFromCart(
        userOneId,
        productThree.productId,
      );

      // Assert
      expect(result).toBeUndefined();

      expect(mockCartRepository.getCart).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.getCart).toHaveBeenCalledWith(userOneId);
      expect(mockCartRepository.save).toHaveBeenCalledTimes(0);
    });

    it('should remove item from cart if cart contains item', async () => {
      // Arrange
      const expectedCart: Cart = {
        userId: userOneId,
        items: [productTwo],
        totalPrice: 4,
      };
      mockCartRepository.getCart.mockReturnValue(userOneCart);
      mockCartRepository.save.mockReturnValue(expectedCart);

      // Act
      const result: Cart = await cartService.removeItemFromCart(
        userOneId,
        productOne.productId,
      );

      // Assert
      expect(result).toEqual(expectedCart);
      expect(userOneCart).toEqual(expectedCart);

      expect(mockCartRepository.getCart).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.getCart).toHaveBeenCalledWith(userOneId);
      expect(mockCartRepository.save).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.save).toHaveBeenCalledWith(expectedCart);
    });
  });

  describe('updateItemQuantity', () => {
    it('should return undefined if cart does not contain item', async () => {
      // Arrange
      const updateQuantityDto: UpdateQuantityDto = {
        productId: productThree.productId,
        quantity: 1,
      };
      mockCartRepository.getCart.mockReturnValue(userOneCart);

      // Act
      const result: Cart = await cartService.updateItemQuantity(
        userOneId,
        updateQuantityDto,
      );

      // Assert
      expect(result).toBeUndefined();

      expect(mockCartRepository.getCart).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.getCart).toHaveBeenCalledWith(userOneId);
      expect(mockCartRepository.save).toHaveBeenCalledTimes(0);
    });

    it('should update quantity if cart contains item', async () => {
      // Arrange
      const updateQuantityDto: UpdateQuantityDto = {
        productId: productOne.productId,
        quantity: 10,
      };
      const expectedCart: Cart = {
        userId: userOneId,
        items: [
          {
            ...productOne,
            quantity: 10,
            subTotalPrice: 10,
          },
          productTwo,
        ],
        totalPrice: 14,
      };
      mockCartRepository.getCart.mockReturnValue(userOneCart);
      mockCartRepository.save.mockReturnValue(expectedCart);

      // Act
      const result: Cart = await cartService.updateItemQuantity(
        userOneId,
        updateQuantityDto,
      );

      // Assert
      expect(result).toEqual(expectedCart);
      expect(userOneCart).toEqual(expectedCart);

      expect(mockCartRepository.getCart).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.getCart).toHaveBeenCalledWith(userOneId);
      expect(mockCartRepository.save).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.save).toHaveBeenCalledWith(expectedCart);
    });
  });

  describe('deleteCart', () => {
    it('should return null if cart does not exist', async () => {
      // Arrange
      mockCartRepository.getCart.mockReturnValue(userOneCart);
      mockCartRepository.deleteCart.mockReturnValue(null);

      // Act
      const result: Cart = await cartService.deleteCart(userTwoId);

      // Assert
      expect(result).toBeNull();

      expect(mockCartRepository.deleteCart).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.deleteCart).toHaveBeenCalledWith(userTwoId);
    });

    it('should delete cart and return', async () => {
      // Arrange
      mockCartRepository.getCart.mockReturnValue(userOneCart);
      mockCartRepository.deleteCart.mockReturnValue(userOneCart);

      // Act
      const result: Cart = await cartService.deleteCart(userOneId);

      // Assert
      expect(result).toEqual(userOneCart);

      expect(mockCartRepository.deleteCart).toHaveBeenCalledTimes(1);
      expect(mockCartRepository.deleteCart).toHaveBeenCalledWith(userOneId);
    });
  });
});
