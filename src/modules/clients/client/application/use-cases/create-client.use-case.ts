import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Client } from '../../domain/entities/client.entity';
import { IClientRepository } from '../../domain/interface/client.repository.interface';
import { Building } from '../../../building/domain/building.entity';
import { IBuildingRepository } from '../../../building/domain/interface/buidling.repsository.interface';
import { ILocationRepository } from '../../../../location/domain/interface/location.repository.inteface';
import { CreateClientDto } from '../dtos/client.dto';
import { ClientCredit } from 'src/modules/client-credit/domain/client-credit.entity';
import { ICreditClientRepository } from 'src/modules/client-credit/domain/client_credit.repository.interfacace';
import {
  Invoice,
} from 'src/modules/invoices/domain/invoice.entity';
import { IInvoiceRepository } from 'src/modules/invoices/domain/invoice.repository.intreface';
import { SystemUserService } from 'src/modules/auth/application/services/system-user.service';
import { InvoiceStatus } from 'src/modules/invoices/application/models';

@Injectable()
export class CreateClientUseCase {
  private readonly logger = new Logger(CreateClientUseCase.name);

  constructor(
    @Inject(IClientRepository)
    private readonly clientRepository: IClientRepository,
    @Inject(IBuildingRepository)
    private readonly buildingRepository: IBuildingRepository,
    @Inject(ILocationRepository)
    private readonly locationRepository: ILocationRepository,
    @Inject(ICreditClientRepository)
    private readonly creditRepository: ICreditClientRepository,
    @Inject(IInvoiceRepository)
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject(SystemUserService)
    private readonly systemUserService: SystemUserService,
  ) {}

  async execute(dto: CreateClientDto): Promise<Client> {
    const existing = await this.clientRepository.findByKRAPin(dto.KRAPin);
    if (existing) {
      throw new ConflictException('User with this KRAPin exists');
    }

    // Create the client
    this.logger.debug(dto);
    const client = Client.create({
      companyName: dto.companyName,
      KRAPin: dto.KRAPin,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      paymentMethod: dto.paymentMethod,
      buildings: [],
    });

    // Save the client first to get an ID
    const savedClient = await this.clientRepository.save(client);
    console.log(savedClient);
    this.logger.debug(savedClient);

    // Set billing date to today
    const today = new Date();
    savedClient.setBillingDate(today);
    await this.clientRepository.save(savedClient);

    // Create client credit with 0 balance
    const credit = ClientCredit.create({
      client: savedClient,
      balance: 0,
    });
    await this.creditRepository.save(credit);

    // Variables to track totals for invoice
    let totalActiveUnits = 0; // Changed from totalUnits
    let totalAmount = 0;

    // If buildings are provided, create and save them
    if (dto.buildings && dto.buildings.length > 0) {
      const buildingPromises = dto.buildings.map(async (buildingDto) => {
        const locationID = buildingDto.locationId;

        // Find location by ID
        const location = await this.locationRepository.findById(locationID);
        if (!location) {
          throw new NotFoundException(
            `Location with ID ${locationID} not found`,
          );
        }

        this.logger.debug('BUILDING DTO', buildingDto);

        // Create building
        const building = Building.create({
          name: buildingDto.name,
          location,
          client: savedClient,
          unitPrice: buildingDto.unitPrice,
          unitCount: buildingDto.unitCount,
          binsAssigned: buildingDto.binsAssigned,
          activeUnits: buildingDto.activeUnits,
        });

        this.logger.debug('SAVED BUILDING', building);

        // Add to totals - ONLY count active units for invoice
        totalActiveUnits += buildingDto.activeUnits; // Changed from unitCount
        totalAmount += buildingDto.activeUnits * buildingDto.unitPrice;

        // Save and return the building
        return this.buildingRepository.save(building);
      });

      // Wait for all buildings to be saved
      const savedBuildings = await Promise.all(buildingPromises);
      this.logger.debug(savedBuildings);

      const systemUser = await this.systemUserService.ensureSystemUserExists();

      // Generate first invoice after buildings are created
      const invoiceNumber = await this.invoiceRepository.getNextInvoiceNumber();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 30);

      // Calculate average unit price based on ACTIVE units, not total units
      const averageUnitPrice =
        totalActiveUnits > 0 ? totalAmount / totalActiveUnits : 0;

      // Round to 2 decimal places for currency
      const roundedAverageUnitPrice = Math.round(averageUnitPrice * 100) / 100;

      // Use the helper method from Invoice entity to ensure proper calculations

      const firstInvoice = Invoice.create({
        invoiceNumber,
        clientId: savedClient.id,
        billingPeriodStart: today,
        billingPeriodEnd: endOfMonth,
        invoiceDate: today,
        dueDate,
        activeUnits: totalActiveUnits, // Changed from unitCount
        unitPrice: roundedAverageUnitPrice,
        subtotal: Math.round(totalAmount * 100) / 100, // Ensure 2 decimal places
        creditApplied: 0,
        totalAmount: Math.round(totalAmount * 100) / 100,
        amountPaid: 0,
        balance: Math.round(totalAmount * 100) / 100,
        status: InvoiceStatus.PENDING,
        notes: 'Initial invoice generated on client creation',
        createdBy: systemUser.id,
      });

      await this.invoiceRepository.save(firstInvoice);
      this.logger.debug('First invoice created:', firstInvoice);
    }

    // Return the client (reload with buildings)
    const clientWithBuildings = await this.clientRepository.findById(
      savedClient.id,
    );
    this.logger.debug(clientWithBuildings);

    if (!clientWithBuildings) {
      throw new NotFoundException('Client not found after creation');
    }

    this.logger.debug(clientWithBuildings);
    return clientWithBuildings;
  }
}
