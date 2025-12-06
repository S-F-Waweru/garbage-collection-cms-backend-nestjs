import { Inject, Injectable } from '@nestjs/common';
import { IPettyCashRepository } from '../../domain/interfaces/petty-cash.repository.interface';
import { CreatePettyCashDto } from '../dto/petty-cash.dto';
import { PettyCash } from '../../domain/petty-cash.entity';

@Injectable()
export class CreatePettyCashUseCase {
  constructor(
    @Inject(IPettyCashRepository)
    private readonly pettyCashRepository: IPettyCashRepository,
  ) {}

  async execute(userId: string, dto: CreatePettyCashDto) {
    const pettyCash = PettyCash.create(
      dto.name,
      dto.totalAmount,
      userId,
      dto.notes ?? '',
    );

    console.log(`DEGUG+++++++++++++++++++++++++++++++++++`);
    console.log(pettyCash);

    const newPettyCash = await this.pettyCashRepository.save(pettyCash);

    return {
      id: newPettyCash.id,
      message: 'Petty cash record created successfully',
    };
  }
}
