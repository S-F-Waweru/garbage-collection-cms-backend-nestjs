import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreatePettyCashUseCase } from '../application/use-cases/create-petty-cash.use-case';
import { FindAllPettyCashUseCase } from '../application/use-cases/find-all-petty-cash.use-case';
import { FindPettyCashByIdUseCase } from '../application/use-cases/find-petty-cash-by-id.use-case';
import { UpdatePettyCashUseCase } from '../application/use-cases/update.petty-cash.use-case';
import { DeletePettyCashUseCase } from '../application/use-cases/delete-petty-cash.use-case';
import { CurrentUser } from '../../../../shared/decorators/current-user.decorator';
import {
  CreatePettyCashDto,
  UpdatePettyCashDto,
} from '../application/dto/petty-cash.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

export interface CurrentUserDto {
  userId: string;
  email?: string;
}

@Controller('petty-cash')
export class PettyCashController {
  constructor(
    private readonly createPettyCashUseCase: CreatePettyCashUseCase,
    private readonly findAllPettyCashUseCase: FindAllPettyCashUseCase,
    private readonly findPettyCashByIdUseCase: FindPettyCashByIdUseCase,
    private readonly updatePettyCashUseCase: UpdatePettyCashUseCase,
    private readonly deletePettyCashUseCase: DeletePettyCashUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPettyCash(
    @CurrentUser() user: CurrentUserDto,
    @Body() createPettyCashDto: CreatePettyCashDto,
  ) {
    return this.createPettyCashUseCase.execute(user.userId, createPettyCashDto);
  }

  @Put(':id')
  async updatePettyCash(
    @Param('id') id: string,
    @Body() updatePettyCashDto: UpdatePettyCashDto,
  ) {
    return this.updatePettyCashUseCase.execute(id, updatePettyCashDto);
  }

  @Get(':id')
  async getPettyCash(@Param('id') id: string) {
    return this.findPettyCashByIdUseCase.execute(id);
  }

  @Get()
  async getAllPettyCash() {
    return this.findAllPettyCashUseCase.execute();
  }

  @Delete(':id')
  async deletePettyCash(@Param('id') id: string) {
    return this.deletePettyCashUseCase.execute(id);
  }
}
