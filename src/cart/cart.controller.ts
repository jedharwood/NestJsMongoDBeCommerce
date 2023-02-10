import {
  Body,
  Controller,
  Delete,
  NotFoundException,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CartService } from './cart.service';
import { ItemDto } from './dtos/item.dto';
import { UpdateQuantityDto } from './dtos/update-quantity.dto';

const enum ExceptionSubject {
  Cart = 'Cart',
  Item = 'Item',
}
@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Post('/')
  async addItemToCart(@Request() req, @Body() itemDto: ItemDto) {
    return await this.cartService.addItemToCart(req.user.userId, itemDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Delete('/')
  async removeItemFromCart(@Request() req, @Body() { productId }) {
    const cart = await this.cartService.removeItemFromCart(
      req.user.userId,
      productId,
    );

    if (!cart) this.throwNotFoundException(ExceptionSubject.Item);

    return cart;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Put('/')
  async updateItemQuantity(
    @Request() req,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    const cart = await this.cartService.updateItemQuantity(
      req.user.userId,
      updateQuantityDto,
    );

    if (!cart) this.throwNotFoundException(ExceptionSubject.Item);

    return cart;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.User)
  @Delete('/:id')
  async deleteCart(@Param('id') userId: string) {
    try {
      return await this.cartService.deleteCart(userId);
    } catch {
      this.throwNotFoundException(ExceptionSubject.Cart);
    }
  }

  private throwNotFoundException(subject: ExceptionSubject): void {
    throw new NotFoundException(`${subject} does not exist`);
  }
}
