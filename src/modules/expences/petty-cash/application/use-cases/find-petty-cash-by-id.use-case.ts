import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPettyCashRepository } from '../../domain/interfaces/petty-cash.repository.interface';

@Injectable()
export class FindPettyCashByIdUseCase {
  constructor(
    @Inject(IPettyCashRepository)
    private readonly pettyCashRepository: IPettyCashRepository,
  ) {}

  async execute(id: string) {
    const pettyCash = await this.pettyCashRepository.findById(id);
    if (!pettyCash) {
      throw new NotFoundException('Petty cash record not found');
    }
    return pettyCash;
  }
}
