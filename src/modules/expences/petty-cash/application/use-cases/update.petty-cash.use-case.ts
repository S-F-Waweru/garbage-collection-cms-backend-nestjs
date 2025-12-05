import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IPettyCashRepository } from '../../domain/interfaces/petty-cash.repository.interface';
import { UpdatePettyCashDto } from '../dto/petty-cash.dto';

@Injectable()
export class UpdatePettyCashUseCase {
  constructor(
    @Inject(IPettyCashRepository)
    private readonly pettyCashRepository: IPettyCashRepository,
  ) {}

  async execute(id: string, dto: UpdatePettyCashDto) {
    const existingPettyCash = await this.pettyCashRepository.findById(id);
    if (!existingPettyCash) {
      throw new ConflictException('Petty cash record not found');
    }

    existingPettyCash.update({
      name: dto.name,
      totalAmount: dto.totalAmount,
      notes: dto.notes,
    });

    await this.pettyCashRepository.save(existingPettyCash);

    return {
      id: existingPettyCash.id,
      message: 'Petty cash record updated successfully',
    };
  }
}
