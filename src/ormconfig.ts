import { DataSource } from 'typeorm';
import { Channels } from './entity/Channels';
import { Restaurants } from './entity/Restaurants';
import { Users } from './entity/Users';
const dotenv = require('dotenv');

dotenv.config();
export default new DataSource({
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Users, Channels, Restaurants],
  charset: 'utf8mb4',
  logging: true,
  synchronize: false,
  migrations: [__dirname + '/migrations/*.ts'],
});
