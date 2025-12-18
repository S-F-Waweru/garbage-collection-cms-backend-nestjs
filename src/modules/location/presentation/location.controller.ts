import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  CreateLocationDto,
  UpdateLocationDto,
} from '../application/dto/location.dto';

import { CreateNewLocationUseCase } from '../application/use-cases/create-new-location.use-case';
import { GetLocationListUseCase } from '../application/use-cases/get-location-list.use-case';
import { UpdateLocationUseCase } from '../application/use-cases/update-location.use-case';
import { DeleteLocationUseCase } from '../application/use-cases/delete-location.use-case';
import { GetLocationByIdUseCase } from '../application/use-cases/get-location.by-id.use-case';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@ApiTags('Locations')
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationController {
  constructor(
    private readonly createLocationUseCase: CreateNewLocationUseCase,
    private readonly getLocationsUseCase: GetLocationListUseCase,
    private readonly updateLocationUseCase: UpdateLocationUseCase,
    private readonly deleteLocationUseCase: DeleteLocationUseCase,
    private readonly getLocationByIdUseCase: GetLocationByIdUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new location' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  async createLocation(@Body() dto: CreateLocationDto) {
    return this.createLocationUseCase.execute(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get locations (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Locations fetched successfully' })
  async getLocations(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.getLocationsUseCase.execute({
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-location' })
  @ApiResponse({ status: 200, description: 'Location found' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async getLocationById(@Param('id') id: string) {
    return this.getLocationByIdUseCase.execute(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update location by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-location' })
  @ApiBody({ type: UpdateLocationDto })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  async updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.updateLocationUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete location by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-location' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  async deleteLocation(@Param('id') id: string) {
    await this.deleteLocationUseCase.execute(id);
    return { message: 'Location deleted successfully' };
  }
}
