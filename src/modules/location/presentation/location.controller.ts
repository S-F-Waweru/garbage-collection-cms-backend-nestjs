import {
  CreateLocationDto,
  UpdateLocationDto,
} from '../application/dto/location.dto';
import { CreateNewLocationUseCase } from '../application/use-cases/create-new-location.use-case';
import { GetLocationListUseCase } from '../application/use-cases/get-location-list.use-case';
import { UpdateLocationUseCase } from '../application/use-cases/update-location.use-case';
import { DeleteLocationUseCase } from '../application/use-cases/delete-location.use-case';
import { GetLocationByIdUseCase } from '../application/use-cases/get-location.by-id.use-case';
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
} from '@nestjs/common';

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
  @HttpCode(HttpStatus.CREATED) // 201 Created
  async createLocation(@Body() dto: CreateLocationDto) {
    return await this.createLocationUseCase.execute(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK) // 200 OK
  async getLocations() {
    return await this.getLocationsUseCase.execute();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK) // 200 OK
  async getLocationById(@Param('id') id: string) {
    return await this.getLocationByIdUseCase.execute(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK) // 200 OK
  async updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return await this.updateLocationUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) // 200 OK
  async deleteLocation(@Param('id') id: string) {
    await this.deleteLocationUseCase.execute(id);
    return { message: 'Location deleted successfully' };
  }
}
