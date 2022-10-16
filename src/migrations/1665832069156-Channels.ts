import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Channels1665832069156 implements MigrationInterface {
  name = 'Channels1665832069156';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'channels',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            generationStrategy: 'increment',
          },
          {
            name: 'channelId',
            type: 'varchar',
            isNullable: false,
            isUnique: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const channels = await queryRunner.getTable('channels');
    await queryRunner.dropTable(channels);
  }
}
