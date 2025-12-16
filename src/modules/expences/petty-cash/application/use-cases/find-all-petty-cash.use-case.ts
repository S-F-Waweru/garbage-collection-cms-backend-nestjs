import { Inject, Injectable } from '@nestjs/common';
import { IPettyCashRepository } from '../../domain/interfaces/petty-cash.repository.interface';
import { PaginationParams } from '../../../../clients/client/application/use-cases/find-all-pagiantion.use-case';

@Injectable()
export class FindAllPettyCashUseCase {
  constructor(
    @Inject(IPettyCashRepository)
    private readonly pettyCashRepository: IPettyCashRepository,
  ) {}

  async execute(params: PaginationParams) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [pettyCash, total] = await this.pettyCashRepository.findAllPaginated(
      skip,
      limit,
    );

    return {
      data: pettyCash,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  // const pettyCashes = await this.pettyCashRepository.findAll();
  // if (pettyCashes) {
  //   return pettyCashes;
  // }
  // return [];
  // }
}
