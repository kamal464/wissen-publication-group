import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'kamaldb',
  database: 'universal_publishers',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true, // Set to false in production
};