// application/use-cases/update-user.usecase.ts
import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import {UpdateUserDto} from "../dto/auth.request.dto";
import {IAuthRepository} from "../../domain/interfaces/auth.repository.interface";


@Injectable()
export class UpdateUserUseCase {
    constructor(
        @Inject(IAuthRepository)
        private readonly userRepository: IAuthRepository
    ) {}

    async execute(userId: string, dto: UpdateUserDto) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.update(
          dto.firstName,
           dto.lastName,
        );

         await this.userRepository.save(user);

         return {
             message : "User updated successfully"
         }
    }
}