import { Inject, Injectable } from '@nestjs/common';
import { ILocationRepository } from '../../domain/interface/location.repository.inteface';
import { PaginationParams } from '../../../clients/client/application/use-cases/find-all-pagiantion.use-case';

@Injectable()
export class GetLocationListUseCase {
  constructor(
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository,
  ) {}

  async execute(params: PaginationParams = { page: 1, limit: 10 }) {
    const page = Math.max(1, params.page);
    const limit = Math.max(1, params.limit);

    const skip = (page - 1) * limit;

    const [locations, total] = await this.locationRepository.getAllPaginated(
      skip,
      limit,
    );

    return {
      data: locations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
