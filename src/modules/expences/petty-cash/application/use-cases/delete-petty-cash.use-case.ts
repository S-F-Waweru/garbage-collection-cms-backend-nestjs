import { IPettyCashRepository } from '../../domain/interfaces/petty-cash.repository.interface';
import { ConflictException, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeletePettyCashUseCase {
  constructor(
    @Inject(IPettyCashRepository)
    private readonly pettyCashRepository: IPettyCashRepository,
  ) {}

  async execute(id: string) {
    const existingPettyCash = await this.pettyCashRepository.findById(id);
    if (!existingPettyCash) {
      throw new ConflictException('Petty cash record not found');
    }
    await this.pettyCashRepository.delete(id);
    return {
      message: 'Petty cash record deleted successfully',
    };
  }
}
