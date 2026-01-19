import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${JSON.stringify(createUserDto)}`);
    const createdUser = new this.userModel(createUserDto);
    const savedUser = await createdUser.save();
    this.logger.log(`User created with ID: ${savedUser._id}`);
    return savedUser;
  }

  async findAll(queryDto: QueryUsersDto): Promise<PaginatedResponse<User>> {
    const { name, email, phone, page = 1, limit = 10 } = queryDto;

    const filter: Record<string, any> = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }
    if (phone) {
      filter.phone = { $regex: phone, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    this.logger.log(
      `Fetching users - Page: ${page}, Limit: ${limit}, Filter: ${JSON.stringify(filter)}`,
    );

    const [data, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    this.logger.log(`Found ${data.length} users out of ${total} total`);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`Fetching user with ID: ${id}`);
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      this.logger.warn(`User not found with ID: ${id}`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.logger.log(`User found: ${user.email}`);
    return user;
  }

  async count(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async bulkCreate(users: CreateUserDto[]): Promise<void> {
    await this.userModel.insertMany(users, { ordered: false });
  }
}
