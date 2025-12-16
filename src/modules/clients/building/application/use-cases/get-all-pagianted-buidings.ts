import { Inject, Injectable } from '@nestjs/common';

import { PaginationParams } from '../../../client/application/use-cases/find-all-pagiantion.use-case';
import { IBuildingRepository } from '../../domain/interface/buidling.repsository.interface';

@Injectable()
export class FindAllPaginatedBuildingsUseCase {
  constructor(
    @Inject(IBuildingRepository) private expenseRepository: IBuildingRepository,
  ) {}

  async execute(params: PaginationParams) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [buildings, total] = await this.expenseRepository.findAllPaginated(
      skip,
      limit,
    );

    return {
      data: buildings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
