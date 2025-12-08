import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CreateBuildingDto,
  UpdateBuildingDto,
} from '../application/dto/building.dto';
import { CreateBuildingUseCase } from '../application/use-cases/create-building.use-case';
import { UpdateBuildingUseCase } from '../application/use-cases/update-buiding.use-case';
import { FindBuildingByIdUseCase } from '../application/use-cases/find-building-by-id.use-case';
import { DeleteBuildingUseCase } from '../application/use-cases/delete-building-use.case';
import { FindAllBuildingsUseCase } from '../application/use-cases/find-all-buildings.use-case';
import { FindBulidingsByClientIdUseCase } from '../application/use-cases/find-bulidings-by-client-id.use-case';

@Controller('buildings')
export class BuildingController {
  constructor(
    private readonly createBuildingUseCase: CreateBuildingUseCase,
    private readonly updateBuildingUseCase: UpdateBuildingUseCase,
    private readonly deleteBuildingUseCase: DeleteBuildingUseCase,
    private readonly findBuildingByIdUseCase: FindBuildingByIdUseCase,
    private readonly findAllBuildingsUseCase: FindAllBuildingsUseCase,
    private readonly findClientBuildingsUseCase: FindBulidingsByClientIdUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateBuildingDto) {
    return await this.createBuildingUseCase.execute(dto);
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.findAllBuildingsUseCase.execute({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  }

  @Get('client/:clientId')
  async findClientBuildings(@Param('clientId') clientId: string) {
    return await this.findClientBuildingsUseCase.execute(clientId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.findBuildingByIdUseCase.execute(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBuildingDto) {
    return await this.updateBuildingUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.deleteBuildingUseCase.execute(id);
  }
}
