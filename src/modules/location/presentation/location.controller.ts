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
import { UseRoles } from 'nest-access-control';

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
import { GetRawLocationsUSecase } from '../application/use-cases/getRawLocation.usecase';

@ApiTags('Locations')
@Controller('locations')
export class LocationController {
  constructor(
      private readonly createLocationUseCase: CreateNewLocationUseCase,
      private readonly getLocationsUseCase: GetLocationListUseCase,
      private readonly updateLocationUseCase: UpdateLocationUseCase,
      private readonly deleteLocationUseCase: DeleteLocationUseCase,
      private readonly getLocationByIdUseCase: GetLocationByIdUseCase,
      private readonly getRawLocationUseCase: GetRawLocationsUSecase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseRoles({
    resource: 'expenses',
    action: 'create',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Create a new location' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  async createLocation(@Body() dto: CreateLocationDto) {
    return this.createLocationUseCase.execute(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseRoles({
    resource: 'expenses',
    action: 'read',
    possession: 'any',
  })
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

  @Get('raw')
  @HttpCode(HttpStatus.OK)
  @UseRoles({
    resource: 'expenses',
    action: 'read',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Get locations No Pagination)' })
  @ApiResponse({ status: 200, description: 'Locations fetched successfully' })
  async getLocationsNoPagiantion() {
    return this.getRawLocationUseCase.execute();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseRoles({
    resource: 'expenses',
    action: 'read',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Get location by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-location' })
  @ApiResponse({ status: 200, description: 'Location found' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  async getLocationById(@Param('id') id: string) {
    return this.getLocationByIdUseCase.execute(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UseRoles({
    resource: 'expenses',
    action: 'update',
    possession: 'any',
  })
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
  @UseRoles({
    resource: 'expenses',
    action: 'delete',
    possession: 'any',
  })
  @ApiOperation({ summary: 'Delete location by ID' })
  @ApiParam({ name: 'id', example: 'uuid-of-location' })
  @ApiResponse({ status: 200, description: 'Location deleted successfully' })
  async deleteLocation(@Param('id') id: string) {
    await this.deleteLocationUseCase.execute(id);
    return { message: 'Location deleted successfully' };
  }
}