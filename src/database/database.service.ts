import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { faker } from '@faker-js/faker';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly SEED_ENABLED: boolean;
  private readonly TOTAL_USERS: number;
  private readonly BATCH_SIZE: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.SEED_ENABLED = this.configService.get<boolean>('SEED_ENABLED', true);
    this.TOTAL_USERS = this.configService.get<number>(
      'SEED_TOTAL_USERS',
      2_000_000,
    );
    this.BATCH_SIZE = this.configService.get<number>('SEED_BATCH_SIZE', 10_000);
  }

  async onModuleInit(): Promise<void> {
    await this.seedDatabase();
  }

  private async seedDatabase(): Promise<void> {
    try {
      if (!this.SEED_ENABLED) {
        this.logger.log('Database seeding is disabled via SEED_ENABLED flag');
        return;
      }

      const userCount = await this.usersService.count();

      if (userCount > 0) {
        this.logger.log(
          `Database already contains ${userCount} users. Skipping seeding.`,
        );
        return;
      }

      this.logger.log(
        `Starting database seeding with ${this.TOTAL_USERS} users (batch size: ${this.BATCH_SIZE})`,
      );

      const totalBatches = Math.ceil(this.TOTAL_USERS / this.BATCH_SIZE);

      for (let batch = 0; batch < totalBatches; batch++) {
        const users = this.generateUsers(this.BATCH_SIZE);

        try {
          await this.usersService.bulkCreate(users);
        } catch (batchError: unknown) {
          this.logger.error(
            `Failed to insert batch ${batch + 1}/${totalBatches}`,
            batchError instanceof Error ? batchError.stack : String(batchError),
          );
          throw batchError;
        }

        const processedUsers = (batch + 1) * this.BATCH_SIZE;
        const progress = ((processedUsers / this.TOTAL_USERS) * 100).toFixed(2);

        this.logger.log(
          `Batch ${batch + 1}/${totalBatches} completed. Progress: ${progress}%`,
        );
      }

      this.logger.log('Database seeding completed successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Database seeding failed: ${error.message}`,
          error.stack,
        );
      }
      throw error;
    }
  }

  private generateUsers(count: number): CreateUserDto[] {
    return Array.from(
      { length: count },
      (): CreateUserDto => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: String(faker.phone.number()),
        dateOfBirth: faker.date
          .birthdate({ min: 18, max: 80, mode: 'age' })
          .toISOString(),
      }),
    );
  }
}
