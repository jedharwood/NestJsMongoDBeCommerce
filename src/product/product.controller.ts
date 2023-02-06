import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
  Post,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { FilterProductDto } from './dtos/filter-product.dto';
import { CreateProductDto } from './dtos/create-product.dto';

@Controller('store/products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get('/')
  async getProducts(@Query() filterProductDto: FilterProductDto) {
    if (Object.keys(filterProductDto).length) {
      const filteredProducts = await this.productService.getFilteredProducts(
        filterProductDto,
      );
      return filteredProducts;
    } else {
      const allProducts = await this.productService.getAllProducts();
      return allProducts;
    }
  }

  @Get('/:id')
  async getProduct(@Param('id') id: string) {
    const product = await this.productService.getProduct(id);
    if (!product) throw new NotFoundException('Product does not exist!');
    return product;
  }

  @Post('/')
  async addProduct(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.addProduct(createProductDto);
    return product;
  }

  @Put('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() createProductDto: CreateProductDto,
  ) {
    const product = await this.productService.updateProduct(
      id,
      createProductDto,
    );
    if (!product) throw new NotFoundException('Product does not exist!');
    return product;
  }

  @Delete('/:id')
  async deteleProduct(@Param('id') id: string) {
    const product = await this.productService.deleteProduct(id);
    if (!product) throw new NotFoundException('Product does not exist!');
    return product;
  }
}
