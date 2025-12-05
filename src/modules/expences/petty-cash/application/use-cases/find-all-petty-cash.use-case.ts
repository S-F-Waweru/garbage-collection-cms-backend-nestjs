import { Inject, Injectable } from '@nestjs/common';
import { IPettyCashRepository } from '../../domain/interfaces/petty-cash.repository.interface';

@Injectable()
export class FindAllPettyCashUseCase {
  constructor(
    @Inject(IPettyCashRepository)
    private readonly pettyCashRepository: IPettyCashRepository,
  ) {}

  async execute() {
    const pettyCashes = await this.pettyCashRepository.findAll();
    if (pettyCashes) {
      return pettyCashes;
    }
    return [];
  }
}
